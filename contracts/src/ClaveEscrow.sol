// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ClaveEscrow
 * @notice Trustless escrow for web3 work payments. Deposits USDC, auto-releases on deadline
 *         or milestone approval. Handles disputes and late penalties.
 */
contract ClaveEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ──────────────────────── STRUCTS ────────────────────────

    enum ProjectStatus { Active, Completed, Disputed, Cancelled }

    struct Milestone {
        string  description;
        uint256 amount;
        uint256 deadline;       // unix timestamp
        bool    approved;
        bool    submitted;
        bool    released;
    }

    struct Project {
        address       client;
        address       worker;
        uint256       totalBudget;
        uint256       depositedAmount;
        uint256       releasedAmount;
        uint256       penaltyReserve;
        uint256       createdAt;
        uint256       deadline;           // overall project deadline
        ProjectStatus status;
        string        metadataURI;        // off-chain metadata (IPFS)
        uint256       milestoneCount;
    }

    // ──────────────────────── STATE ────────────────────────

    IERC20 public immutable usdc;

    uint256 public nextProjectId = 1;

    mapping(uint256 => Project) public projects;
    mapping(uint256 => Milestone[]) public milestones; // projectId => milestones
    mapping(uint256 => mapping(uint256 => bool)) public disputeRaised; // projectId => milestoneIdx

    // Penalty parameters
    uint256 public constant PENALTY_BPS_PER_DAY = 50;  // 0.5% per day (50 bps)
    uint256 public constant MAX_PENALTY_BPS = 1500;    // max 15% penalty
    uint256 public constant DISPUTE_WINDOW = 3 days;   // client has 3 days to dispute after submission
    uint256 public constant AUTO_RELEASE_WINDOW = 7 days; // auto-release if no dispute

    // Fees
    uint256 public platformFeeBps = 100; // 1% platform fee
    address public feeRecipient;

    // ──────────────────────── EVENTS ────────────────────────

    event ProjectCreated(uint256 indexed projectId, address indexed client, address indexed worker, uint256 totalBudget, uint256 deadline);
    event FundsDeposited(uint256 indexed projectId, uint256 amount, uint256 totalDeposited);
    event MilestoneAdded(uint256 indexed projectId, uint256 milestoneIndex, string description, uint256 amount, uint256 deadline);
    event MilestoneSubmitted(uint256 indexed projectId, uint256 milestoneIndex);
    event MilestoneApproved(uint256 indexed projectId, uint256 milestoneIndex);
    event FundsReleased(uint256 indexed projectId, uint256 milestoneIndex, address indexed worker, uint256 amount);
    event PenaltyApplied(uint256 indexed projectId, uint256 daysLate, uint256 penaltyAmount);
    event DisputeRaised(uint256 indexed projectId, uint256 milestoneIndex, address indexed raisedBy, string evidence);
    event DisputeResolved(uint256 indexed projectId, uint256 milestoneIndex, address indexed winner);
    event ProjectCancelled(uint256 indexed projectId, uint256 refundedAmount);

    // ──────────────────────── CONSTRUCTOR ────────────────────────

    constructor(address _usdc, address _feeRecipient) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        usdc = IERC20(_usdc);
        feeRecipient = _feeRecipient;
    }

    // ──────────────────────── MODIFIERS ────────────────────────

    modifier onlyClient(uint256 _projectId) {
        require(msg.sender == projects[_projectId].client, "Not client");
        _;
    }

    modifier onlyWorker(uint256 _projectId) {
        require(msg.sender == projects[_projectId].worker, "Not worker");
        _;
    }

    modifier onlyClientOrWorker(uint256 _projectId) {
        require(
            msg.sender == projects[_projectId].client ||
            msg.sender == projects[_projectId].worker,
            "Not client or worker"
        );
        _;
    }

    modifier projectExists(uint256 _projectId) {
        require(projects[_projectId].client != address(0), "Project does not exist");
        _;
    }

    // ──────────────────────── CORE FUNCTIONS ────────────────────────

    /**
     * @notice Create a new project with a worker
     * @param _worker Worker's wallet address
     * @param _totalBudget Total project budget in USDC (6 decimals)
     * @param _deadline Overall project deadline (unix timestamp)
     * @param _metadataURI IPFS URI for project metadata
     */
    function createProject(
        address _worker,
        uint256 _totalBudget,
        uint256 _deadline,
        string calldata _metadataURI
    ) external returns (uint256 projectId) {
        require(_worker != address(0) && _worker != msg.sender, "Invalid worker address");
        require(_totalBudget > 0, "Budget must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        projectId = nextProjectId++;

        projects[projectId] = Project({
            client: msg.sender,
            worker: _worker,
            totalBudget: _totalBudget,
            depositedAmount: 0,
            releasedAmount: 0,
            penaltyReserve: 0,
            createdAt: block.timestamp,
            deadline: _deadline,
            status: ProjectStatus.Active,
            metadataURI: _metadataURI,
            milestoneCount: 0
        });

        emit ProjectCreated(projectId, msg.sender, _worker, _totalBudget, _deadline);
    }

    /**
     * @notice Add a milestone to a project
     * @param _projectId Project ID
     * @param _description Milestone description
     * @param _amount Amount for this milestone (6 decimals USDC)
     * @param _deadline Deadline for this milestone
     */
    function addMilestone(
        uint256 _projectId,
        string calldata _description,
        uint256 _amount,
        uint256 _deadline
    ) external onlyClient(_projectId) projectExists(_projectId) {
        Project storage proj = projects[_projectId];
        require(proj.status == ProjectStatus.Active, "Project not active");
        require(_amount > 0, "Amount must be > 0");
        require(_deadline > block.timestamp, "Deadline in the future");
        require(_deadline <= proj.deadline, "Milestone deadline <= project deadline");

        // Validate total milestones don't exceed budget
        uint256 totalMilestoneAmount = _amount;
        for (uint256 i = 0; i < milestones[_projectId].length; i++) {
            totalMilestoneAmount += milestones[_projectId][i].amount;
        }
        require(totalMilestoneAmount <= proj.totalBudget, "Exceeds total budget");

        milestones[_projectId].push(Milestone({
            description: _description,
            amount: _amount,
            deadline: _deadline,
            approved: false,
            submitted: false,
            released: false
        }));

        proj.milestoneCount++;
        emit MilestoneAdded(_projectId, proj.milestoneCount - 1, _description, _amount, _deadline);
    }

    /**
     * @notice Deposit USDC into the project escrow
     * @param _projectId Project ID
     * @param _amount Amount to deposit (6 decimals)
     */
    function deposit(uint256 _projectId, uint256 _amount)
        external
        onlyClient(_projectId)
        projectExists(_projectId)
        nonReentrant
    {
        Project storage proj = projects[_projectId];
        require(proj.status == ProjectStatus.Active, "Project not active");
        require(_amount > 0, "Amount must be > 0");
        require(
            proj.depositedAmount + _amount <= proj.totalBudget,
            "Exceeds total budget"
        );

        usdc.safeTransferFrom(msg.sender, address(this), _amount);
        proj.depositedAmount += _amount;

        emit FundsDeposited(_projectId, _amount, proj.depositedAmount);
    }

    /**
     * @notice Worker submits milestone completion evidence
     * @param _projectId Project ID
     * @param _milestoneIndex Index of the milestone
     */
    function submitMilestone(uint256 _projectId, uint256 _milestoneIndex)
        external
        onlyWorker(_projectId)
        projectExists(_projectId)
    {
        Project storage proj = projects[_projectId];
        require(proj.status == ProjectStatus.Active, "Project not active");
        require(_milestoneIndex < proj.milestoneCount, "Invalid milestone index");

        Milestone storage ms = milestones[_projectId][_milestoneIndex];
        require(!ms.submitted, "Already submitted");
        require(!ms.released, "Already released");
        require(block.timestamp <= ms.deadline, "Milestone deadline passed");

        ms.submitted = true;
        emit MilestoneSubmitted(_projectId, _milestoneIndex);
    }

    /**
     * @notice Client approves a milestone, releasing funds to worker
     * @param _projectId Project ID
     * @param _milestoneIndex Index of the milestone
     */
    function approveMilestone(uint256 _projectId, uint256 _milestoneIndex)
        external
        onlyClient(_projectId)
        projectExists(_projectId)
        nonReentrant
    {
        Project storage proj = projects[_projectId];
        require(proj.status == ProjectStatus.Active, "Project not active");
        require(_milestoneIndex < proj.milestoneCount, "Invalid milestone index");

        Milestone storage ms = milestones[_projectId][_milestoneIndex];
        require(ms.submitted, "Not submitted yet");
        require(!ms.approved, "Already approved");
        require(!ms.released, "Already released");

        _releaseMilestone(_projectId, _milestoneIndex);
    }

    /**
     * @notice Auto-release milestone funds after deadline passes without dispute
     *         Anyone can call this after the auto-release window
     * @param _projectId Project ID
     * @param _milestoneIndex Index of the milestone
     */
    function autoRelease(uint256 _projectId, uint256 _milestoneIndex)
        external
        projectExists(_projectId)
        nonReentrant
    {
        Project storage proj = projects[_projectId];
        require(proj.status == ProjectStatus.Active, "Project not active");
        require(_milestoneIndex < proj.milestoneCount, "Invalid milestone index");

        Milestone storage ms = milestones[_projectId][_milestoneIndex];
        require(ms.submitted, "Not submitted yet");
        require(!ms.released, "Already released");
        require(!disputeRaised[_projectId][_milestoneIndex], "Dispute active");

        // Auto-release window: submission time + AUTO_RELEASE_WINDOW
        require(
            block.timestamp >= ms.deadline + AUTO_RELEASE_WINDOW,
            "Auto-release window not reached"
        );

        _releaseMilestone(_projectId, _milestoneIndex);
    }

    /**
     * @notice Raise a dispute on a milestone
     * @param _projectId Project ID
     * @param _milestoneIndex Index of the milestone
     * @param _evidence IPFS URI for dispute evidence
     */
    function raiseDispute(
        uint256 _projectId,
        uint256 _milestoneIndex,
        string calldata _evidence
    ) external onlyClientOrWorker(_projectId) projectExists(_projectId) {
        Project storage proj = projects[_projectId];
        require(proj.status == ProjectStatus.Active, "Project not active");
        require(_milestoneIndex < proj.milestoneCount, "Invalid milestone index");

        Milestone storage ms = milestones[_projectId][_milestoneIndex];
        require(ms.submitted, "Not submitted yet");
        require(!ms.released, "Already released");
        require(!disputeRaised[_projectId][_milestoneIndex], "Dispute already raised");

        // Can only dispute within dispute window after submission
        require(
            block.timestamp <= ms.deadline + DISPUTE_WINDOW,
            "Dispute window closed"
        );

        proj.status = ProjectStatus.Disputed;
        disputeRaised[_projectId][_milestoneIndex] = true;

        emit DisputeRaised(_projectId, _milestoneIndex, msg.sender, _evidence);
    }

    /**
     * @notice Resolve a dispute (called by authorized resolver)
     * @param _projectId Project ID
     * @param _milestoneIndex Index of the milestone
     * @param _favorWorker If true, funds go to worker; if false, refund to client
     */
    function resolveDispute(
        uint256 _projectId,
        uint256 _milestoneIndex,
        bool _favorWorker
    ) external projectExists(_projectId) nonReentrant {
        // In MVP, only fee recipient can resolve disputes
        // Phase 2: community arbitration with staking
        require(msg.sender == feeRecipient, "Not authorized resolver");
        require(
            disputeRaised[_projectId][_milestoneIndex],
            "No active dispute"
        );

        Project storage proj = projects[_projectId];
        require(proj.status == ProjectStatus.Disputed, "Project not disputed");

        Milestone storage ms = milestones[_projectId][_milestoneIndex];

        if (_favorWorker) {
            _releaseMilestone(_projectId, _milestoneIndex);
        } else {
            // Refund to client — milestone rejected
            ms.released = true; // mark as resolved
        }

        proj.status = ProjectStatus.Active;
        emit DisputeResolved(_projectId, _milestoneIndex, _favorWorker ? proj.worker : proj.client);
    }

    /**
     * @notice Cancel a project and refund remaining deposited funds
     * @param _projectId Project ID
     */
    function cancelProject(uint256 _projectId)
        external
        onlyClient(_projectId)
        projectExists(_projectId)
        nonReentrant
    {
        Project storage proj = projects[_projectId];
        require(proj.status == ProjectStatus.Active, "Project not active");

        proj.status = ProjectStatus.Cancelled;

        // Calculate refund (deposited - released)
        uint256 refundAmount = proj.depositedAmount - proj.releasedAmount;
        if (refundAmount > 0) {
            proj.releasedAmount += refundAmount;
            usdc.safeTransfer(proj.client, refundAmount);
        }

        emit ProjectCancelled(_projectId, refundAmount);
    }

    // ──────────────────────── VIEW FUNCTIONS ────────────────────────

    function getMilestoneCount(uint256 _projectId) external view returns (uint256) {
        return projects[_projectId].milestoneCount;
    }

    function getMilestone(uint256 _projectId, uint256 _milestoneIndex)
        external
        view
        returns (Milestone memory)
    {
        return milestones[_projectId][_milestoneIndex];
    }

    function getProject(uint256 _projectId) external view returns (Project memory) {
        return projects[_projectId];
    }

    function calculatePenalty(uint256 _projectId) external view returns (uint256 penaltyBps, uint256 penaltyAmount) {
        Project storage proj = projects[_projectId];
        if (proj.status != ProjectStatus.Active || proj.deadline >= block.timestamp) {
            return (0, 0);
        }

        uint256 daysLate = (block.timestamp - proj.deadline) / 1 days;
        penaltyBps = daysLate * PENALTY_BPS_PER_DAY;
        if (penaltyBps > MAX_PENALTY_BPS) {
            penaltyBps = MAX_PENALTY_BPS;
        }

        uint256 unreleasedAmount = proj.depositedAmount - proj.releasedAmount;
        penaltyAmount = (unreleasedAmount * penaltyBps) / 10_000;
    }

    // ──────────────────────── INTERNAL ────────────────────────

    function _releaseMilestone(uint256 _projectId, uint256 _milestoneIndex) internal {
        Project storage proj = projects[_projectId];
        Milestone storage ms = milestones[_projectId][_milestoneIndex];

        require(proj.depositedAmount > proj.releasedAmount, "No funds to release");

        ms.approved = true;
        ms.released = true;

        uint256 releaseAmount = ms.amount;
        uint256 fee = (releaseAmount * platformFeeBps) / 10_000;
        uint256 workerAmount = releaseAmount - fee;

        proj.releasedAmount += releaseAmount;

        // Transfer to worker
        usdc.safeTransfer(proj.worker, workerAmount);

        // Transfer platform fee
        if (fee > 0) {
            usdc.safeTransfer(feeRecipient, fee);
        }

        emit FundsReleased(_projectId, _milestoneIndex, proj.worker, workerAmount);
        if (fee > 0) {
            // Penalty reserve for late payments
            if (block.timestamp > ms.deadline) {
                uint256 daysLate = (block.timestamp - ms.deadline) / 1 days;
                uint256 penaltyBps = daysLate * PENALTY_BPS_PER_DAY;
                if (penaltyBps > MAX_PENALTY_BPS) {
                    penaltyBps = MAX_PENALTY_BPS;
                }
                uint256 penaltyAmount = (releaseAmount * penaltyBps) / 10_000;
                if (penaltyAmount > 0 && penaltyAmount <= proj.totalBudget - proj.releasedAmount) {
                    proj.penaltyReserve += penaltyAmount;
                    proj.releasedAmount += penaltyAmount;
                    // Penalty goes to worker as compensation
                    usdc.safeTransfer(proj.worker, penaltyAmount);
                    emit PenaltyApplied(_projectId, daysLate, penaltyAmount);
                }
            }
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ClaveReputation
 * @notice Onchain reputation system for web3 workers and clients.
 *         Tracks completions, disputes, and generates portable reputation scores.
 */
contract ClaveReputation {

    // ──────────────────────── STRUCTS ────────────────────────

    struct Reputation {
        uint256 totalProjects;
        uint256 completedProjects;
        uint256 disputedProjects;
        uint256 totalVolumeUSDC;       // total USDC handled (6 decimals)
        uint256 avgPaymentTimeHours;   // average time from submission to payment
        uint256 lastActive;
        uint256 score;                 // computed reputation score (0-10000 = 0-100.00%)
        bool    isVerified;
    }

    struct ProjectRecord {
        uint256 projectId;
        uint256 amount;
        uint256 completedAt;
        bool    wasDisputed;
        bool    wasResolvedInFavor;    // true = won dispute, false = lost
    }

    // ──────────────────────── STATE ────────────────────────

    address public admin;
    mapping(address => bool) public authorizedCallers;

    mapping(address => Reputation) public reputation;
    mapping(address => ProjectRecord[]) public projectHistory;

    // Score weights
    uint256 public constant COMPLETION_WEIGHT = 4000;    // 40%
    uint256 public constant VOLUME_WEIGHT = 2500;         // 25%
    uint256 public constant PAYMENT_SPEED_WEIGHT = 2000;  // 20%
    uint256 public constant DISPUTE_PENALTY = 1500;       // -15% per dispute lost

    uint256 public constant MAX_SCORE = 10000;            // 100.00%

    // ──────────────────────── EVENTS ────────────────────────

    event ReputationUpdated(address indexed account, uint256 newScore);
    event ProjectRecorded(address indexed account, uint256 projectId, uint256 amount, bool wasDisputed);
    event AccountVerified(address indexed account);
    event AccountUnverified(address indexed account);

    // ──────────────────────── CONSTRUCTOR ────────────────────────

    constructor() {
        admin = msg.sender;
    }

    // ──────────────────────── MODIFIERS ────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == admin || authorizedCallers[msg.sender], "Not authorized");
        _;
    }

    // ──────────────────────── ADMIN FUNCTIONS ────────────────────────

    function setAuthorizedCaller(address _caller, bool _authorized) external onlyAdmin {
        authorizedCallers[_caller] = _authorized;
    }

    // ──────────────────────── CORE FUNCTIONS ────────────────────────

    /**
     * @notice Record a completed project for a worker
     * @param _worker Worker's address
     * @param _projectId Project ID
     * @param _amount USDC amount handled
     * @param _paymentTimeHours Hours from submission to payment (0 if auto-released)
     */
    function recordCompletion(
        address _worker,
        uint256 _projectId,
        uint256 _amount,
        uint256 _paymentTimeHours
    ) external onlyAuthorized {
        // In production, this should be called by ClaveEscrow contract
        // For MVP, admin can call directly
        require(msg.sender == admin, "Not authorized");

        Reputation storage rep = reputation[_worker];

        rep.totalProjects++;
        rep.completedProjects++;
        rep.totalVolumeUSDC += _amount;
        rep.lastActive = block.timestamp;

        // Update average payment time
        if (rep.completedProjects == 1) {
            rep.avgPaymentTimeHours = _paymentTimeHours;
        } else {
            rep.avgPaymentTimeHours = (
                (rep.avgPaymentTimeHours * (rep.completedProjects - 1)) + _paymentTimeHours
            ) / rep.completedProjects;
        }

        projectHistory[_worker].push(ProjectRecord({
            projectId: _projectId,
            amount: _amount,
            completedAt: block.timestamp,
            wasDisputed: false,
            wasResolvedInFavor: false
        }));

        _recalculateScore(_worker);
    }

    /**
     * @notice Record a dispute outcome
     * @param _account Account involved
     * @param _projectId Project ID
     * @param _favorAccount True if dispute was resolved in favor of this account
     */
    function recordDispute(
        address _account,
        uint256 _projectId,
        bool _favorAccount
    ) external onlyAuthorized {
        require(msg.sender == admin, "Not authorized");

        Reputation storage rep = reputation[_account];
        rep.disputedProjects++;

        // Find and update the project record
        ProjectRecord[] storage records = projectHistory[_account];
        for (uint256 i = 0; i < records.length; i++) {
            if (records[i].projectId == _projectId) {
                records[i].wasDisputed = true;
                records[i].wasResolvedInFavor = _favorAccount;
                break;
            }
        }

        _recalculateScore(_account);
    }

    /**
     * @notice Verify an account (KYC, identity verification)
     * @param _account Account to verify
     */
    function verifyAccount(address _account) external onlyAdmin {
        reputation[_account].isVerified = true;
        emit AccountVerified(_account);
    }

    /**
     * @notice Unverify an account
     * @param _account Account to unverify
     */
    function unverifyAccount(address _account) external onlyAdmin {
        reputation[_account].isVerified = false;
        emit AccountUnverified(_account);
    }

    // ──────────────────────── VIEW FUNCTIONS ────────────────────────

    /**
     * @notice Get full reputation data for an account
     */
    function getReputation(address _account) external view returns (Reputation memory) {
        return reputation[_account];
    }

    /**
     * @notice Get reputation score as a percentage (0-10000 = 0.00%-100.00%)
     */
    function getScore(address _account) external view returns (uint256) {
        return reputation[_account].score;
    }

    /**
     * @notice Get formatted score as string (e.g., "85.50")
     */
    function getFormattedScore(address _account) external view returns (string memory) {
        uint256 score = reputation[_account].score;
        uint256 whole = score / 100;
        uint256 decimal = score % 100;

        return string(abi.encodePacked(
            _toString(whole),
            ".",
            decimal < 10 ? "0" : "",
            _toString(decimal)
        ));
    }

    /**
     * @notice Check if account is verified
     */
    function isVerified(address _account) external view returns (bool) {
        return reputation[_account].isVerified;
    }

    /**
     * @notice Get project history for an account
     */
    function getProjectHistory(address _account) external view returns (ProjectRecord[] memory) {
        return projectHistory[_account];
    }

    /**
     * @notice Get completion rate (0-10000 = 0%-100%)
     */
    function getCompletionRate(address _account) external view returns (uint256) {
        Reputation storage rep = reputation[_account];
        if (rep.totalProjects == 0) return 0;
        return (rep.completedProjects * 10000) / rep.totalProjects;
    }

    /**
     * @notice Get dispute rate (0-10000 = 0%-100%)
     */
    function getDisputeRate(address _account) external view returns (uint256) {
        Reputation storage rep = reputation[_account];
        if (rep.totalProjects == 0) return 0;
        return (rep.disputedProjects * 10000) / rep.totalProjects;
    }

    // ──────────────────────── INTERNAL ────────────────────────

    function _recalculateScore(address _account) internal {
        Reputation storage rep = reputation[_account];
        uint256 score = 0;

        // Completion rate score (40%)
        if (rep.totalProjects > 0) {
            uint256 completionRate = (rep.completedProjects * 10000) / rep.totalProjects;
            score += (completionRate * COMPLETION_WEIGHT) / 10000;
        }

        // Volume score (25%) — logarithmic scale, 100k USDC = max
        if (rep.totalVolumeUSDC > 0) {
            uint256 volumeScore = _logScale(rep.totalVolumeUSDC, 100_000e6);
            score += (volumeScore * VOLUME_WEIGHT) / 10000;
        }

        // Payment speed score (20%) — faster = better, 24h = max
        if (rep.avgPaymentTimeHours > 0 && rep.avgPaymentTimeHours <= 168) { // max 7 days
            uint256 speedScore = 10000 - ((rep.avgPaymentTimeHours * 10000) / 168);
            score += (speedScore * PAYMENT_SPEED_WEIGHT) / 10000;
        }

        // Dispute penalty (-15%)
        if (rep.disputedProjects > 0 && rep.completedProjects > 0) {
            uint256 disputeRate = (rep.disputedProjects * 10000) / rep.completedProjects;
            uint256 lostDisputes = 0;
            ProjectRecord[] storage records = projectHistory[_account];
            for (uint256 i = 0; i < records.length; i++) {
                if (records[i].wasDisputed && !records[i].wasResolvedInFavor) {
                    lostDisputes++;
                }
            }
            if (lostDisputes > 0) {
                uint256 penaltyScore = (lostDisputes * DISPUTE_PENALTY) / rep.completedProjects;
                if (penaltyScore > score) {
                    score = 0;
                } else {
                    score -= penaltyScore;
                }
            }
        }

        // Cap at max
        if (score > MAX_SCORE) {
            score = MAX_SCORE;
        }

        rep.score = score;
        emit ReputationUpdated(_account, score);
    }

    function _logScale(uint256 value, uint256 maxValue) internal pure returns (uint256) {
        if (value >= maxValue) return 10000;
        if (value == 0) return 0;

        // Simple log approximation: score = (ln(value) / ln(maxValue)) * 10000
        // Using log2 for simplicity
        uint256 bits = 0;
        uint256 v = value;
        while (v > 1) {
            v >>= 1;
            bits++;
        }

        uint256 maxBits = 0;
        v = maxValue;
        while (v > 1) {
            v >>= 1;
            maxBits++;
        }

        return (bits * 10000) / maxBits;
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

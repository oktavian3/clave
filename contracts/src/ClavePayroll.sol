// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ClavePayroll
 * @notice Recurring payroll for DAOs and companies. Streams USDC payments
 *         with enforcement — auto-pauses if balance insufficient.
 */
contract ClavePayroll is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ──────────────────────── STRUCTS ────────────────────────

    enum PayrollStatus { Active, Paused, Completed }

    struct Payroll {
        string    name;
        address   payer;
        uint256   totalBudget;
        uint256   depositedAmount;
        uint256   spentAmount;
        uint256   intervalSeconds;    // payment interval (e.g., 30 days)
        uint256   lastPayoutAt;
        uint256   createdAt;
        PayrollStatus status;
        uint256   employeeCount;
    }

    struct Employee {
        address wallet;
        uint256 salaryPerInterval;    // salary per interval in USDC (6 decimals)
        uint256 totalPaid;
        uint256 lastPaidAt;
        bool    isActive;
        bool    exists;
    }

    // ──────────────────────── STATE ────────────────────────

    IERC20 public immutable usdc;

    uint256 public nextPayrollId = 1;

    mapping(uint256 => Payroll) public payrolls;
    mapping(uint256 => mapping(uint256 => Employee)) public employees; // payrollId => employeeId
    mapping(uint256 => uint256) public nextEmployeeId;

    uint256 public constant LATE_PENALTY_BPS_PER_DAY = 50; // 0.5%/day
    uint256 public constant MAX_LATE_PENALTY_BPS = 1500;    // 15% max

    // ──────────────────────── EVENTS ────────────────────────

    event PayrollCreated(uint256 indexed payrollId, address indexed payer, string name, uint256 intervalSeconds);
    event PayrollFunded(uint256 indexed payrollId, uint256 amount);
    event EmployeeAdded(uint256 indexed payrollId, uint256 employeeId, address wallet, uint256 salary);
    event PaymentProcessed(uint256 indexed payrollId, uint256 employeeId, address indexed wallet, uint256 amount);
    event PayrollPaused(uint256 indexed payrollId, string reason);
    event PayrollResumed(uint256 indexed payrollId);
    event EmployeeRemoved(uint256 indexed payrollId, uint256 employeeId);

    // ──────────────────────── CONSTRUCTOR ────────────────────────

    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
    }

    // ──────────────────────── CORE FUNCTIONS ────────────────────────

    /**
     * @notice Create a new payroll
     * @param _name Payroll name
     * @param _intervalSeconds Payment interval in seconds
     */
    function createPayroll(string calldata _name, uint256 _intervalSeconds)
        external
        returns (uint256 payrollId)
    {
        require(bytes(_name).length > 0, "Name required");
        require(_intervalSeconds >= 1 days, "Minimum 1 day interval");

        payrollId = nextPayrollId++;

        payrolls[payrollId] = Payroll({
            name: _name,
            payer: msg.sender,
            totalBudget: 0,
            depositedAmount: 0,
            spentAmount: 0,
            intervalSeconds: _intervalSeconds,
            lastPayoutAt: block.timestamp,
            createdAt: block.timestamp,
            status: PayrollStatus.Active,
            employeeCount: 0
        });

        nextEmployeeId[payrollId] = 1;
    }

    /**
     * @notice Fund the payroll with USDC
     * @param _payrollId Payroll ID
     * @param _amount Amount to deposit
     */
    function fundPayroll(uint256 _payrollId, uint256 _amount)
        external
        nonReentrant
    {
        Payroll storage payroll = payrolls[_payrollId];
        require(payroll.payer == msg.sender, "Not payer");
        require(payroll.status == PayrollStatus.Active, "Not active");
        require(_amount > 0, "Amount must be > 0");

        usdc.safeTransferFrom(msg.sender, address(this), _amount);
        payroll.depositedAmount += _amount;
        payroll.totalBudget += _amount;

        emit PayrollFunded(_payrollId, _amount);
    }

    /**
     * @notice Add an employee to the payroll
     * @param _payrollId Payroll ID
     * @param _wallet Employee wallet address
     * @param _salaryPerInterval Salary per interval in USDC
     */
    function addEmployee(uint256 _payrollId, address _wallet, uint256 _salaryPerInterval)
        external
        returns (uint256 employeeId)
    {
        Payroll storage payroll = payrolls[_payrollId];
        require(payroll.payer == msg.sender, "Not payer");
        require(payroll.status == PayrollStatus.Active, "Not active");
        require(_wallet != address(0) && _wallet != msg.sender, "Invalid wallet");
        require(_salaryPerInterval > 0, "Salary must be > 0");

        employeeId = nextEmployeeId[_payrollId]++;

        employees[_payrollId][employeeId] = Employee({
            wallet: _wallet,
            salaryPerInterval: _salaryPerInterval,
            totalPaid: 0,
            lastPaidAt: 0,
            isActive: true,
            exists: true
        });

        payroll.employeeCount++;
        emit EmployeeAdded(_payrollId, employeeId, _wallet, _salaryPerInterval);
    }

    /**
     * @notice Process payroll — pay all eligible employees
     * @param _payrollId Payroll ID
     */
    function processPayroll(uint256 _payrollId)
        external
        nonReentrant
    {
        Payroll storage payroll = payrolls[_payrollId];
        require(payroll.status == PayrollStatus.Active, "Not active");
        require(
            block.timestamp >= payroll.lastPayoutAt + payroll.intervalSeconds,
            "Interval not reached"
        );

        uint256 totalNeeded = 0;
        uint256 eligibleCount = 0;

        // Calculate total needed
        for (uint256 i = 1; i <= payroll.employeeCount; i++) {
            Employee storage emp = employees[_payrollId][i];
            if (emp.isActive && emp.exists) {
                totalNeeded += emp.salaryPerInterval;
                eligibleCount++;
            }
        }

        // Check balance
        uint256 available = payroll.depositedAmount - payroll.spentAmount;
        if (totalNeeded > available) {
            // Auto-pause if insufficient funds
            payroll.status = PayrollStatus.Paused;
            emit PayrollPaused(_payrollId, "Insufficient funds");
            return;
        }

        // Process payments
        for (uint256 i = 1; i <= payroll.employeeCount; i++) {
            Employee storage emp = employees[_payrollId][i];
            if (emp.isActive && emp.exists) {
                usdc.safeTransfer(emp.wallet, emp.salaryPerInterval);
                emp.totalPaid += emp.salaryPerInterval;
                emp.lastPaidAt = block.timestamp;
                payroll.spentAmount += emp.salaryPerInterval;

                emit PaymentProcessed(_payrollId, i, emp.wallet, emp.salaryPerInterval);
            }
        }

        payroll.lastPayoutAt = block.timestamp;

        // Check if payroll is complete
        if (payroll.spentAmount >= payroll.totalBudget) {
            payroll.status = PayrollStatus.Completed;
        }
    }

    /**
     * @notice Resume a paused payroll
     * @param _payrollId Payroll ID
     */
    function resumePayroll(uint256 _payrollId) external {
        Payroll storage payroll = payrolls[_payrollId];
        require(payroll.payer == msg.sender, "Not payer");
        require(payroll.status == PayrollStatus.Paused, "Not paused");

        uint256 available = payroll.depositedAmount - payroll.spentAmount;
        uint256 totalNeeded = 0;

        for (uint256 i = 1; i <= payroll.employeeCount; i++) {
            Employee storage emp = employees[_payrollId][i];
            if (emp.isActive && emp.exists) {
                totalNeeded += emp.salaryPerInterval;
            }
        }

        require(available >= totalNeeded, "Still insufficient funds");

        payroll.status = PayrollStatus.Active;
        emit PayrollResumed(_payrollId);
    }

    /**
     * @notice Remove an employee from the payroll
     * @param _payrollId Payroll ID
     * @param _employeeId Employee ID
     */
    function removeEmployee(uint256 _payrollId, uint256 _employeeId) external {
        Payroll storage payroll = payrolls[_payrollId];
        require(payroll.payer == msg.sender, "Not payer");

        Employee storage emp = employees[_payrollId][_employeeId];
        require(emp.exists, "Employee not found");
        require(emp.isActive, "Employee already inactive");

        emp.isActive = false;
        payroll.employeeCount--;

        emit EmployeeRemoved(_payrollId, _employeeId);
    }

    // ──────────────────────── VIEW FUNCTIONS ────────────────────────

    function getPayroll(uint256 _payrollId) external view returns (Payroll memory) {
        return payrolls[_payrollId];
    }

    function getEmployee(uint256 _payrollId, uint256 _employeeId)
        external
        view
        returns (Employee memory)
    {
        return employees[_payrollId][_employeeId];
    }

    function getAvailableBalance(uint256 _payrollId) external view returns (uint256) {
        Payroll storage payroll = payrolls[_payrollId];
        return payroll.depositedAmount - payroll.spentAmount;
    }

    function canProcessPayroll(uint256 _payrollId) external view returns (bool) {
        Payroll storage payroll = payrolls[_payrollId];
        if (payroll.status != PayrollStatus.Active) return false;
        if (block.timestamp < payroll.lastPayoutAt + payroll.intervalSeconds) return false;

        uint256 totalNeeded = 0;
        for (uint256 i = 1; i <= payroll.employeeCount; i++) {
            Employee storage emp = employees[_payrollId][i];
            if (emp.isActive && emp.exists) {
                totalNeeded += emp.salaryPerInterval;
            }
        }

        uint256 available = payroll.depositedAmount - payroll.spentAmount;
        return available >= totalNeeded;
    }
}

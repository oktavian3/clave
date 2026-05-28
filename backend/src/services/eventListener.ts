import { ethers } from "ethers";
import db from "../db.js";
import { CONTRACTS, CHAIN } from "../config.js";

// ──────────────────────── ABI ────────────────────────

const ESCROW_ABI = [
  "event ProjectCreated(uint256 indexed projectId, address indexed client, address indexed worker, uint256 totalBudget, uint256 deadline)",
  "event FundsDeposited(uint256 indexed projectId, uint256 amount, uint256 totalDeposited)",
  "event MilestoneAdded(uint256 indexed projectId, uint256 milestoneIndex, string description, uint256 amount, uint256 deadline)",
  "event MilestoneSubmitted(uint256 indexed projectId, uint256 milestoneIndex)",
  "event MilestoneApproved(uint256 indexed projectId, uint256 milestoneIndex)",
  "event FundsReleased(uint256 indexed projectId, uint256 milestoneIndex, address indexed worker, uint256 amount)",
  "event PenaltyApplied(uint256 indexed projectId, uint256 daysLate, uint256 penaltyAmount)",
  "event DisputeRaised(uint256 indexed projectId, uint256 milestoneIndex, address indexed raisedBy, string evidence)",
  "event DisputeResolved(uint256 indexed projectId, uint256 milestoneIndex, address indexed winner)",
  "function getProject(uint256) view returns (tuple(address client, address worker, uint256 totalBudget, uint256 depositedAmount, uint256 releasedAmount, uint256 penaltyReserve, uint256 createdAt, uint256 deadline, uint8 status, string metadataURI, uint256 milestoneCount))",
];

const REPUTATION_ABI = [
  "event ReputationUpdated(address indexed account, uint256 newScore)",
  "function getReputation(address) view returns (tuple(uint256 totalProjects, uint256 completedProjects, uint256 disputedProjects, uint256 totalVolumeUSDC, uint256 avgPaymentTimeHours, uint256 lastActive, uint256 score, bool isVerified))",
];

// ──────────────────────── EVENT LISTENER ────────────────────────

let provider: ethers.JsonRpcProvider;
let escrowContract: ethers.Contract;
let reputationContract: ethers.Contract;

export function initEventListener() {
  provider = new ethers.JsonRpcProvider(CHAIN.RPC_URL, CHAIN.CHAIN_ID);

  if (CONTRACTS.ESCROW) {
    escrowContract = new ethers.Contract(CONTRACTS.ESCROW, ESCROW_ABI, provider);
    startEscrowListener();
    console.log("📡 Escrow event listener started");
  }

  if (CONTRACTS.REPUTATION) {
    reputationContract = new ethers.Contract(CONTRACTS.REPUTATION, REPUTATION_ABI, provider);
    startReputationListener();
    console.log("📡 Reputation event listener started");
  }
}

function startEscrowListener() {
  const insertEvent = db.prepare(
    "INSERT INTO events (tx_hash, block_number, event_name, project_id, data, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const insertNotification = db.prepare(
    "INSERT INTO notifications (type, address, title, message, project_id, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const upsertProject = db.prepare(`
    INSERT INTO projects (id, client, worker, total_budget, deadline, status, metadata_uri, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'active', '', ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      deposited_amount = excluded.total_budget,
      updated_at = excluded.updated_at
  `);

  escrowContract.on("ProjectCreated", async (projectId, client, worker, totalBudget, deadline, event) => {
    const now = Math.floor(Date.now() / 1000);
    const projectIdNum = Number(projectId);

    insertEvent.run(event.log.transactionHash, Number(event.log.blockNumber), "ProjectCreated", projectIdNum, JSON.stringify({ client, worker, totalBudget: totalBudget.toString(), deadline: deadline.toString() }), now);

    upsertProject.run(projectIdNum, client, worker, totalBudget.toString(), Number(deadline), now, now);

    insertNotification.run("project_created", client, "New Project Created", `Project #${projectIdNum} created with worker ${worker.slice(0, 8)}...`, projectIdNum, now);
    insertNotification.run("project_created", worker, "New Project Assigned", `You've been assigned to Project #${projectIdNum}`, projectIdNum, now);

    console.log(`📋 Project #${projectIdNum} created by ${client.slice(0, 8)}...`);
  });

  escrowContract.on("FundsDeposited", async (projectId, amount, totalDeposited, event) => {
    const now = Math.floor(Date.now() / 1000);
    const projectIdNum = Number(projectId);

    insertEvent.run(event.log.transactionHash, Number(event.log.blockNumber), "FundsDeposited", projectIdNum, JSON.stringify({ amount: amount.toString(), totalDeposited: totalDeposited.toString() }), now);

    db.prepare("UPDATE projects SET deposited_amount = ?, updated_at = ? WHERE id = ?").run(totalDeposited.toString(), now, projectIdNum);

    console.log(`💰 Project #${projectIdNum}: ${ethers.formatUnits(amount, 6)} USDC deposited`);
  });

  escrowContract.on("MilestoneSubmitted", async (projectId, milestoneIndex, event) => {
    const now = Math.floor(Date.now() / 1000);
    const projectIdNum = Number(projectId);
    const msIndex = Number(milestoneIndex);

    insertEvent.run(event.log.transactionHash, Number(event.log.blockNumber), "MilestoneSubmitted", projectIdNum, JSON.stringify({ milestoneIndex: msIndex }), now);

    db.prepare("UPDATE milestones SET submitted = 1 WHERE project_id = ? AND \"index\" = ?").run(projectIdNum, msIndex);

    const project = db.prepare("SELECT client FROM projects WHERE id = ?").get(projectIdNum) as any;
    if (project) {
      insertNotification.run("milestone_submitted", project.client, "Milestone Submitted", `Milestone #${msIndex} submitted for review in Project #${projectIdNum}`, projectIdNum, now);
    }

    console.log(`📝 Project #${projectIdNum} Milestone #${msIndex} submitted`);
  });

  escrowContract.on("FundsReleased", async (projectId, milestoneIndex, worker, amount, event) => {
    const now = Math.floor(Date.now() / 1000);
    const projectIdNum = Number(projectId);
    const msIndex = Number(milestoneIndex);

    insertEvent.run(event.log.transactionHash, Number(event.log.blockNumber), "FundsReleased", projectIdNum, JSON.stringify({ milestoneIndex: msIndex, worker, amount: amount.toString() }), now);

    db.prepare("UPDATE milestones SET released = 1, approved = 1 WHERE project_id = ? AND \"index\" = ?").run(projectIdNum, msIndex);

    insertNotification.run("funds_released", worker, "Payment Received!", `${ethers.formatUnits(amount, 6)} USDC released for Milestone #${msIndex}`, projectIdNum, now);

    console.log(`💸 Project #${projectIdNum} Milestone #${msIndex}: ${ethers.formatUnits(amount, 6)} USDC released`);
  });

  escrowContract.on("DisputeRaised", async (projectId, milestoneIndex, raisedBy, evidence, event) => {
    const now = Math.floor(Date.now() / 1000);
    const projectIdNum = Number(projectId);
    const msIndex = Number(milestoneIndex);

    insertEvent.run(event.log.transactionHash, Number(event.log.blockNumber), "DisputeRaised", projectIdNum, JSON.stringify({ milestoneIndex: msIndex, raisedBy, evidence }), now);

    db.prepare("UPDATE projects SET status = 'disputed', updated_at = ? WHERE id = ?").run(now, projectIdNum);

    const project = db.prepare("SELECT client, worker FROM projects WHERE id = ?").get(projectIdNum) as any;
    if (project) {
      const otherParty = raisedBy.toLowerCase() === project.client.toLowerCase() ? project.worker : project.client;
      insertNotification.run("dispute_raised", otherParty, "⚠️ Dispute Raised", `A dispute has been raised on Milestone #${msIndex} in Project #${projectIdNum}`, projectIdNum, now);
    }

    console.log(`⚠️  Project #${projectIdNum} Milestone #${msIndex} dispute raised by ${raisedBy.slice(0, 8)}...`);
  });

  escrowContract.on("DisputeResolved", async (projectId, milestoneIndex, winner, event) => {
    const now = Math.floor(Date.now() / 1000);
    const projectIdNum = Number(projectId);

    insertEvent.run(event.log.transactionHash, Number(event.log.blockNumber), "DisputeResolved", projectIdNum, JSON.stringify({ milestoneIndex: Number(milestoneIndex), winner }), now);

    db.prepare("UPDATE projects SET status = 'active', updated_at = ? WHERE id = ?").run(now, projectIdNum);

    insertNotification.run("dispute_resolved", winner, "✅ Dispute Resolved", `Dispute resolved in your favor for Project #${projectIdNum}`, projectIdNum, now);

    console.log(`✅ Project #${projectIdNum} dispute resolved — winner: ${winner.slice(0, 8)}...`);
  });
}

function startReputationListener() {
  reputationContract.on("ReputationUpdated", async (account, newScore, event) => {
    const score = Number(newScore);
    console.log(`⭐ Reputation updated for ${account.slice(0, 8)}... → ${(score / 100).toFixed(2)}%`);
  });
}

export function getEventListenerStatus() {
  return {
    escrowListening: !!CONTRACTS.ESCROW,
    reputationListening: !!CONTRACTS.REPUTATION,
    rpcUrl: CHAIN.RPC_URL,
  };
}

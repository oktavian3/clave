import { ethers } from "hardhat";

/**
 * Clave — Deploy all contracts to Arc Testnet
 *
 * Required env vars:
 *   PRIVATE_KEY      — deployer wallet private key
 *   ARC_RPC_URL      — Arc testnet RPC (default: https://rpc.testnet.arc.network)
 *   FEE_RECIPIENT    — platform fee recipient address
 *
 * Run: npx hardhat run scripts/deploy.ts --network arcTestnet
 */

// Arc Testnet USDC address
const ARC_USDC = "0x3600000000000000000000000000000000000000";

async function main() {
  const [deployer] = await ethers.getSigners();
  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;

  console.log("Deploying Clave contracts...");
  console.log("  Deployer:", deployer.address);
  console.log("  Fee recipient:", feeRecipient);
  console.log("  USDC (Arc):", ARC_USDC);

  // 1. Deploy ClaveReputation
  const Reputation = await ethers.getContractFactory("ClaveReputation");
  const reputation = await Reputation.deploy();
  await reputation.waitForDeployment();
  const reputationAddr = await reputation.getAddress();
  console.log("✅ ClaveReputation deployed:", reputationAddr);

  // 2. Deploy ClaveEscrow
  const Escrow = await ethers.getContractFactory("ClaveEscrow");
  const escrow = await Escrow.deploy(ARC_USDC, feeRecipient);
  await escrow.waitForDeployment();
  const escrowAddr = await escrow.getAddress();
  console.log("✅ ClaveEscrow deployed:", escrowAddr);

  // 3. Deploy ClavePayroll
  const Payroll = await ethers.getContractFactory("ClavePayroll");
  const payroll = await Payroll.deploy(ARC_USDC);
  await payroll.waitForDeployment();
  const payrollAddr = await payroll.getAddress();
  console.log("✅ ClavePayroll deployed:", payrollAddr);

  // 4. Set Escrow as authorized caller for Reputation
  // (In production, this should be a role-based access control)
  const adminTx = await reputation.setAuthorizedCaller(escrowAddr, true);
  await adminTx.wait();
  console.log("✅ Escrow authorized on Reputation");

  // Summary
  console.log("\n═══════════════════════════════════════════════");
  console.log("  CLAVE DEPLOYMENT COMPLETE — Arc Testnet");
  console.log("═══════════════════════════════════════════════");
  console.log("  ClaveReputation:", reputationAddr);
  console.log("  ClaveEscrow:   ", escrowAddr);
  console.log("  ClavePayroll:  ", payrollAddr);
  console.log("  Explorer:      ", `https://testnet.arcscan.app/address/${escrowAddr}`);
  console.log("═══════════════════════════════════════════════\n");

  // Write deployment addresses to file
  const fs = require("fs");
  const deployments = {
    network: "arcTestnet",
    chainId: 5042002,
    usdc: ARC_USDC,
    deployer: deployer.address,
    feeRecipient,
    contracts: {
      ClaveReputation: reputationAddr,
      ClaveEscrow: escrowAddr,
      ClavePayroll: payrollAddr,
    },
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deployments, null, 2)
  );
  console.log("📝 Deployment addresses saved to deployments.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

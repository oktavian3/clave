"use client";

import { WagmiProvider, createConfig, http, useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defineChain } from "viem";
import { injected } from "wagmi/connectors";
import { useState, createContext, useContext, useEffect, ReactNode } from "react";

// ─── Arc Testnet ───

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: { default: { name: "ArcScan", url: "https://testnet.arcscan.app" } },
});

export const config = createConfig({
  chains: [arcTestnet],
  connectors: [injected()],
  transports: { [arcTestnet.id]: http("https://rpc.testnet.arc.network") },
});

const queryClient = new QueryClient();

// ─── Contract Addresses ───

export const CONTRACTS = {
  ESCROW: "0xdB963217F191d952AA477E0b0212111C2fF06124" as const,
  REPUTATION: "0xcb8E74F9FA2fC5E6DFA200a56F64F40b09fA8e49" as const,
  PAYROLL: "0x4d5f40c4eD9d5951181344CBdF00910246F1CBC4" as const,
  USDC: "0x3600000000000000000000000000000000000000" as const,
};

// ─── ABIs ───

export const ESCROW_ABI = [
  "function createProject(address worker, uint256 deadline, uint256 totalBudget) returns (uint256)",
  "function deposit(uint256 projectId, uint256 amount)",
  "function addMilestone(uint256 projectId, string description, uint256 amount, uint256 deadline)",
  "function submitMilestone(uint256 projectId, uint256 milestoneIndex)",
  "function approveMilestone(uint256 projectId, uint256 milestoneIndex)",
  "function autoRelease(uint256 projectId, uint256 milestoneIndex)",
  "function raiseDispute(uint256 projectId, string reason)",
  "function cancelProject(uint256 projectId)",
  "function projects(uint256) view returns (address client, address worker, uint256 totalBudget, uint256 depositedAmount, uint256 releasedAmount, uint256 deadline, uint8 status, uint256 createdAt)",
  "function getMilestones(uint256 projectId) view returns (tuple(string description, uint256 amount, uint256 deadline, uint8 status, uint256 submittedAt, uint256 approvedAt)[])",
  "function platformFee() view returns (uint256)",
  "function projectCount() view returns (uint256)",
  "event ProjectCreated(uint256 indexed projectId, address indexed client, address indexed worker, uint256 totalBudget, uint256 deadline)",
  "event Deposited(uint256 indexed projectId, address indexed from, uint256 amount)",
  "event MilestoneSubmitted(uint256 indexed projectId, uint256 indexed milestoneIndex, address indexed worker)",
  "event MilestoneApproved(uint256 indexed projectId, uint256 indexed milestoneIndex, uint256 amount)",
] as const;

export const USDC_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
] as const;

export const REPUTATION_ABI = [
  "function getScore(address worker) view returns (uint256)",
  "function getCompletionRate(address worker) view returns (uint256)",
] as const;

// ─── Providers ───

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// ─── Role Context ───

type Role = "client" | "worker" | null;

const RoleContext = createContext<{
  role: Role;
  setRole: (r: Role) => void;
}>({ role: null, setRole: () => {} });

export function useRole() {
  return useContext(RoleContext);
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

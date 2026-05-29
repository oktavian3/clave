"use client";

import { WagmiProvider, createConfig, http, useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defineChain } from "viem";
import { injected } from "wagmi/connectors";
import { useState, createContext, useContext, ReactNode } from "react";

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

// ─── ABIs (proper JSON format) ───

import ESCROW_ABI from "@/abi/ClaveEscrow.json";
import USDC_ABI from "@/abi/USDC.json";
import REPUTATION_ABI from "@/abi/ClaveReputation.json";

export { ESCROW_ABI, USDC_ABI, REPUTATION_ABI };

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

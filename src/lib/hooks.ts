"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { arcTestnet } from "./wagmi";

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isOnArcTestnet = chain?.id === arcTestnet.id;

  const connectWallet = async () => {
    const injected = connectors.find((c) => c.id === "injected");
    if (injected) {
      connect({ connector: injected });
    }
  };

  const switchToArc = async () => {
    try {
      await switchChain({ chainId: arcTestnet.id });
    } catch (err) {
      console.error("Failed to switch chain:", err);
    }
  };

  return {
    address,
    isConnected,
    chain,
    isOnArcTestnet,
    isConnecting,
    isSwitching,
    connectWallet,
    disconnect,
    switchToArc,
  };
}

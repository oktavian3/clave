"use client";

import { useState } from "react";
import { useConnect } from "wagmi";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const wallets: WalletOption[] = [
  { id: "metamask", name: "MetaMask", icon: "🦊", description: "Browser extension" },
  { id: "brave", name: "Brave Wallet", icon: "🦁", description: "Browser extension" },
  { id: "coinbase", name: "Coinbase Wallet", icon: "🔵", description: "Browser extension" },
  { id: "walletconnect", name: "WalletConnect", icon: "🔗", description: "Scan with mobile" },
];

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, connectors, isPending } = useConnect();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (walletId: string) => {
    setError(null);

    // Find matching connector
    let connector;

    if (walletId === "metamask" || walletId === "brave") {
      // Both use injected provider
      connector = connectors.find((c) => c.id === "injected");
    } else if (walletId === "coinbase") {
      connector = connectors.find((c) => c.id === "coinbaseWalletSDK");
    } else if (walletId === "walletconnect") {
      connector = connectors.find((c) => c.id === "walletConnect");
    }

    if (!connector) {
      // Fallback: try injected
      connector = connectors.find((c) => c.id === "injected");
    }

    if (!connector) {
      setError("Wallet tidak ditemukan. Install MetaMask atau Brave Wallet dulu.");
      return;
    }

    try {
      connect({ connector });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal connect wallet";
      setError(message);
    }
  };

  // Check which wallets are actually available
  const isAvailable = (walletId: string) => {
    if (typeof window === "undefined") return false;
    const eth = (window as unknown as { ethereum?: Record<string, unknown> }).ethereum;
    if (walletId === "metamask") {
      return !!eth;
    }
    if (walletId === "brave") {
      return !!eth?.isBraveWallet;
    }
    if (walletId === "coinbase") {
      return !!eth?.isCoinbaseWallet;
    }
    return true; // WalletConnect always available
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative rounded-sm p-6 max-w-sm w-full mx-4 animate-fade-in"
        style={{ background: "#FEFEFE", boxShadow: "5px 5px 20px rgba(0,0,0,0.15)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-h3 font-semibold">Connect Wallet</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-sm flex items-center justify-center hover:bg-surface-muted transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Wallet List */}
        <div className="space-y-2">
          {wallets.map((wallet) => {
            const available = isAvailable(wallet.id);
            return (
              <button
                key={wallet.id}
                onClick={() => available && handleConnect(wallet.id)}
                disabled={!available || isPending}
                className={`w-full flex items-center gap-3 p-3 rounded-sm transition-all duration-200 ${
                  available
                    ? "hover:bg-surface-muted cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                }`}
                style={{
                  background: "#FEFEFE",
                  boxShadow: available
                    ? "2px 2px 5px #E5E4DE, -2px -2px 5px #FFFFFF"
                    : "none",
                }}
              >
                <span className="text-2xl">{wallet.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-medium">{wallet.name}</p>
                  <p className="text-xs text-neutral-400">
                    {available ? wallet.description : "Not installed"}
                  </p>
                </div>
                {isPending && (
                  <span className="ml-auto w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 p-3 rounded-sm bg-red-50 text-red-600 text-xs">
            {error}
          </div>
        )}

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-sm text-sm text-neutral-400 hover:text-neutral-600 hover:bg-surface-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

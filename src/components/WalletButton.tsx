"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useState } from "react";
import { useRole, arcTestnet } from "@/lib/wagmi";

export default function WalletButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { role, setRole } = useRole();
  const [showModal, setShowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const isOnArc = chain?.id === 5042002;

  const handleConnect = async (connector: any) => {
    connect({ connector });
    setShowModal(false);
    // Prompt switch to Arc Testnet after connecting
    setTimeout(async () => {
      try {
        await switchChain({ chainId: 5042002 });
      } catch {}
      setShowRoleModal(true);
    }, 1000);
  };

  const handleDisconnect = () => {
    disconnect();
    setRole(null);
  };

  // Connected + has role
  if (isConnected && role) {
    return (
      <div className="flex items-center gap-2">
        {/* Network badge */}
        {!isOnArc && (
          <button
            onClick={() => switchChain({ chainId: 5042002 })}
            className="px-3 py-1.5 rounded-full bg-warning text-warning-text text-xs font-medium animate-pulse cursor-pointer"
          >
            ⚠️ Switch to Arc
          </button>
        )}
        {isOnArc && (
          <span className="px-3 py-1.5 rounded-full bg-success text-success-text text-xs font-medium">
            ✓ Arc Testnet
          </span>
        )}

        {/* Role badge */}
        <span className="px-3 py-1.5 rounded-full bg-primary/20 text-primary-500 text-xs font-medium">
          {role === "client" ? "👤 Client" : "👷 Worker"}
        </span>

        {/* Wallet + Disconnect */}
        <div className="relative group">
          <button className="px-3 py-2 rounded-sm text-sm font-medium neu-input flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </button>
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-48 rounded-sm py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
            style={{ background: "#FEFEFE", boxShadow: "4px 4px 12px rgba(0,0,0,0.1)" }}>
            <button
              onClick={() => window.location.href = "#settings"}
              className="w-full text-left px-4 py-2 text-sm hover:bg-surface-muted transition-colors"
            >
              ⚙️ Profile Settings
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              🔌 Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Connected but no role yet
  if (isConnected && !role) {
    return (
      <button
        onClick={() => setShowRoleModal(true)}
        className="px-4 py-2 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200"
      >
        Choose Role
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200"
      >
        Connect Wallet
      </button>

      {/* Wallet Selector Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-sm rounded-sm p-6 animate-scale-in"
            style={{ background: "#FEFEFE", boxShadow: "8px 8px 18px #C8C7C1, -8px -8px 18px #FFFFFF" }}
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-h3 font-semibold mb-1">Connect Wallet</h3>
            <p className="text-xs text-neutral-400 mb-4">Koneksi ke Arc Testnet (USDC gas)</p>
            <div className="space-y-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => handleConnect(connector)}
                  className="w-full flex items-center gap-3 p-3 rounded-sm neu-input hover:bg-surface-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-sm bg-orange-100 flex items-center justify-center text-xl">🦊</div>
                  <div>
                    <p className="text-sm font-medium">{connector.name}</p>
                    <p className="text-xs text-neutral-400">Browser extension</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowModal(false)} className="w-full mt-4 py-2.5 rounded-sm text-sm font-medium neu-tab hover:bg-surface-muted transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Role Selection Modal */}
      {showRoleModal && isConnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowRoleModal(false)}>
          <div className="w-full max-w-md rounded-sm p-6 animate-scale-in"
            style={{ background: "#FEFEFE", boxShadow: "8px 8px 18px #C8C7C1, -8px -8px 18px #FFFFFF" }}
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-h3 font-semibold mb-1">Choose Your Role</h3>
            <p className="text-xs text-neutral-400 mb-1">
              {address?.slice(0, 6)}...{address?.slice(-4)} •
              {!isOnArc ? " ⚠️ Switching to Arc Testnet..." : " ✓ Arc Testnet"}
            </p>
            <p className="text-caption text-neutral-400 mb-5">Pilih role kamu di Clave</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setRole("client"); setShowRoleModal(false); }}
                className="p-5 rounded-sm text-left transition-all hover:shadow-card-hover"
                style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
                <div className="text-3xl mb-3">👤</div>
                <p className="font-semibold mb-1">Client</p>
                <p className="text-xs text-neutral-400">Bayar worker, buat project, approve milestone</p>
              </button>
              <button
                onClick={() => { setRole("worker"); setShowRoleModal(false); }}
                className="p-5 rounded-sm text-left transition-all hover:shadow-card-hover"
                style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
                <div className="text-3xl mb-3">👷</div>
                <p className="font-semibold mb-1">Worker</p>
                <p className="text-xs text-neutral-400">Kerja, submit milestone, terima bayaran</p>
              </button>
            </div>
            <button onClick={() => { disconnect(); setShowRoleModal(false); }} className="w-full mt-4 py-2.5 rounded-sm text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors">
              Disconnect
            </button>
          </div>
        </div>
      )}
    </>
  );
}

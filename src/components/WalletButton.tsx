"use client";

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { useState } from "react";
import { useRole } from "@/lib/wagmi";

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { role, setRole } = useRole();
  const [showModal, setShowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleConnect = () => {
    if (isConnected) {
      disconnect();
      setRole(null);
      return;
    }
    setShowModal(true);
  };

  const handleConnectorClick = (connector: any) => {
    connect({ connector });
    setShowModal(false);
    setShowRoleModal(true);
  };

  if (isConnected && role) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-full bg-primary/20 text-primary-500 text-xs font-medium">
          {role === "client" ? "👤 Client" : "👷 Worker"}
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 rounded-sm text-sm font-medium neu-input hover:bg-surface-muted transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleConnect}
        className="px-4 py-2 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200"
      >
        Connect Wallet
      </button>

      {/* Wallet Selector Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-sm rounded-sm p-6 animate-scale-in"
            style={{ background: "#FEFEFE", boxShadow: "8px 8px 18px #C8C7C1, -8px -8px 18px #FFFFFF" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-h3 font-semibold mb-4">Connect Wallet</h3>
            <div className="space-y-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => handleConnectorClick(connector)}
                  className="w-full flex items-center gap-3 p-3 rounded-sm neu-input hover:bg-surface-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-sm bg-orange-100 flex items-center justify-center">
                    <span className="text-lg">🦊</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{connector.name}</p>
                    <p className="text-xs text-neutral-400">Browser extension</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 py-2.5 rounded-sm text-sm font-medium neu-tab hover:bg-surface-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Role Selection Modal */}
      {showRoleModal && isConnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowRoleModal(false)}>
          <div
            className="w-full max-w-md rounded-sm p-6 animate-scale-in"
            style={{ background: "#FEFEFE", boxShadow: "8px 8px 18px #C8C7C1, -8px -8px 18px #FFFFFF" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-h3 font-semibold mb-2">Choose Your Role</h3>
            <p className="text-caption text-neutral-400 mb-5">Pilih role kamu di Clave</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setRole("client"); setShowRoleModal(false); }}
                className="p-5 rounded-sm text-left transition-all hover:shadow-card-hover"
                style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}
              >
                <div className="text-3xl mb-3">👤</div>
                <p className="font-semibold mb-1">Client</p>
                <p className="text-xs text-neutral-400">Bayar worker, buat project, approve milestone</p>
              </button>

              <button
                onClick={() => { setRole("worker"); setShowRoleModal(false); }}
                className="p-5 rounded-sm text-left transition-all hover:shadow-card-hover"
                style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}
              >
                <div className="text-3xl mb-3">👷</div>
                <p className="font-semibold mb-1">Worker</p>
                <p className="text-xs text-neutral-400">Kerja, submit milestone, terima bayaran</p>
              </button>
            </div>

            <button
              onClick={() => { disconnect(); setShowRoleModal(false); }}
              className="w-full mt-4 py-2.5 rounded-sm text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </>
  );
}

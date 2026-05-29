"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/hooks";
import Sidebar from "@/components/Sidebar";
import StatsCard from "@/components/StatsCard";
import ActivityFeed from "@/components/ActivityFeed";
import ProjectTable from "@/components/ProjectTable";
import ReputationExplorer from "@/components/ReputationExplorer";
import PayrollPage from "@/components/PayrollPage";
import WalletModal from "@/components/WalletModal";

export default function Home() {
  const [activePage, setActivePage] = useState("dashboard");
  const [role, setRole] = useState<"client" | "worker" | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const {
    address,
    isConnected,
    isOnArcTestnet,
    isConnecting,
    connectWallet,
    disconnect,
    switchToArc,
  } = useWallet();

  // Auto-show role modal after wallet connects
  useEffect(() => {
    if (isConnected && isOnArcTestnet && !role) {
      setShowRoleModal(true);
    }
  }, [isConnected, isOnArcTestnet, role]);

  // Auto-switch to Arc Testnet
  useEffect(() => {
    if (isConnected && !isOnArcTestnet) {
      switchToArc();
    }
  }, [isConnected, isOnArcTestnet]);

  return (
    <div className="min-h-screen bg-surface-warm">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        walletAddress={address}
        isConnected={isConnected}
        role={role}
        onOpenProfile={() => setShowProfileModal(true)}
        onDisconnect={() => disconnect()}
      />

      {/* Main Content */}
      <main className="ml-[240px] min-h-screen transition-all duration-300">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-30 h-16 flex items-center justify-between px-8 border-b border-border"
          style={{ background: "rgba(248, 247, 244, 0.85)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-h3 font-semibold capitalize">{activePage}</h1>
            <NetworkBadge isConnected={isConnected} isOnArc={isOnArcTestnet} />
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-56 pl-9 pr-3 py-2 rounded-sm text-sm neu-input focus:outline-none"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-sm flex items-center justify-center hover:bg-surface-muted transition-colors">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M13.5 6.75a4.5 4.5 0 10-9 0c0 5.25-2.25 6.75-2.25 6.75h13.5S13.5 12 13.5 6.75z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M10.3 15.75a1.5 1.5 0 01-2.6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
            </button>

            {/* Role Selector (when connected) */}
            {isConnected && isOnArcTestnet && (
              <button
                onClick={() => setShowRoleModal(true)}
                className="px-4 py-2 rounded-sm text-sm font-medium bg-primary text-primary-500 shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200"
              >
                {role ? `✓ ${role === "client" ? "Client" : "Worker"}` : "Choose Role"}
              </button>
            )}

            {/* Wallet Button */}
            <button
              onClick={isConnected ? () => disconnect() : () => setShowWalletModal(true)}
              disabled={isConnecting}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-all duration-200 ${
                isConnected
                  ? "bg-green-50 text-green-700 shadow-[inset_2px_2px_4px_#D4E8D4,inset_-2px_-2px_4px_#FFFFFF]"
                  : "bg-primary text-primary-500 shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5]"
              } ${isConnecting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isConnecting ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  Connecting...
                </span>
              ) : isConnected ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              ) : (
                "Connect Wallet"
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {!isConnected ? (
            <LandingPage onConnect={() => setShowWalletModal(true)} isConnecting={isConnecting} />
          ) : !role ? (
            <RoleSelection onOpen={() => setShowRoleModal(true)} />
          ) : (
            <>
              {activePage === "dashboard" && role === "client" && <ClientDashboard />}
              {activePage === "dashboard" && role === "worker" && <WorkerDashboard />}
              {activePage === "projects" && <ProjectPage role={role} />}
              {activePage === "reputation" && <ReputationExplorer />}
              {activePage === "payroll" && <PayrollPage />}
              {activePage === "activity" && <ActivityPage />}
              {activePage === "settings" && <SettingsPage role={role} />}
            </>
          )}
        </div>
      </main>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <RoleModal
          onSelect={(r) => {
            setRole(r);
            setShowRoleModal(false);
          }}
          onClose={() => setShowRoleModal(false)}
        />
      )}

      {/* Wallet Modal */}
      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} role={role} address={address} />
      )}
    </div>
  );
}

// ─── Network Badge ───

function NetworkBadge({ isConnected, isOnArc }: { isConnected: boolean; isOnArc: boolean }) {
  if (!isConnected) return null;

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${
        isOnArc
          ? "text-green-600 bg-green-50"
          : "text-amber-600 bg-amber-50"
      }`}
    >
      {isOnArc ? "✓ Arc Testnet" : "⚠️ Switch to Arc"}
    </span>
  );
}

// ─── Landing Page (before connect) ───

function LandingPage({
  onConnect,
  isConnecting,
}: {
  onConnect: () => void;
  isConnecting: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
      <div className="text-center max-w-xl">
        <div className="w-16 h-16 mx-auto mb-6 rounded-sm bg-primary flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="14" rx="2" stroke="#A87BA9" strokeWidth="2" />
            <circle cx="17" cy="13" r="1.5" fill="#A87BA9" />
            <path d="M7 6V4a2 2 0 012-2h6a2 2 0 012 2v2" stroke="#A87BA9" strokeWidth="2" />
          </svg>
        </div>
        <h1 className="text-display font-bold tracking-tight mb-3">
          Payment Infrastructure
          <br />
          for Web3 Workers
        </h1>
        <p className="text-body text-neutral-400 mb-8">
          Trustless escrow, auto-enforcement, onchain reputation. Built on Arc Network with USDC-native gas.
        </p>
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="px-8 py-3 rounded-sm bg-primary text-primary-500 text-base font-semibold shadow-[3px_3px_8px_#D4A8D6,-3px_-3px_8px_#F5EAF5] hover:shadow-[inset_3px_3px_8px_#D4A8D6,inset_-3px_-3px_8px_#F5EAF5] transition-all duration-200 disabled:opacity-50"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet untuk Mulai →"}
        </button>
        <p className="text-xs text-neutral-400 mt-4">Auto-switch ke Arc Testnet</p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl w-full">
        <FeatureCard
          icon="🔒"
          title="Trustless Escrow"
          desc="Funds locked in smart contracts. No middleman, no trust required."
        />
        <FeatureCard
          icon="⚡"
          title="Auto-Enforcement"
          desc="Deadline passed? Auto-release. Late? Penalty auto-deducted."
        />
        <FeatureCard
          icon="⭐"
          title="Onchain Reputation"
          desc="Portable reputation score. Track completion, speed, disputes."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div
      className="rounded-sm p-6 text-center"
      style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-neutral-400">{desc}</p>
    </div>
  );
}

// ─── Role Selection Screen ───

function RoleSelection({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <p className="text-sm text-neutral-400 mb-4">Pilih role kamu untuk mulai</p>
      <button
        onClick={onOpen}
        className="px-8 py-3 rounded-sm bg-primary text-primary-500 text-base font-semibold shadow-[3px_3px_8px_#D4A8D6,-3px_-3px_8px_#F5EAF5] hover:shadow-[inset_3px_3px_8px_#D4A8D6,inset_-3px_-3px_8px_#F5EAF5] transition-all duration-200"
      >
        Choose Role
      </button>
    </div>
  );
}

// ─── Role Modal ───

function RoleModal({
  onSelect,
  onClose,
}: {
  onSelect: (role: "client" | "worker") => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="rounded-sm p-8 max-w-md w-full mx-4 animate-fade-in"
        style={{ background: "#FEFEFE", boxShadow: "5px 5px 20px rgba(0,0,0,0.12)" }}
      >
        <h2 className="text-h2 font-semibold mb-2">Pilih Role Kamu</h2>
        <p className="text-sm text-neutral-400 mb-6">
          Mau jadi Client (yang bayar) atau Worker (yang kerja)?
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onSelect("client")}
            className="p-6 rounded-sm border-2 border-transparent hover:border-primary transition-all duration-200 text-center group"
            style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}
          >
            <div className="text-4xl mb-3">👤</div>
            <h3 className="text-base font-semibold mb-1 group-hover:text-focus transition-colors">Client</h3>
            <p className="text-xs text-neutral-400">Bayar worker, kelola project & escrow</p>
          </button>

          <button
            onClick={() => onSelect("worker")}
            className="p-6 rounded-sm border-2 border-transparent hover:border-primary transition-all duration-200 text-center group"
            style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}
          >
            <div className="text-4xl mb-3">👷</div>
            <h3 className="text-base font-semibold mb-1 group-hover:text-focus transition-colors">Worker</h3>
            <p className="text-xs text-neutral-400">Kerja, submit milestone, accept payment</p>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          Nanti aja
        </button>
      </div>
    </div>
  );
}

// ─── Profile Modal ───

function ProfileModal({
  onClose,
  role,
  address,
}: {
  onClose: () => void;
  role: "client" | "worker" | null;
  address?: string;
}) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // TODO: save to backend/localStorage
    setTimeout(() => {
      localStorage.setItem(
        "clave_profile",
        JSON.stringify({ name, bio, role, address })
      );
      setSaving(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="rounded-sm p-8 max-w-md w-full mx-4 animate-fade-in"
        style={{ background: "#FEFEFE", boxShadow: "5px 5px 20px rgba(0,0,0,0.12)" }}
      >
        <h2 className="text-h2 font-semibold mb-1">Profile Settings</h2>
        <p className="text-xs text-neutral-400 mb-6">Ubah preferensi profile kamu</p>

        <div className="space-y-4">
          {/* Avatar placeholder */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl">
              {role === "client" ? "👤" : "👷"}
            </div>
            <button className="text-xs text-focus hover:underline">Change Photo</button>
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kamu"
              className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tentang kamu..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Role</label>
            <div className="px-4 py-2.5 rounded-sm text-sm bg-surface-muted text-neutral-500">
              {role === "client" ? "Client" : role === "worker" ? "Worker" : "Not set"}
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Wallet</label>
            <div className="px-4 py-2.5 rounded-sm text-xs font-mono bg-surface-muted text-neutral-500 truncate">
              {address || "Not connected"}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-sm text-sm text-neutral-500 hover:bg-surface-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Client Dashboard ───

function ClientDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-display font-bold tracking-tight">Client Dashboard</h2>
          <p className="text-body text-neutral-400 mt-1">Kelola project & escrow kamu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Projects" value="0" change="Belum ada" changeType="up" delay={0} icon={<FolderIcon />} />
        <StatsCard title="Total Escrowed" value="0 USDC" change="0" changeType="up" delay={80} icon={<LockIcon />} />
        <StatsCard title="Completed" value="0" change="0" changeType="up" delay={160} icon={<CheckIcon />} />
      </div>

      <div
        className="rounded-sm p-8 text-center"
        style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}
      >
        <div className="text-4xl mb-3">📭</div>
        <h3 className="text-base font-semibold mb-1">Belum ada project</h3>
        <p className="text-sm text-neutral-400 mb-4">Buat project pertama untuk mulai escrow</p>
        <button className="px-6 py-2.5 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200">
          + New Project
        </button>
      </div>
    </div>
  );
}

// ─── Worker Dashboard ───

function WorkerDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-display font-bold tracking-tight">Worker Dashboard</h2>
          <p className="text-body text-neutral-400 mt-1">Submit milestone & track reputation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Reputation Score" value="--" change="Belum ada data" changeType="up" delay={0} icon={<StarIcon />} />
        <StatsCard title="Active Projects" value="0" change="0" changeType="up" delay={80} icon={<FolderIcon />} />
        <StatsCard title="Total Earned" value="0 USDC" change="0" changeType="up" delay={160} icon={<WalletIcon />} />
      </div>

      <div
        className="rounded-sm p-8 text-center"
        style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}
      >
        <div className="text-4xl mb-3">🔨</div>
        <h3 className="text-base font-semibold mb-1">Belum ada project aktif</h3>
        <p className="text-sm text-neutral-400 mb-4">Submit milestone setelah dapat project dari client</p>
        <button className="px-6 py-2.5 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200">
          Submit Milestone
        </button>
      </div>

      {/* Reputation Breakdown */}
      <div
        className="rounded-sm p-6"
        style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}
      >
        <h3 className="text-h3 font-semibold mb-4">Reputation Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Completion", value: "--", color: "text-focus" },
            { label: "Volume", value: "--", color: "text-focus" },
            { label: "Speed", value: "--", color: "text-focus" },
            { label: "Disputes", value: "0", color: "text-green-600" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 rounded-sm bg-surface-muted">
              <p className="text-xs text-neutral-400 mb-1">{stat.label}</p>
              <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Project Page ───

function ProjectPage({ role }: { role: "client" | "worker" }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2 font-semibold">Projects</h2>
          <p className="text-caption text-neutral-400 mt-1">
            {role === "client" ? "Project yang kamu buat" : "Project yang kamu kerjakan"}
          </p>
        </div>
        {role === "client" && (
          <button className="px-4 py-2 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200">
            + New Project
          </button>
        )}
      </div>
      <ProjectTable />
    </div>
  );
}

// ─── Activity Page ───

function ActivityPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-h2 font-semibold">Activity Log</h2>
        <p className="text-caption text-neutral-400 mt-1">All onchain events across your projects</p>
      </div>
      <ActivityFeed />
    </div>
  );
}

// ─── Settings Page ───

function SettingsPage({ role }: { role: "client" | "worker" }) {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h2 className="text-h2 font-semibold">Settings</h2>
        <p className="text-caption text-neutral-400 mt-1">Manage your Clave configuration</p>
      </div>

      <div
        className="rounded-sm p-6 space-y-5"
        style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}
      >
        <div>
          <h3 className="text-h3 font-semibold mb-3">Platform Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Platform Fee (basis points)</label>
              <input type="number" defaultValue="100" className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none" />
              <p className="text-xs text-neutral-400 mt-1">100 = 1.0%. Range: 0-500 (0%-5%)</p>
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Penalty Rate (basis points per day)</label>
              <input type="number" defaultValue="50" className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none" />
              <p className="text-xs text-neutral-400 mt-1">50 = 0.5% per day. Max: 1500 (15%)</p>
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Auto-Release Window (days)</label>
              <input type="number" defaultValue="7" className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none" />
              <p className="text-xs text-neutral-400 mt-1">Days after deadline before auto-release triggers</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <h3 className="text-h3 font-semibold mb-3">Connected Contracts</h3>
          <div className="space-y-2">
            {[
              { label: "ClaveEscrow", addr: "0xdB963217F191d952AA477E0b0212111C2fF06124" },
              { label: "ClaveReputation", addr: "0xcb8E74F9FA2fC5E6DFA200a56F64F40b09fA8e49" },
              { label: "ClavePayroll", addr: "0x4d5f40c4eD9d5951181344CBdF00910246F1CBC4" },
            ].map((c) => (
              <div key={c.label} className="flex items-center justify-between p-3 rounded-sm bg-surface-muted">
                <span className="text-sm font-medium">{c.label}</span>
                <a
                  href={`https://testnet.arcscan.app/address/${c.addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-focus hover:underline"
                >
                  {c.addr.slice(0, 10)}...{c.addr.slice(-6)}
                </a>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-2.5 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200">
          Save Settings
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard Icons ───

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 6c0-1.1.9-2 2-2h3.17a2 2 0 011.41.59l1.42 1.41a2 2 0 001.41.59H15a2 2 0 012 2v6.5a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="5" y="9" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2l2.24 4.54 5.01.73-3.62 3.53.85 4.99L10 13.27l-4.48 2.52.85-4.99L2.75 7.27l5.01-.73L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13" cy="10.5" r="1.2" fill="currentColor" />
      <path d="M6 5V4a2 2 0 012-2h4a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

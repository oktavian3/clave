"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import WalletButton from "@/components/WalletButton";
import ClientDashboard from "@/components/ClientDashboard";
import WorkerView from "@/components/WorkerView";
import ProfileSettings from "@/components/ProfileSettings";
import ReputationExplorer from "@/components/ReputationExplorer";
import PayrollPage from "@/components/PayrollPage";
import ActivityFeed from "@/components/ActivityFeed";
import { useRole } from "@/lib/wagmi";

export default function Home() {
  const [activePage, setActivePage] = useState("dashboard");
  const { role } = useRole();

  return (
    <div className="min-h-screen bg-surface-warm">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="ml-[240px] min-h-screen transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-8 border-b border-border" style={{ background: "rgba(248, 247, 244, 0.85)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3">
            <h1 className="text-h3 font-semibold capitalize">{activePage}</h1>
            <span className="text-xs text-neutral-400 bg-surface-muted px-2 py-0.5 rounded-full">Arc Testnet</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input type="text" placeholder="Search..." className="w-56 pl-9 pr-3 py-2 rounded-sm text-sm neu-input focus:outline-none" />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <button className="relative w-9 h-9 rounded-sm flex items-center justify-center hover:bg-surface-muted transition-colors">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M13.5 6.75a4.5 4.5 0 10-9 0c0 5.25-2.25 6.75-2.25 6.75h13.5S13.5 12 13.5 6.75z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.3 15.75a1.5 1.5 0 01-2.6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
            </button>
            <WalletButton />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {activePage === "dashboard" && !role && <LandingPage />}
          {activePage === "dashboard" && role === "client" && <ClientDashboard />}
          {activePage === "dashboard" && role === "worker" && <WorkerView />}
          {activePage === "projects" && <ProjectsPage />}
          {activePage === "reputation" && <ReputationExplorer />}
          {activePage === "payroll" && <PayrollPage />}
          {activePage === "activity" && <ActivityPage />}
          {activePage === "settings" && role && <ProfileSettings role={role} />}
          {activePage === "settings" && !role && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

// ─── Landing (Not Connected) ───

function LandingPage() {
  return (
    <div className="space-y-12 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto py-12">
        <div className="text-6xl mb-6">🔐</div>
        <h2 className="text-display font-bold tracking-tight mb-4">
          Payment Infrastructure for<br />Web3 Workers
        </h2>
        <p className="text-body text-neutral-400 max-w-lg mx-auto">
          Trustless escrow, auto-enforcement, onchain reputation.
          Built on Arc Network with USDC-native gas.
        </p>
        <p className="text-caption text-neutral-400 mt-6">
          Connect wallet untuk mulai →
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          { icon: "🔒", title: "Trustless Escrow", desc: "Funds locked in smart contracts. No middleman, no trust required." },
          { icon: "⚡", title: "Auto-Enforcement", desc: "Deadline passed? Auto-release. Late? Penalty auto-deducted." },
          { icon: "⭐", title: "Onchain Reputation", desc: "Portable reputation score. Track completion, speed, disputes." },
        ].map((f, i) => (
          <div key={i} className="rounded-sm p-6 text-center" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-neutral-400">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-h2 font-semibold text-center mb-8">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "1", icon: "🔗", title: "Connect", desc: "Link MetaMask wallet" },
            { step: "2", icon: "👤", title: "Choose Role", desc: "Client or Worker" },
            { step: "3", icon: "📋", title: "Create Project", desc: "Set milestones & budget" },
            { step: "4", icon: "💰", title: "Get Paid", desc: "USDC auto-release" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center text-xl mx-auto mb-3">{s.icon}</div>
              <p className="text-xs text-neutral-400 mb-1">Step {s.step}</p>
              <p className="text-sm font-semibold">{s.title}</p>
              <p className="text-xs text-neutral-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Projects Page ───

function ProjectsPage() {
  const { role } = useRole();
  return (
    <div className="animate-fade-in">
      {role === "client" ? <ClientDashboard /> : role === "worker" ? <WorkerView /> : <LandingPage />}
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
      <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-semibold mb-1">No activity yet</p>
          <p className="text-sm text-neutral-400">Onchain events will appear here</p>
        </div>
      </div>
    </div>
  );
}

// ─── Settings (No Role) ───

function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h2 className="text-h2 font-semibold">Settings</h2>
        <p className="text-caption text-neutral-400 mt-1">Connect wallet to manage settings</p>
      </div>
      <div className="rounded-sm p-6" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
        <h3 className="text-h3 font-semibold mb-3">Connected Contracts</h3>
        <div className="space-y-2">
          {[
            { label: "ClaveEscrow", addr: "0xdB963217F191d952AA477E0b0212111C2fF06124" },
            { label: "ClaveReputation", addr: "0xcb8E74F9FA2fC5E6DFA200a56F64F40b09fA8e49" },
            { label: "ClavePayroll", addr: "0x4d5f40c4eD9d5951181344CBdF00910246F1CBC4" },
          ].map((c) => (
            <div key={c.label} className="flex items-center justify-between p-3 rounded-sm bg-surface-muted">
              <span className="text-sm font-medium">{c.label}</span>
              <a href={`https://testnet.arcscan.app/address/${c.addr}`} target="_blank" className="text-xs font-mono text-focus hover:underline">
                {c.addr.slice(0, 10)}...{c.addr.slice(-6)}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

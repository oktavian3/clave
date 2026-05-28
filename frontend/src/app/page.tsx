"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import StatsCard from "@/components/StatsCard";
import ActivityFeed from "@/components/ActivityFeed";
import ProjectTable from "@/components/ProjectTable";
import ReputationExplorer from "@/components/ReputationExplorer";
import PayrollPage from "@/components/PayrollPage";

export default function Home() {
  const [activePage, setActivePage] = useState("dashboard");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress] = useState("0x6e7ad7B501fCd21a380431FcE24089bb99cfC871");

  return (
    <div className="min-h-screen bg-surface-warm">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        walletAddress={walletAddress}
        isConnected={walletConnected}
      />

      {/* Main Content */}
      <main className="ml-[240px] min-h-screen transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-8 border-b border-border" style={{ background: "rgba(248, 247, 244, 0.85)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3">
            <h1 className="text-h3 font-semibold capitalize">{activePage}</h1>
            <span className="text-xs text-neutral-400 bg-surface-muted px-2 py-0.5 rounded-full">Arc Testnet</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-56 pl-9 pr-3 py-2 rounded-sm text-sm neu-input focus:outline-none"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-sm flex items-center justify-center hover:bg-surface-muted transition-colors">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M13.5 6.75a4.5 4.5 0 10-9 0c0 5.25-2.25 6.75-2.25 6.75h13.5S13.5 12 13.5 6.75z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.3 15.75a1.5 1.5 0 01-2.6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
            </button>

            {/* Wallet Button */}
            <button
              onClick={() => setWalletConnected(!walletConnected)}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-all duration-200 ${
                walletConnected
                  ? "bg-primary text-primary-500 shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5]"
                  : "bg-primary text-primary-500 shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5]"
              }`}
            >
              {walletConnected ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              ) : (
                "Connect Wallet"
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {activePage === "dashboard" && <DashboardPage />}
          {activePage === "projects" && <ProjectPage />}
          {activePage === "reputation" && <ReputationExplorer />}
          {activePage === "payroll" && <PayrollPage />}
          {activePage === "activity" && <ActivityPage />}
          {activePage === "settings" && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

// ─── Dashboard Page ───

function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-display font-bold tracking-tight">Dashboard</h2>
          <p className="text-body text-neutral-400 mt-1">Payment infrastructure for web3 workers</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-400">Network</p>
          <p className="text-sm font-medium text-focus font-mono">Arc Testnet</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Volume"
          value="485,200 USDC"
          change="+12.5%"
          changeType="up"
          delay={0}
          icon={<WalletIcon />}
        />
        <StatsCard
          title="Active Projects"
          value="24"
          change="+3"
          changeType="up"
          delay={80}
          icon={<FolderIcon />}
        />
        <StatsCard
          title="Avg. Completion"
          value="94.2%"
          change="+2.1%"
          changeType="up"
          delay={160}
          icon={<ChartIcon />}
        />
        <StatsCard
          title="Dispute Rate"
          value="3.8%"
          change="-0.5%"
          changeType="up"
          delay={240}
          icon={<ShieldIcon />}
        />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Volume Chart */}
        <div className="lg:col-span-3">
          <VolumeChart />
        </div>
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </div>

      {/* Projects */}
      <ProjectTable />
    </div>
  );
}

// ─── Volume Chart (SVG) ───

function VolumeChart() {
  const data = [32, 45, 28, 65, 52, 78, 62, 85, 73, 92, 88, 95];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const max = Math.max(...data);
  const width = 600;
  const height = 200;
  const padding = 40;

  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: height - padding - (v / max) * (height - padding * 2),
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div
      className="rounded-sm p-5"
      style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 font-semibold">Volume Trend</h3>
        <div className="flex gap-1.5">
          {["1W", "1M", "3M", "1Y"].map((period) => (
            <button key={period} className={period === "1M" ? "neu-chip-active text-xs" : "neu-chip text-xs"}>
              {period}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EBCEEC" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#EBCEEC" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#A87BA9" />
            <stop offset="100%" stopColor="#00CFCC" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            y1={height - padding - ratio * (height - padding * 2)}
            x2={width - padding}
            y2={height - padding - ratio * (height - padding * 2)}
            stroke="#E8E8E0"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        ))}
        {/* Area */}
        <path d={areaD} fill="url(#areaGrad)" />
        {/* Line */}
        <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="#FEFEFE"
            stroke={i === points.length - 1 ? "#00CFCC" : "#A87BA9"}
            strokeWidth="2"
          />
        ))}
        {/* X-axis labels */}
        {months.map((m, i) => (
          <text
            key={m}
            x={padding + (i / (months.length - 1)) * (width - padding * 2)}
            y={height - 10}
            textAnchor="middle"
            fontSize="9"
            fill="#A8A79E"
          >
            {m}
          </text>
        ))}
      </svg>
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

// ─── Project Page ───

function ProjectPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <ProjectTable />
    </div>
  );
}

// ─── Settings Page ───

function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h2 className="text-h2 font-semibold">Settings</h2>
        <p className="text-caption text-neutral-400 mt-1">Manage your Clave configuration</p>
      </div>

      <div className="rounded-sm p-6 space-y-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
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

function WalletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13" cy="10.5" r="1.2" fill="currentColor" />
      <path d="M6 5V4a2 2 0 012-2h4a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 6c0-1.1.9-2 2-2h3.17a2 2 0 011.41.59l1.42 1.41a2 2 0 001.41.59H15a2 2 0 012 2v6.5a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 17V7l4 3 3-5 4 4 3-3v11H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2l6 3v4.5c0 4-2.5 7-6 8.5-3.5-1.5-6-4.5-6-8.5V5l6-3z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 10l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

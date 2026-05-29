"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import WalletButton from "@/components/WalletButton";
import CreateProjectForm from "@/components/CreateProjectForm";
import WorkerDashboard from "@/components/WorkerDashboard";
import ApproveMilestoneSection from "@/components/ApproveMilestoneSection";
import ActivityFeed from "@/components/ActivityFeed";
import ProjectTable from "@/components/ProjectTable";
import ReputationExplorer from "@/components/ReputationExplorer";
import PayrollPage from "@/components/PayrollPage";
import { useRole } from "@/lib/wagmi";

export default function Home() {
  const [activePage, setActivePage] = useState("dashboard");
  const { role } = useRole();

  return (
    <div className="min-h-screen bg-surface-warm">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main Content */}
      <main className="ml-[240px] min-h-screen transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-8 border-b border-border" style={{ background: "rgba(248, 247, 244, 0.85)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3">
            <h1 className="text-h3 font-semibold capitalize">{activePage}</h1>
            <span className="text-xs text-neutral-400 bg-surface-muted px-2 py-0.5 rounded-full">Arc Testnet</span>
          </div>

          <div className="flex items-center gap-3">
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
  const { role } = useRole();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-display font-bold tracking-tight">Dashboard</h2>
          <p className="text-body text-neutral-400 mt-1">
            {role === "client" ? "Manage your projects and payments" :
             role === "worker" ? "Track your work and earnings" :
             "Payment infrastructure for web3 workers"}
          </p>
        </div>
      </div>

      {/* Role-specific content */}
      {role === "worker" && <WorkerDashboard />}
      {role === "client" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CreateProjectForm />
          <ApproveMilestoneSection />
        </div>
      )}
      {!role && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Volume" value="485,200 USDC" change="+12.5%" changeType="up" icon="💰" delay={0} />
            <StatsCard title="Active Projects" value="24" change="+3" changeType="up" icon="📋" delay={80} />
            <StatsCard title="Avg. Completion" value="94.2%" change="+2.1%" changeType="up" icon="✅" delay={160} />
            <StatsCard title="Dispute Rate" value="3.8%" change="-0.5%" changeType="up" icon="🛡️" delay={240} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3"><VolumeChart /></div>
            <div className="lg:col-span-2"><ActivityFeed /></div>
          </div>
          <ProjectTable />
        </>
      )}
    </div>
  );
}

// ─── Stats Card ───

function StatsCard({ title, value, change, changeType, icon, delay }: {
  title: string; value: string; change: string; changeType: "up" | "down"; icon: string; delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useState(() => { setTimeout(() => setVisible(true), delay); });

  return (
    <div className={`rounded-sm p-5 transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-sm bg-primary/30 flex items-center justify-center text-xl">{icon}</div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${changeType === "up" ? "bg-success text-success-text" : "bg-error text-error-text"}`}>
          {changeType === "up" ? "↑" : "↓"} {change}
        </span>
      </div>
      <p className="text-caption text-neutral-400 mb-1">{title}</p>
      <p className="text-h2 font-semibold tracking-tight">{value}</p>
    </div>
  );
}

// ─── Volume Chart ───

function VolumeChart() {
  const data = [32, 45, 28, 65, 52, 78, 62, 85, 73, 92, 88, 95];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const max = Math.max(...data);
  const width = 600, height = 200, padding = 40;
  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: height - padding - (v / max) * (height - padding * 2),
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 font-semibold">Volume Trend</h3>
        <div className="flex gap-1.5">
          {["1W", "1M", "3M", "1Y"].map((p) => (
            <button key={p} className={p === "1M" ? "neu-chip-active text-xs" : "neu-chip text-xs"}>{p}</button>
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
        {[0.25, 0.5, 0.75].map((r) => (
          <line key={r} x1={padding} y1={height - padding - r * (height - padding * 2)} x2={width - padding} y2={height - padding - r * (height - padding * 2)} stroke="#E8E8E0" strokeWidth="0.5" strokeDasharray="4 4" />
        ))}
        <path d={areaD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#FEFEFE" stroke={i === points.length - 1 ? "#00CFCC" : "#A87BA9"} strokeWidth="2" />
        ))}
        {months.map((m, i) => (
          <text key={m} x={padding + (i / (months.length - 1)) * (width - padding * 2)} y={height - 10} textAnchor="middle" fontSize="9" fill="#A8A79E">{m}</text>
        ))}
      </svg>
    </div>
  );
}

// ─── Other Pages ───

function ProjectPage() {
  return <div className="space-y-6 animate-fade-in"><ProjectTable /></div>;
}

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

function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h2 className="text-h2 font-semibold">Settings</h2>
        <p className="text-caption text-neutral-400 mt-1">Manage your Clave configuration</p>
      </div>
      <div className="rounded-sm p-6 space-y-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
        <div>
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
    </div>
  );
}

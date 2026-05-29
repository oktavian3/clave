"use client";

import { useState } from "react";
import CreateProjectForm from "./CreateProjectForm";
import ApproveMilestoneSection from "./ApproveMilestoneSection";
import EmptyState from "./EmptyState";

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "create" | "approve">("overview");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-display font-bold tracking-tight">Client Dashboard</h2>
          <p className="text-body text-neutral-400 mt-1">Manage your projects and payments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: "overview", label: "📊 Overview" },
          { id: "create", label: "➕ New Project" },
          { id: "approve", label: "✅ Approve Milestone" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={activeTab === tab.id ? "neu-chip-active" : "neu-chip"}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && <ClientOverview />}
      {activeTab === "create" && (
        <div className="max-w-2xl">
          <CreateProjectForm />
        </div>
      )}
      {activeTab === "approve" && (
        <div className="max-w-2xl">
          <ApproveMilestoneSection />
        </div>
      )}
    </div>
  );
}

function ClientOverview() {
  const [showTip, setShowTip] = useState(true);

  return (
    <div className="space-y-6">
      {/* Welcome tip */}
      {showTip && (
        <div className="rounded-sm p-5 bg-primary/10 border border-primary/20 flex items-start gap-3 animate-fade-in">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-1">Welcome to Clave!</p>
            <p className="text-xs text-neutral-500">
              Mulai dengan klik <strong>"New Project"</strong> untuk buat escrow agreement dengan worker.
              USDC kamu akan di-lock di smart contract sampai milestone di-approve.
            </p>
          </div>
          <button onClick={() => setShowTip(false)} className="text-neutral-400 hover:text-neutral-600 text-sm">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Projects" value="0" icon="📋" />
        <StatCard label="Total Escrowed" value="0 USDC" icon="🔒" />
        <StatCard label="Completed" value="0" icon="✅" />
      </div>

      {/* Recent Activity */}
      <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
        <h3 className="text-h3 font-semibold mb-4">Recent Activity</h3>
        <EmptyState
          icon="📭"
          title="No activity yet"
          description="Create your first project to see activity here. Funds will be locked in escrow until you approve milestones."
          action={{ label: "Create Project", onClick: () => {} }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-neutral-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-h2 font-semibold">{value}</p>
    </div>
  );
}

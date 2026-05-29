"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS, REPUTATION_ABI } from "@/lib/wagmi";
import WorkerDashboard from "./WorkerDashboard";

export default function WorkerView() {
  const [activeTab, setActiveTab] = useState<"overview" | "submit" | "reputation">("overview");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-display font-bold tracking-tight">Worker Dashboard</h2>
          <p className="text-body text-neutral-400 mt-1">Track your work and earnings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: "overview", label: "📊 Overview" },
          { id: "submit", label: "📤 Submit Milestone" },
          { id: "reputation", label: "⭐ Reputation" },
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
      {activeTab === "overview" && <WorkerOverview />}
      {activeTab === "submit" && (
        <div className="max-w-2xl">
          <WorkerDashboard />
        </div>
      )}
      {activeTab === "reputation" && (
        <div className="max-w-2xl">
          <WorkerReputation />
        </div>
      )}
    </div>
  );
}

function WorkerOverview() {
  const { address } = useAccount();
  const { data: reputation } = useReadContract({
    address: CONTRACTS.REPUTATION,
    abi: REPUTATION_ABI,
    functionName: "getScore",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const score = reputation ? Number(reputation) / 100 : 0;

  return (
    <div className="space-y-6">
      {/* Welcome tip */}
      <div className="rounded-sm p-5 bg-primary/10 border border-primary/20 flex items-start gap-3 animate-fade-in">
        <span className="text-2xl">💡</span>
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1">Welcome, Worker!</p>
          <p className="text-xs text-neutral-500">
            Setelah kerja selesai, klik <strong>"Submit Milestone"</strong> untuk request pembayaran.
            Client akan approve → USDC auto-release ke wallet kamu.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
          <span className="text-2xl mb-2 block">⭐</span>
          <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Reputation</p>
          <p className="text-h2 font-semibold">{score.toFixed(0)}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-400 to-focus" style={{ width: `${Math.min(score, 100)}%` }} />
          </div>
        </div>
        <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
          <span className="text-2xl mb-2 block">📋</span>
          <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Active Projects</p>
          <p className="text-h2 font-semibold">0</p>
        </div>
        <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
          <span className="text-2xl mb-2 block">💰</span>
          <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Total Earned</p>
          <p className="text-h2 font-semibold">0 USDC</p>
        </div>
        <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
          <span className="text-2xl mb-2 block">✅</span>
          <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Completed</p>
          <p className="text-h2 font-semibold">0</p>
        </div>
      </div>

      {/* Assigned Projects */}
      <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
        <h3 className="text-h3 font-semibold mb-4">Your Projects</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-semibold mb-1">No projects yet</p>
          <p className="text-sm text-neutral-400 max-w-sm">
            Projects assigned to you will appear here. Once a client creates a project with your wallet address, you can start working.
          </p>
        </div>
      </div>
    </div>
  );
}

function WorkerReputation() {
  const { address } = useAccount();
  const { data: reputation } = useReadContract({
    address: CONTRACTS.REPUTATION,
    abi: REPUTATION_ABI,
    functionName: "getScore",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: completionRate } = useReadContract({
    address: CONTRACTS.REPUTATION,
    abi: REPUTATION_ABI,
    functionName: "getCompletionRate",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const score = reputation ? Number(reputation) / 100 : 0;
  const compRate = completionRate ? Number(completionRate) / 100 : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-sm p-6" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
        <h3 className="text-h3 font-semibold mb-4">Your Reputation</h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-sm bg-surface-muted text-center">
            <p className="text-3xl font-bold text-primary-500">{score.toFixed(0)}%</p>
            <p className="text-xs text-neutral-400 mt-1">Overall Score</p>
          </div>
          <div className="p-4 rounded-sm bg-surface-muted text-center">
            <p className="text-3xl font-bold text-focus">{compRate.toFixed(0)}%</p>
            <p className="text-xs text-neutral-400 mt-1">Completion Rate</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Completion (40%)</span>
            <span className="font-medium">{compRate.toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full rounded-full bg-green-400" style={{ width: `${compRate}%` }} />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Volume (25%)</span>
            <span className="font-medium">0%</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full rounded-full bg-blue-400" style={{ width: "0%" }} />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Speed (20%)</span>
            <span className="font-medium">0%</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full rounded-full bg-purple-400" style={{ width: "0%" }} />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">No Disputes (15%)</span>
            <span className="font-medium">100%</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full rounded-full bg-focus" style={{ width: "100%" }} />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-sm p-6" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
        <h3 className="text-h3 font-semibold mb-4">Badges</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <p className="font-semibold mb-1">No badges yet</p>
          <p className="text-sm text-neutral-400">Complete projects to earn badges</p>
        </div>
      </div>
    </div>
  );
}

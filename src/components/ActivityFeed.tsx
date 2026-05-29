"use client";

import { useState } from "react";

interface Activity {
  id: number;
  type: "deposit" | "release" | "milestone" | "dispute" | "penalty" | "reputation";
  project: string;
  from: string;
  to: string;
  amount?: string;
  time: string;
  status: "success" | "pending" | "failed";
}

const mockActivity: Activity[] = [
  { id: 1, type: "deposit", project: "DeFi Dashboard", from: "0x7a3b...c4d", to: "Escrow", amount: "5,000 USDC", time: "2 min ago", status: "success" },
  { id: 2, type: "milestone", project: "NFT Marketplace", from: "0x9f2e...a1b", to: "Milestone #3", amount: "2,500 USDC", time: "15 min ago", status: "pending" },
  { id: 3, type: "release", project: "Smart Contract Audit", from: "Escrow", to: "0x4c8d...e2f", amount: "8,000 USDC", time: "1 hr ago", status: "success" },
  { id: 4, type: "penalty", project: "DAO Tooling", from: "0x1b5a...d3c", to: "Platform", amount: "150 USDC", time: "3 hr ago", status: "success" },
  { id: 5, type: "reputation", project: "—", from: "System", to: "0x7a3b...c4d", amount: "+12 pts", time: "5 hr ago", status: "success" },
  { id: 6, type: "dispute", project: "Token Launch", from: "0x3e7f...b2a", to: "Arbitration", amount: "3,000 USDC", time: "1 day ago", status: "pending" },
];

const typeConfig: Record<string, { color: string; bg: string; label: string }> = {
  deposit: { color: "text-blue-500", bg: "bg-blue-50", label: "Deposit" },
  release: { color: "text-green-600", bg: "bg-green-50", label: "Released" },
  milestone: { color: "text-primary-500", bg: "bg-primary-100", label: "Milestone" },
  dispute: { color: "text-orange-500", bg: "bg-orange-50", label: "Dispute" },
  penalty: { color: "text-red-500", bg: "bg-red-50", label: "Penalty" },
  reputation: { color: "text-purple-500", bg: "bg-purple-50", label: "Reputation" },
};

export default function ActivityFeed() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? mockActivity : mockActivity.filter((a) => a.type === filter);

  return (
    <div
      className="rounded-sm p-5"
      style={{
        background: "#FEFEFE",
        boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 font-semibold">Recent Activity</h3>
        <button className="text-caption text-neutral-400 hover:text-primary-500 transition-colors">
          View all →
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "deposit", "release", "milestone", "dispute"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? "neu-chip-active" : "neu-chip"}
          >
            {f === "all" ? "All" : typeConfig[f]?.label || f}
          </button>
        ))}
      </div>

      {/* Activity list */}
      <div className="space-y-2">
        {filtered.map((activity, i) => {
          const config = typeConfig[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 rounded-sm hover:bg-surface-muted transition-colors animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`w-8 h-8 rounded-sm ${config.bg} flex items-center justify-center flex-shrink-0`}>
                <span className={`text-xs font-bold ${config.color}`}>
                  {config.label.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{activity.project}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 truncate">
                  {activity.from} → {activity.to}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                {activity.amount && (
                  <p className="text-sm font-medium font-mono">{activity.amount}</p>
                )}
                <p className="text-xs text-neutral-400">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

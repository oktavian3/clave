"use client";

import { useState } from "react";

interface Worker {
  address: string;
  name: string;
  score: number;
  completed: number;
  volume: string;
  disputeRate: string;
  badges: string[];
}

const mockWorkers: Worker[] = [
  { address: "0x7a3b...c4d", name: "SolidityDev.sol", score: 9200, completed: 47, volume: "285,000", disputeRate: "2.1%", badges: ["Top Earner", "No Disputes"] },
  { address: "0x9f2e...a1b", name: "Web3Builder", score: 8750, completed: 32, volume: "180,000", disputeRate: "3.0%", badges: ["Fast Payer"] },
  { address: "0x4c8d...e2f", name: "DeFiWizard", score: 8100, completed: 28, volume: "142,000", disputeRate: "5.2%", badges: [] },
  { address: "0x1b5a...d3c", name: "AuditKing", score: 7600, completed: 19, volume: "95,000", disputeRate: "8.5%", badges: ["Rising Star"] },
  { address: "0x3e7f...b2a", name: "NFTArtist", score: 6200, completed: 12, volume: "48,000", disputeRate: "12.0%", badges: [] },
  { address: "0x5a9d...c3b", name: "BackendNode", score: 5800, completed: 8, volume: "32,000", disputeRate: "15.0%", badges: [] },
];

function getScoreColor(score: number) {
  if (score >= 8000) return { color: "text-green-600", bg: "bg-green-50", bar: "bg-green-400" };
  if (score >= 6000) return { color: "text-blue-600", bg: "bg-blue-50", bar: "bg-blue-400" };
  if (score >= 4000) return { color: "text-orange-600", bg: "bg-orange-50", bar: "bg-orange-400" };
  return { color: "text-red-600", bg: "bg-red-50", bar: "bg-red-400" };
}

function getScoreLabel(score: number) {
  if (score >= 9000) return "Excellent";
  if (score >= 7500) return "Good";
  if (score >= 5000) return "Fair";
  return "Poor";
}

export default function ReputationExplorer() {
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2 font-semibold">Reputation Explorer</h2>
          <p className="text-caption text-neutral-400 mt-1">Onchain scores for web3 workers on Clave</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "neu-chip-active" : "neu-chip"}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "neu-chip-active" : "neu-chip"}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Workers Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockWorkers.map((worker, i) => {
            const scoreConfig = getScoreColor(worker.score);
            return (
              <div
                key={worker.address}
                className={`rounded-sm p-5 cursor-pointer transition-all duration-300 hover:shadow-card-hover animate-fade-in ${
                  selectedWorker?.address === worker.address ? "ring-2 ring-focus/30" : ""
                }`}
                style={{
                  background: "#FEFEFE",
                  boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF",
                  animationDelay: `${i * 60}ms`,
                }}
                onClick={() => setSelectedWorker(selectedWorker?.address === worker.address ? null : worker)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-sm font-bold text-primary-500">
                      {worker.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{worker.name}</p>
                      <p className="text-xs text-neutral-400 font-mono">{worker.address}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${scoreConfig.bg} ${scoreConfig.color}`}>
                    {getScoreLabel(worker.score)}
                  </div>
                </div>

                {/* Score bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Score</span>
                    <span className="font-mono">{(worker.score / 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${scoreConfig.bar}`}
                      style={{ width: `${worker.score / 100}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-sm bg-surface-muted">
                    <p className="text-xs text-neutral-400">Done</p>
                    <p className="text-sm font-semibold">{worker.completed}</p>
                  </div>
                  <div className="p-2 rounded-sm bg-surface-muted">
                    <p className="text-xs text-neutral-400">Volume</p>
                    <p className="text-sm font-semibold">{worker.volume}</p>
                  </div>
                  <div className="p-2 rounded-sm bg-surface-muted">
                    <p className="text-xs text-neutral-400">Disputes</p>
                    <p className="text-sm font-semibold">{worker.disputeRate}</p>
                  </div>
                </div>

                {/* Badges */}
                {worker.badges.length > 0 && (
                  <div className="flex gap-1.5 mt-3">
                    {worker.badges.map((badge) => (
                      <span key={badge} className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary-500 font-medium">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="rounded-sm overflow-hidden"
          style={{
            background: "#FEFEFE",
            boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF",
          }}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-muted/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Worker</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Score</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Completed</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Volume</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Dispute Rate</th>
              </tr>
            </thead>
            <tbody>
              {mockWorkers.map((worker) => {
                const scoreConfig = getScoreColor(worker.score);
                return (
                  <tr
                    key={worker.address}
                    className="border-b border-border-light hover:bg-surface-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedWorker(worker)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary-500">
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{worker.name}</p>
                          <p className="text-xs text-neutral-400 font-mono">{worker.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                          <div className={`h-full rounded-full ${scoreConfig.bar}`} style={{ width: `${worker.score / 100}%` }} />
                        </div>
                        <span className={`text-xs font-mono ${scoreConfig.color}`}>{(worker.score / 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium">{worker.completed}</td>
                    <td className="px-5 py-3 text-sm font-mono">{worker.volume} USDC</td>
                    <td className="px-5 py-3 text-sm font-mono">{worker.disputeRate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

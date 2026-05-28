"use client";

import { useState } from "react";

interface Project {
  id: number;
  name: string;
  client: string;
  worker: string;
  budget: number;
  released: number;
  status: "active" | "completed" | "disputed" | "pending";
  deadline: string;
  milestones: { total: number; done: number };
}

const mockProjects: Project[] = [
  { id: 1, name: "DeFi Dashboard UI", client: "0x7a3b...c4d", worker: "0x9f2e...a1b", budget: 12000, released: 8500, status: "active", deadline: "Jun 15", milestones: { total: 5, done: 3 } },
  { id: 2, name: "NFT Marketplace", client: "0x1b5a...d3c", worker: "0x4c8d...e2f", budget: 25000, released: 25000, status: "completed", deadline: "May 20", milestones: { total: 4, done: 4 } },
  { id: 3, name: "Smart Contract Audit", client: "0x3e7f...b2a", worker: "0x8d2c...f1e", budget: 8000, released: 0, status: "disputed", deadline: "May 25", milestones: { total: 3, done: 1 } },
  { id: 4, name: "DAO Governance Tool", client: "0x5a9d...c3b", worker: "0x2f4e...d8a", budget: 15000, released: 5000, status: "active", deadline: "Jul 01", milestones: { total: 6, done: 2 } },
  { id: 5, name: "Token Launch Site", client: "0x6c1b...e4a", worker: "0x7d3f...a2c", budget: 6000, released: 6000, status: "completed", deadline: "May 10", milestones: { total: 3, done: 3 } },
  { id: 6, name: "Cross-chain Bridge UI", client: "0x8e4d...b1f", worker: "0x3a7c...e5d", budget: 18000, released: 9000, status: "active", deadline: "Jun 30", milestones: { total: 4, done: 2 } },
];

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  active: { color: "text-green-600", bg: "bg-green-50", dot: "bg-green-400" },
  completed: { color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-400" },
  disputed: { color: "text-orange-600", bg: "bg-orange-50", dot: "bg-orange-400" },
  pending: { color: "text-neutral-500", bg: "bg-neutral-100", dot: "bg-neutral-400" },
};

export default function ProjectTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const filtered = mockProjects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{
        background: "#FEFEFE",
        boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF",
      }}
    >
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h3 font-semibold">Projects</h3>
          <button className="px-4 py-2 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200">
            + New Project
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex gap-1.5">
            {["all", "active", "completed", "disputed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  statusFilter === s
                    ? "neu-chip-active"
                    : "neu-chip"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-muted/50">
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Project</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Budget</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Progress</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Deadline</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => {
              const config = statusConfig[project.status];
              const progress = project.budget > 0 ? (project.released / project.budget) * 100 : 0;
              const isExpanded = expandedRow === project.id;

              return (
                <>
                  <tr
                    key={`row-${project.id}`}
                    className="border-b border-border-light hover:bg-surface-muted/30 transition-colors cursor-pointer"
                    onClick={() => setExpandedRow(isExpanded ? null : project.id)}
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium">{project.name}</p>
                        <p className="text-xs text-neutral-400 font-mono mt-0.5">
                          {project.client} → {project.worker}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium font-mono">{project.budget.toLocaleString()} USDC</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs text-neutral-400 mb-1">
                          <span>{project.milestones.done}/{project.milestones.total} ms</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${progress}%`,
                              background: "linear-gradient(90deg, #EBCEEC, #00CFCC)",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                        {project.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-neutral-500">{project.deadline}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="3" r="1" fill="currentColor" />
                          <circle cx="8" cy="8" r="1" fill="currentColor" />
                          <circle cx="8" cy="13" r="1" fill="currentColor" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`expand-${project.id}`}>
                      <td colSpan={6} className="px-5 py-4 bg-surface-muted/30">
                        <div className="grid grid-cols-3 gap-4 text-sm animate-fade-in">
                          <div>
                            <p className="text-xs text-neutral-400 mb-1">Released</p>
                            <p className="font-medium">{project.released.toLocaleString()} USDC</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-400 mb-1">Remaining</p>
                            <p className="font-medium">{(project.budget - project.released).toLocaleString()} USDC</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-400 mb-1">Milestones</p>
                            <p className="font-medium">{project.milestones.done} of {project.milestones.total}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

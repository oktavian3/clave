"use client";

import { useState } from "react";

interface PayrollEntry {
  id: number;
  name: string;
  address: string;
  role: string;
  amount: number;
  frequency: "monthly" | "bi-weekly" | "weekly";
  nextPay: string;
  status: "active" | "paused" | "completed";
}

const mockPayroll: PayrollEntry[] = [
  { id: 1, name: "Alex Chen", address: "0x7a3b...c4d", role: "Smart Contract Dev", amount: 5000, frequency: "monthly", nextPay: "Jun 1", status: "active" },
  { id: 2, name: "Sarah Kim", address: "0x9f2e...a1b", role: "Frontend Engineer", amount: 4500, frequency: "monthly", nextPay: "Jun 1", status: "active" },
  { id: 3, name: "Mike Johnson", address: "0x4c8d...e2f", role: "Security Auditor", amount: 3000, frequency: "bi-weekly", nextPay: "May 30", status: "active" },
  { id: 4, name: "Lisa Wang", address: "0x1b5a...d3c", role: "UI/UX Designer", amount: 3500, frequency: "monthly", nextPay: "Jun 1", status: "paused" },
  { id: 5, name: "Tom Davis", address: "0x3e7f...b2a", role: "DevOps", amount: 4000, frequency: "monthly", nextPay: "Jun 1", status: "active" },
];

const frequencyColors: Record<string, string> = {
  monthly: "bg-blue-50 text-blue-600",
  "bi-weekly": "bg-purple-50 text-purple-600",
  weekly: "bg-green-50 text-green-600",
};

const statusColors: Record<string, { dot: string; text: string; bg: string }> = {
  active: { dot: "bg-green-400", text: "text-green-600", bg: "bg-green-50" },
  paused: { dot: "bg-yellow-400", text: "text-yellow-600", bg: "bg-yellow-50" },
  completed: { dot: "bg-blue-400", text: "text-blue-600", bg: "bg-blue-50" },
};

export default function PayrollPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  const totalMonthly = mockPayroll
    .filter((e) => e.status === "active")
    .reduce((sum, e) => {
      if (e.frequency === "weekly") return sum + e.amount * 4;
      if (e.frequency === "bi-weekly") return sum + e.amount * 2;
      return sum + e.amount;
    }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2 font-semibold">Payroll</h2>
          <p className="text-caption text-neutral-400 mt-1">Manage recurring payments for your team</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200"
        >
          + Add Employee
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
          <p className="text-caption text-neutral-400 mb-1">Monthly Burn</p>
          <p className="text-h2 font-semibold">{totalMonthly.toLocaleString()} USDC</p>
        </div>
        <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
          <p className="text-caption text-neutral-400 mb-1">Active Employees</p>
          <p className="text-h2 font-semibold">{mockPayroll.filter((e) => e.status === "active").length}</p>
        </div>
        <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
          <p className="text-caption text-neutral-400 mb-1">Next Pay Run</p>
          <p className="text-h2 font-semibold">May 30</p>
          <p className="text-xs text-neutral-400 mt-1">2 payments scheduled</p>
        </div>
      </div>

      {/* Payroll Table */}
      <div
        className="rounded-sm overflow-hidden"
        style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-muted/50">
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Employee</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Amount</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Frequency</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Next Pay</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {mockPayroll.map((entry) => {
              const status = statusColors[entry.status];
              return (
                <tr key={entry.id} className="border-b border-border-light hover:bg-surface-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-sm font-bold text-primary-500">
                        {entry.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{entry.name}</p>
                        <p className="text-xs text-neutral-400">{entry.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium font-mono">{entry.amount.toLocaleString()} USDC</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${frequencyColors[entry.frequency]}`}>
                      {entry.frequency}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-neutral-500">{entry.nextPay}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-neutral-400 hover:text-neutral-600 transition-colors text-sm">
                      •••
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)}>
          <div
            className="w-full max-w-md rounded-sm p-6 animate-scale-in"
            style={{ background: "#FEFEFE", boxShadow: "8px 8px 18px #C8C7C1, -8px -8px 18px #FFFFFF" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-h3 font-semibold mb-4">Add Employee</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Name</label>
                <input type="text" placeholder="John Doe" className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Wallet Address</label>
                <input type="text" placeholder="0x..." className="w-full px-4 py-2.5 rounded-sm text-sm font-mono neu-input focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Role</label>
                <input type="text" placeholder="Smart Contract Dev" className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Amount (USDC)</label>
                  <input type="number" placeholder="5000" className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Frequency</label>
                  <select className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none bg-transparent">
                    <option>Monthly</option>
                    <option>Bi-weekly</option>
                    <option>Weekly</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 rounded-sm text-sm font-medium neu-tab hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200"
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { arcTestnet, CONTRACTS, USDC_ABI, ESCROW_ABI } from "@/lib/wagmi";

interface Milestone {
  description: string;
  amount: string;
  deadline: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { address } = useAccount();
  const [workerAddress, setWorkerAddress] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { description: "", amount: "", deadline: "" },
  ]);
  const [step, setStep] = useState<"form" | "approving" | "creating" | "success" | "error">("form");
  const [error, setError] = useState("");

  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  if (!isOpen) return null;

  const addMilestone = () => {
    setMilestones([...milestones, { description: "", amount: "", deadline: "" }]);
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const totalMilestoneAmount = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  const handleCreateProject = async () => {
    if (!workerAddress || !totalBudget || !deadline) {
      setError("Fill in all required fields");
      return;
    }

    if (totalMilestoneAmount > parseFloat(totalBudget)) {
      setError("Milestone amounts exceed total budget");
      return;
    }

    setStep("approving");
    setError("");

    try {
      const budgetWei = parseUnits(totalBudget, 6);
      const deadlineTs = Math.floor(new Date(deadline).getTime() / 1000);

      // Step 1: Approve USDC to escrow contract
      await writeContractAsync({
        address: CONTRACTS.USDC,
        abi: USDC_ABI,
        functionName: "approve",
        args: [CONTRACTS.ESCROW, budgetWei],
        chainId: arcTestnet.id,
      });

      // Step 2: Create project on escrow
      setStep("creating");
      await writeContractAsync({
        address: CONTRACTS.ESCROW,
        abi: ESCROW_ABI,
        functionName: "createProject",
        args: [workerAddress, budgetWei, BigInt(deadlineTs)],
        chainId: arcTestnet.id,
      });

      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setError(message.length > 100 ? message.slice(0, 100) + "..." : message);
      setStep("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative rounded-sm p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-fade-in"
        style={{ background: "#FEFEFE", boxShadow: "5px 5px 20px rgba(0,0,0,0.15)" }}
      >
        {step === "success" ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-h2 font-semibold mb-2">Project Created!</h3>
            <p className="text-sm text-neutral-400 mb-6">Escrow sudah aktif di Arc Testnet</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-h3 font-semibold">Create New Project</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-sm flex items-center justify-center hover:bg-surface-muted transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step !== "form" ? "bg-focus text-white" : "bg-primary text-primary-500"}`}>
                {step !== "form" ? "✓" : "1"}
              </div>
              <div className={`flex-1 h-0.5 ${step !== "form" ? "bg-focus" : "bg-neutral-200"}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === "approving" || step === "creating" ? "bg-focus text-white" :
                step === "error" ? "bg-red-400 text-white" :
                "bg-neutral-200 text-neutral-400"
              }`}>
                {step === "error" ? "✕" : "2"}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-sm bg-red-50 text-red-600 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Worker Address */}
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Worker Wallet Address *</label>
                <input
                  type="text"
                  value={workerAddress}
                  onChange={(e) => setWorkerAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none font-mono"
                />
              </div>

              {/* Total Budget */}
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Total Budget (USDC) *</label>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="5000"
                  min="0"
                  step="100"
                  className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Project Deadline *</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none"
                />
              </div>

              {/* Milestones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-neutral-400">Milestones</label>
                  <button
                    onClick={addMilestone}
                    disabled={step !== "form"}
                    className="text-xs text-focus hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Add Milestone
                  </button>
                </div>

                <div className="space-y-3">
                  {milestones.map((ms, i) => (
                    <div key={i} className="p-3 rounded-sm bg-surface-muted space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Milestone {i + 1}</span>
                        {milestones.length > 1 && (
                          <button
                            onClick={() => removeMilestone(i)}
                            disabled={step !== "form"}
                            className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={ms.description}
                        onChange={(e) => updateMilestone(i, "description", e.target.value)}
                        placeholder="Description (e.g., Design UI)"
                        disabled={step !== "form"}
                        className="w-full px-3 py-2 rounded-sm text-xs neu-input focus:outline-none disabled:opacity-50"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={ms.amount}
                          onChange={(e) => updateMilestone(i, "amount", e.target.value)}
                          placeholder="Amount (USDC)"
                          min="0"
                          disabled={step !== "form"}
                          className="flex-1 px-3 py-2 rounded-sm text-xs neu-input focus:outline-none disabled:opacity-50"
                        />
                        <input
                          type="date"
                          value={ms.deadline}
                          onChange={(e) => updateMilestone(i, "deadline", e.target.value)}
                          disabled={step !== "form"}
                          className="flex-1 px-3 py-2 rounded-sm text-xs neu-input focus:outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Summary */}
              {totalBudget && (
                <div className="p-3 rounded-sm bg-surface-muted">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Total Budget</span>
                    <span className="font-medium">{totalBudget} USDC</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-neutral-400">Milestones Total</span>
                    <span className="font-medium">{totalMilestoneAmount} USDC</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setStep("form"); setError(""); }}
                className="flex-1 py-2.5 rounded-sm text-sm text-neutral-500 hover:bg-surface-muted transition-colors"
              >
                {step === "error" ? "Retry" : "Cancel"}
              </button>
              <button
                onClick={handleCreateProject}
                disabled={step === "approving" || step === "creating" || (isPending && step === "form")}
                className="flex-1 py-2.5 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200 disabled:opacity-50"
              >
                {step === "approving"
                  ? "⏳ Approving USDC..."
                  : step === "creating"
                  ? "⏳ Creating Project..."
                  : "Create Project"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

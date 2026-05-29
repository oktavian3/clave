"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { CONTRACTS, ESCROW_ABI, USDC_ABI, useRole } from "@/lib/wagmi";

interface MilestoneInput {
  description: string;
  amount: string;
  deadline: string;
}

export default function CreateProjectForm({ onCreated }: { onCreated?: () => void }) {
  const { address, isConnected } = useAccount();
  const { role } = useRole();
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const [worker, setWorker] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { description: "", amount: "", deadline: "" },
  ]);
  const [step, setStep] = useState<"form" | "approving" | "depositing" | "done" | "error">("form");
  const [error, setError] = useState("");

  function addMilestone() {
    setMilestones([...milestones, { description: "", amount: "", deadline: "" }]);
  }

  function updateMilestone(index: number, field: keyof MilestoneInput, value: string) {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  }

  function removeMilestone(index: number) {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  }

  async function handleCreate() {
    if (!isConnected || !address) return setError("Connect wallet dulu");
    if (role !== "client") return setError("Harus login sebagai Client");
    if (!worker || !totalBudget || !deadline) return setError("Isi semua field");
    if (milestones.some(m => !m.description || !m.amount || !m.deadline)) return setError("Isi semua milestone");

    try {
      setError("");
      const budgetWei = parseUnits(totalBudget, 6);
      const deadlineTs = Math.floor(new Date(deadline).getTime() / 1000);

      // Step 1: Create project
      setStep("approving");
      const tx1 = await writeContractAsync({
        address: CONTRACTS.ESCROW,
        abi: ESCROW_ABI,
        functionName: "createProject",
        args: [worker as `0x${string}`, budgetWei, BigInt(deadlineTs)],
      });

      // Step 2: Approve USDC
      setStep("approving");
      const tx2 = await writeContractAsync({
        address: CONTRACTS.USDC,
        abi: USDC_ABI,
        functionName: "approve",
        args: [CONTRACTS.ESCROW, budgetWei],
      });

      // Step 3: Deposit
      setStep("depositing");
      const tx3 = await writeContractAsync({
        address: CONTRACTS.ESCROW,
        abi: ESCROW_ABI,
        functionName: "deposit",
        args: [BigInt(1), budgetWei], // projectId = 1 for simplicity
      });

      // Step 4: Add milestones
      for (const ms of milestones) {
        const msDeadline = Math.floor(new Date(ms.deadline).getTime() / 1000);
        const msAmount = parseUnits(ms.amount, 6);
        await writeContractAsync({
          address: CONTRACTS.ESCROW,
          abi: ESCROW_ABI,
          functionName: "addMilestone",
          args: [BigInt(1), ms.description, msAmount, BigInt(msDeadline)],
        });
      }

      setStep("done");
      onCreated?.();
    } catch (err: any) {
      console.error(err);
      setError(err.message?.slice(0, 100) || "Transaction failed");
      setStep("error");
    }
  }

  if (role !== "client") {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400">Login sebagai <strong>Client</strong> untuk buat project</p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-h3 font-semibold mb-2">Project Created!</h3>
        <p className="text-caption text-neutral-400 mb-4">Funds locked in escrow. Worker bisa mulai kerja.</p>
        <button
          onClick={() => { setStep("form"); setWorker(""); setTotalBudget(""); setMilestones([{ description: "", amount: "", deadline: "" }]); }}
          className="px-6 py-2.5 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5]"
        >
          Create Another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3 rounded-sm bg-error text-error-text text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Worker Address */}
      <div>
        <label className="text-xs text-neutral-400 mb-1.5 block">Worker Wallet Address</label>
        <input
          type="text"
          value={worker}
          onChange={(e) => setWorker(e.target.value)}
          placeholder="0x..."
          className="w-full px-4 py-2.5 rounded-sm text-sm font-mono neu-input focus:outline-none"
        />
      </div>

      {/* Total Budget */}
      <div>
        <label className="text-xs text-neutral-400 mb-1.5 block">Total Budget (USDC)</label>
        <input
          type="number"
          value={totalBudget}
          onChange={(e) => setTotalBudget(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none"
        />
      </div>

      {/* Deadline */}
      <div>
        <label className="text-xs text-neutral-400 mb-1.5 block">Project Deadline</label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none"
        />
      </div>

      {/* Milestones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs text-neutral-400">Milestones</label>
          <button onClick={addMilestone} className="text-xs text-focus font-medium hover:underline">
            + Add Milestone
          </button>
        </div>

        <div className="space-y-3">
          {milestones.map((ms, i) => (
            <div key={i} className="p-4 rounded-sm bg-surface-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Milestone {i + 1}</span>
                {milestones.length > 1 && (
                  <button onClick={() => removeMilestone(i)} className="text-xs text-red-400 hover:text-red-300">
                    Remove
                  </button>
                )}
              </div>
              <input
                type="text"
                value={ms.description}
                onChange={(e) => updateMilestone(i, "description", e.target.value)}
                placeholder="Description..."
                className="w-full px-3 py-2 rounded-sm text-sm neu-input focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={ms.amount}
                  onChange={(e) => updateMilestone(i, "amount", e.target.value)}
                  placeholder="USDC"
                  min="0"
                  className="px-3 py-2 rounded-sm text-sm neu-input focus:outline-none"
                />
                <input
                  type="datetime-local"
                  value={ms.deadline}
                  onChange={(e) => updateMilestone(i, "deadline", e.target.value)}
                  className="px-3 py-2 rounded-sm text-sm neu-input focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleCreate}
        disabled={isPending || isConfirming || step !== "form"}
        className="w-full py-3 rounded-sm bg-primary text-primary-500 font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {step === "approving" ? "⏳ Approve USDC in MetaMask..." :
         step === "depositing" ? "⏳ Depositing to Escrow..." :
         isPending ? "⏳ Confirming..." :
         isConfirming ? "⏳ Waiting for confirmation..." :
         "Create Project on Arc"}
      </button>

      {txHash && (
        <p className="text-xs text-neutral-400 text-center font-mono">
          Tx: <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener" className="text-focus hover:underline">{txHash.slice(0, 16)}...</a>
        </p>
      )}
    </div>
  );
}

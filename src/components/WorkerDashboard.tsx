"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, ESCROW_ABI, REPUTATION_ABI, useRole } from "@/lib/wagmi";

export default function WorkerDashboard() {
  const { address, isConnected } = useAccount();
  const { role } = useRole();

  const { data: reputation } = useReadContract({
    address: CONTRACTS.REPUTATION,
    abi: REPUTATION_ABI,
    functionName: "getScore",
    args: address ? [address] : undefined,
    query: { enabled: !!address && role === "worker" },
  });

  const { data: completionRate } = useReadContract({
    address: CONTRACTS.REPUTATION,
    abi: REPUTATION_ABI,
    functionName: "getCompletionRate",
    args: address ? [address] : undefined,
    query: { enabled: !!address && role === "worker" },
  });

  if (role !== "worker") {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400">Login sebagai <strong>Worker</strong> untuk melihat dashboard ini</p>
      </div>
    );
  }

  const score = reputation ? Number(reputation) / 100 : 0;
  const compRate = completionRate ? Number(completionRate) / 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-h2 font-semibold">Worker Dashboard</h2>
        <p className="text-caption text-neutral-400 mt-1">Track your work and reputation on Clave</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
          <p className="text-caption text-neutral-400 mb-1">Reputation Score</p>
          <p className="text-h2 font-semibold">{score.toFixed(0)}%</p>
          <div className="mt-2 h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-400 to-focus transition-all duration-1000"
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
        </div>
        <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
          <p className="text-caption text-neutral-400 mb-1">Completion Rate</p>
          <p className="text-h2 font-semibold">{compRate.toFixed(0)}%</p>
        </div>
        <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
          <p className="text-caption text-neutral-400 mb-1">Your Address</p>
          <p className="text-sm font-mono mt-2 break-all">{address}</p>
        </div>
      </div>

      {/* Submit Milestone */}
      <SubmitMilestoneSection />
    </div>
  );
}

function SubmitMilestoneSection() {
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const [projectId, setProjectId] = useState("");
  const [milestoneIdx, setMilestoneIdx] = useState("");
  const [step, setStep] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!projectId || !milestoneIdx) return setError("Isi project ID & milestone index");
    try {
      setError("");
      setStep("submitting");
      await writeContractAsync({
        address: CONTRACTS.ESCROW,
        abi: ESCROW_ABI,
        functionName: "submitMilestone",
        args: [BigInt(projectId), BigInt(milestoneIdx)],
      });
      setStep("done");
    } catch (err: any) {
      setError(err.message?.slice(0, 100) || "Failed");
      setStep("error");
    }
  }

  return (
    <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
      <h3 className="text-h3 font-semibold mb-4">Submit Milestone</h3>

      {step === "done" ? (
        <div className="text-center py-6 animate-fade-in">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-semibold">Milestone Submitted!</p>
          <p className="text-sm text-neutral-400 mt-1">Client akan dapat notifikasi untuk approve</p>
          <button onClick={() => setStep("idle")} className="mt-3 text-sm text-focus hover:underline">
            Submit Another
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {error && <p className="text-sm text-error-text bg-error p-2 rounded-sm">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Project ID</label>
              <input
                type="number"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 rounded-sm text-sm neu-input focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Milestone Index</label>
              <input
                type="number"
                value={milestoneIdx}
                onChange={(e) => setMilestoneIdx(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-sm text-sm neu-input focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isPending || isConfirming}
            className="w-full py-2.5 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] disabled:opacity-50 transition-all"
          >
            {isPending ? "⏳ Confirm in MetaMask..." : isConfirming ? "⏳ Submitting..." : "Submit Milestone"}
          </button>
          {txHash && (
            <p className="text-xs text-neutral-400 text-center font-mono">
              Tx: <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" className="text-focus hover:underline">{txHash.slice(0, 16)}...</a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, ESCROW_ABI, useRole } from "@/lib/wagmi";

export default function ApproveMilestoneSection() {
  const { role } = useRole();
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const [projectId, setProjectId] = useState("");
  const [milestoneIdx, setMilestoneIdx] = useState("");
  const [step, setStep] = useState<"idle" | "approving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleApprove() {
    if (!projectId || !milestoneIdx) return setError("Isi project ID & milestone index");
    try {
      setError("");
      setStep("approving");
      await writeContractAsync({
        address: CONTRACTS.ESCROW,
        abi: ESCROW_ABI,
        functionName: "approveMilestone",
        args: [BigInt(projectId), BigInt(milestoneIdx)],
      });
      setStep("done");
    } catch (err: any) {
      setError(err.message?.slice(0, 100) || "Failed");
      setStep("error");
    }
  }

  if (role !== "client") return null;

  return (
    <div className="rounded-sm p-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
      <h3 className="text-h3 font-semibold mb-4">Approve Milestone</h3>

      {step === "done" ? (
        <div className="text-center py-6 animate-fade-in">
          <div className="text-4xl mb-3">💸</div>
          <p className="font-semibold">Milestone Approved!</p>
          <p className="text-sm text-neutral-400 mt-1">USDC auto-release ke worker</p>
          <button onClick={() => setStep("idle")} className="mt-3 text-sm text-focus hover:underline">
            Approve Another
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
            onClick={handleApprove}
            disabled={isPending || isConfirming}
            className="w-full py-2.5 rounded-sm bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-all"
          >
            {isPending ? "⏳ Confirm in MetaMask..." : isConfirming ? "⏳ Approving..." : "Approve & Release USDC"}
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

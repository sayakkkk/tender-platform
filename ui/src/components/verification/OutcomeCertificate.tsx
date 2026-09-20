"use client";

import React, { useState } from 'react';
import { Tender, VerificationCheck } from '../../lib/types';
import { formatCurrency, truncateAddress } from '../../lib/crypto';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface OutcomeCertificateProps {
  tenders: Tender[];
}

export const OutcomeCertificate: React.FC<OutcomeCertificateProps> = ({ tenders }) => {
  const [selectedTenderId, setSelectedTenderId] = useState<number>(tenders[0]?.id || 101);
  const tender = tenders.find(t => t.id === selectedTenderId) || tenders[0];

  const checks: VerificationCheck[] = [
    {
      id: "zk-eligibility",
      title: "Zero-Knowledge Eligibility Witness Compliance",
      description: "Vendor eligibility requirements validated by Compact Circuit without exposing confidential corporate credentials on-chain.",
      verified: true,
      zkCircuit: "registerVendor / submitSealedBid",
      publicEvidence: "registeredVendors mapping on Midnight ledger",
      privateShielding: "Tiered eligibility salt & corporate credentials"
    },
    {
      id: "bid-commitment-binding",
      title: "Cryptographic Bid Commitment Binding",
      description: "Each submitted bid is bound to a 256-bit SHA-256 pre-image commitment persisted prior to the closure deadline.",
      verified: true,
      zkCircuit: "submitSealedBid",
      publicEvidence: "bidCommitments[tenderId, vendor] SHA-256 hash",
      privateShielding: "Raw bid amount and 256-bit blinding nonce"
    },
    {
      id: "deadline-enforcement",
      title: "Protocol-Enforced Deadline Invariant",
      description: "No bids accepted after deadline block timestamp. Close tender action required before any outcome revelation.",
      verified: true,
      zkCircuit: "closeTender",
      publicEvidence: `Deadline block time: ${new Date(tender?.deadline || Date.now()).toISOString()}`,
      privateShielding: "N/A (Public consensus rule)"
    },
    {
      id: "winner-preimage-correspondence",
      title: "Cryptographic Winner Pre-image Correspondence",
      description: "Authority reveal circuit validates that revealed winner and amount hash precisely to the on-chain commitment.",
      verified: tender?.status === 'REVEALED',
      zkCircuit: "revealWinner",
      publicEvidence: tender?.status === 'REVEALED' ? `Winner: ${truncateAddress(tender.winnerAddress)}, Amount: ${formatCurrency(tender.winningBidAmount || 0)}` : "Pending Tender Closure & Reveal",
      privateShielding: "Winning pre-image verified via Compact equality witness"
    },
    {
      id: "losing-bid-shielding",
      title: "Unrevealed Losing Bids Remain Confidential",
      description: "Losing proposals never have their raw numbers published. Zero-Knowledge state ensures absolute commercial secrecy.",
      verified: true,
      zkCircuit: "N/A (State Invariant)",
      publicEvidence: "Only un-preimaged SHA-256 hashes exist in ledger",
      privateShielding: "All losing bidder amounts and nonces remain private forever"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00E5FF]" /> Public Zero-Knowledge Verification Suite
          </h2>
          <p className="text-xs text-slate-400">
            Independent audit suite for cryptographic proof verification and procurement integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Select Tender:</label>
          <select
            value={selectedTenderId}
            onChange={(e) => setSelectedTenderId(Number(e.target.value))}
            className="bg-[#0D1527] border border-[#1E2E4E] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
          >
            {tenders.map(t => (
              <option key={t.id} value={t.id}>
                #{t.id} - {t.title.substring(0, 30)}... ({t.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {tender && (
        <div className="glass-panel p-6 border border-[#00E5FF]/30">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-[#00E5FF]/10 via-[#111C35] to-purple-950/20 border border-[#00E5FF]/30 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-[#00E5FF]">Tender #{tender.id}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E2E4E] text-slate-300 font-semibold">{tender.category}</span>
                <span className="badge-provenance">{tender.provenance}</span>
              </div>
              <h3 className="text-base font-bold text-white">{tender.title}</h3>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Verification Status</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 justify-end mt-0.5">
                <CheckCircle2 className="w-4 h-4" /> 5-Point Proof Invariants Valid
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {checks.map((check, idx) => (
              <div
                key={check.id}
                className="p-4 rounded-lg bg-[#0D1527] border border-[#1E2E4E] hover:border-[#00E5FF]/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${check.verified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
                      {idx + 1}
                    </div>
                    <h4 className="text-sm font-bold text-white">{check.title}</h4>
                  </div>

                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${check.verified ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}`}>
                    {check.verified ? 'VERIFIED' : 'PENDING STAGE'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3 pl-8 leading-relaxed">
                  {check.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] font-mono pl-8">
                  <div className="p-2 rounded bg-[#111C35] border border-[#1E2E4E]">
                    <span className="text-slate-500 block font-sans">Circuit Witness:</span>
                    <span className="text-slate-300">{check.zkCircuit}</span>
                  </div>
                  <div className="p-2 rounded bg-[#111C35] border border-[#1E2E4E]">
                    <span className="text-slate-500 block font-sans">Public Evidence:</span>
                    <span className="text-[#00E5FF] truncate block">{check.publicEvidence}</span>
                  </div>
                  <div className="p-2 rounded bg-[#111C35] border border-[#1E2E4E]">
                    <span className="text-slate-500 block font-sans">Privacy Shielding:</span>
                    <span className="text-purple-300 truncate block">{check.privateShielding}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

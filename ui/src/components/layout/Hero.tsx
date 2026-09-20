"use client";

import React from 'react';
import { Shield, Lock, EyeOff, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onExploreTenders: () => void;
  onCreateTender: () => void;
  onOpenVerifier: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreTenders,
  onCreateTender,
  onOpenVerifier
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0F1D38]/80 to-[#070B14]/90 border border-[#1E2E4E] p-8 md:p-12 shadow-2xl backdrop-blur-xl">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#00E5FF]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-[#0099FF]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs font-semibold text-[#00E5FF] mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Midnight Blockchain • Zero-Knowledge Compact Circuits</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Confidential Procurement & <span className="gradient-text">Sealed-Bid Auctions</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed mb-8">
          Enterprise tenders with cryptographic bid secrecy. Bid amounts and vendor identities remain encrypted off-chain using Zero-Knowledge proofs, with winner determination verified on-chain without exposing losing bids.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            id="hero-explore-btn"
            onClick={onExploreTenders}
            className="btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2 shadow-lg shadow-[#00E5FF]/20 cursor-pointer"
          >
            <span>Explore Tenders</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            id="hero-verifier-btn"
            onClick={onOpenVerifier}
            className="btn-secondary px-6 py-3 text-sm font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Shield className="w-4 h-4 text-[#00E5FF]" />
            <span>Public Verifier</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-[#1E2E4E]/80">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <Lock className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
            <span>Pedersen-style Commitments</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <EyeOff className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Zero Front-Running Exposure</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-[#0099FF] flex-shrink-0" />
            <span>Verifiable On-Chain Settlement</span>
          </div>
        </div>
      </div>
    </div>
  );
};
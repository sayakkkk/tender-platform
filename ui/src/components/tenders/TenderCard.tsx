"use client";

import React from 'react';
import { Tender } from '../../lib/types';
import { formatCurrency, truncateAddress } from '../../lib/crypto';
import { Calendar, DollarSign, Users, Award, Shield, Lock } from 'lucide-react';

interface TenderCardProps {
  tender: Tender;
  onSelectBid: (tender: Tender) => void;
  onSelectVerify: (tender: Tender) => void;
  onSelectReveal?: (tender: Tender) => void;
  isAuthority?: boolean;
}

export const TenderCard: React.FC<TenderCardProps> = ({
  tender,
  onSelectBid,
  onSelectVerify,
  onSelectReveal,
  isAuthority = false
}) => {
  const isDeadlinePassed = new Date(tender.deadline).getTime() <= Date.now();
  
  return (
    <div className="glass-panel-interactive p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-2.5 py-1 rounded-md border border-[#00E5FF]/20">
              #{tender.id}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1E2E4E] text-slate-300">
              {tender.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-provenance">{tender.provenance}</span>
            {tender.status === 'OPEN' && (
              <span className="badge-open text-xs font-semibold px-2.5 py-0.5 rounded-full">
                OPEN
              </span>
            )}
            {tender.status === 'CLOSED' && (
              <span className="badge-closed text-xs font-semibold px-2.5 py-0.5 rounded-full">
                CLOSED
              </span>
            )}
            {tender.status === 'REVEALED' && (
              <span className="badge-revealed text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Award className="w-3 h-3" /> REVEALED
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-snug">
          {tender.title}
        </h3>
        <p className="text-sm text-slate-400 mb-5 line-clamp-3 leading-relaxed">
          {tender.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6 p-3 rounded-lg bg-[#0D1527] border border-[#1E2E4E]">
          <div>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Budget Ceiling
            </span>
            <span className="text-sm font-bold text-slate-200 mt-0.5 block">
              {formatCurrency(tender.budgetCap)}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#00E5FF]" /> Sealed Bids
            </span>
            <span className="text-sm font-bold text-slate-200 mt-0.5 block">
              {tender.bidCommitmentsCount} Committed
            </span>
          </div>

          <div className="col-span-2 pt-2 border-t border-[#1E2E4E]/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Deadline
            </span>
            <span className={"font-mono font-medium " + (isDeadlinePassed ? "text-amber-400" : "text-slate-300")}>
              {new Date(tender.deadline).toLocaleDateString()} {new Date(tender.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {tender.status === 'REVEALED' && tender.winnerAddress && (
          <div className="p-3 mb-5 rounded-lg bg-purple-950/30 border border-purple-800/40 text-xs">
            <div className="flex items-center justify-between text-purple-300 font-semibold mb-1">
              <span>Winning Vendor:</span>
              <span className="font-mono text-purple-200">{truncateAddress(tender.winnerAddress)}</span>
            </div>
            <div className="flex items-center justify-between text-purple-300 font-semibold">
              <span>Winning Amount:</span>
              <span className="font-mono text-emerald-400">{formatCurrency(tender.winningBidAmount || 0)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-[#1E2E4E]">
        {tender.status === 'OPEN' && (
          <button
            onClick={() => onSelectBid(tender)}
            className="btn-primary w-full text-xs py-2.5"
          >
            <Lock className="w-3.5 h-3.5" /> Submit Sealed Bid
          </button>
        )}

        {tender.status === 'CLOSED' && isAuthority && onSelectReveal && (
          <button
            onClick={() => onSelectReveal(tender)}
            className="btn-primary w-full text-xs py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600"
          >
            <Award className="w-3.5 h-3.5" /> Reveal Winner
          </button>
        )}

        <button
          onClick={() => onSelectVerify(tender)}
          className={"btn-secondary text-xs py-2.5 " + (tender.status !== 'OPEN' && (!isAuthority || tender.status === 'REVEALED') ? "w-full" : "")}
        >
          <Shield className="w-3.5 h-3.5 text-[#00E5FF]" /> Verify Outcome
        </button>
      </div>
    </div>
  );
};

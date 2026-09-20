"use client";

import React, { useState } from 'react';
import { Tender } from '../../lib/types';
import { ProcurementContractService } from '../../services/contract-service';
import { formatCurrency } from '../../lib/crypto';
import { X, Award, ShieldAlert } from 'lucide-react';

interface WinnerRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  tender: Tender;
  onRevealed: (tender: Tender) => void;
}

export const WinnerRevealModal: React.FC<WinnerRevealModalProps> = ({
  isOpen,
  onClose,
  tender,
  onRevealed
}) => {
  const [winnerAddress, setWinnerAddress] = useState('0200112233445566778899aabbccddeeff00112233445566778899aabbccddee');
  const [winningAmount, setWinningAmount] = useState(Math.floor(tender.budgetCap * 0.8));
  const [nonce, setNonce] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!winnerAddress.trim()) {
      setError("Please specify the winning vendor public address.");
      return;
    }
    if (winningAmount <= 0 || winningAmount > tender.budgetCap) {
      setError(`Winning amount must be within budget ceiling (${formatCurrency(tender.budgetCap)}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const contractService = ProcurementContractService.getInstance();
      const res = await contractService.revealWinner(
        tender.id,
        winnerAddress.trim(),
        winningAmount,
        nonce || "0000000000000000000000000000000000000000000000000000000000000000"
      );
      onRevealed(res.tender);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to reveal winner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto border border-purple-500/40 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2E4E]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Authority Winner Reveal</h2>
            <p className="text-xs text-slate-400">Tender #{tender.id} • Compact Circuit: revealWinner</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Winning Vendor Address
            </label>
            <input
              type="text"
              required
              value={winnerAddress}
              onChange={(e) => setWinnerAddress(e.target.value)}
              className="w-full bg-[#0D1527] border border-[#1E2E4E] rounded-lg px-3.5 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Winning Bid Amount (USD)
            </label>
            <input
              type="number"
              required
              value={winningAmount}
              onChange={(e) => setWinningAmount(Number(e.target.value))}
              className="w-full bg-[#0D1527] border border-[#1E2E4E] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Winning Blinding Nonce (256-bit Hex)
            </label>
            <input
              type="text"
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
              placeholder="Leave empty or provide vendor verified nonce"
              className="w-full bg-[#0D1527] border border-[#1E2E4E] rounded-lg px-3.5 py-2.5 font-mono text-xs text-amber-300 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#0D1527] border border-[#1E2E4E] text-xs text-slate-400">
            <p>
              The Compact circuit will verify that <code>SHA-256(amount || nonce || vendor || tenderId)</code> matches the committed hash on the Midnight ledger. Losing bids remain cryptographically sealed.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2E4E]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs px-4 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600"
            >
              {isSubmitting ? "Revealing Winner..." : "Execute Winner Reveal Circuit"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

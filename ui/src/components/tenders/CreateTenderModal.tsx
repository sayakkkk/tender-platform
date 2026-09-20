"use client";

import React, { useState } from 'react';
import { Tender } from '../../lib/types';
import { ProcurementContractService } from '../../services/contract-service';
import { formatCurrency, truncateAddress } from '../../lib/crypto';
import { X, PlusCircle, ShieldAlert, DollarSign, Calendar, Layers } from 'lucide-react';

interface CreateTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (tender: Tender) => void;
  authorityAddress: string;
}

export const CreateTenderModal: React.FC<CreateTenderModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  authorityAddress
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Tender['category']>('INFRASTRUCTURE');
  const [budgetCap, setBudgetCap] = useState(500000);
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [eligibilityTier, setEligibilityTier] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError("Please fill in both title and description.");
      return;
    }

    if (budgetCap <= 0) {
      setError("Budget ceiling must be greater than $0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const contractService = ProcurementContractService.getInstance();
      const res = await contractService.createTenderOnChain(
        title.trim(),
        description.trim(),
        category,
        budgetCap,
        deadlineDays,
        eligibilityTier,
        authorityAddress || "02008899aabbccddeeff00112233445566778899aabbccddeeff00112233445566"
      );
      onCreated(res.tender);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create tender.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto border border-[#00E5FF]/30 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2E4E]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create New Procurement Tender</h2>
            <p className="text-xs text-slate-400">Midnight Compact Circuit: createTender</p>
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
              Tender Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Enterprise Quantum-Safe Cryptographic HSM Nodes"
              className="w-full bg-[#0D1527] border border-[#1E2E4E] rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#0D1527] border border-[#1E2E4E] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00E5FF]"
              >
                <option value="INFRASTRUCTURE">INFRASTRUCTURE</option>
                <option value="DEFENSE">DEFENSE</option>
                <option value="HEALTHCARE">HEALTHCARE</option>
                <option value="FINTECH">FINTECH</option>
                <option value="ENERGY">ENERGY</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Budget Cap (USD)
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={budgetCap}
                onChange={(e) => setBudgetCap(Number(e.target.value))}
                className="w-full bg-[#0D1527] border border-[#1E2E4E] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Deadline Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                className="w-full bg-[#0D1527] border border-[#1E2E4E] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> Min Eligibility Tier (1 - 5)
              </label>
              <select
                value={eligibilityTier}
                onChange={(e) => setEligibilityTier(Number(e.target.value))}
                className="w-full bg-[#0D1527] border border-[#1E2E4E] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00E5FF]"
              >
                <option value={1}>Tier 1 (Basic Registered Vendor)</option>
                <option value={2}>Tier 2 (Verified Financial Standing)</option>
                <option value={3}>Tier 3 (Enterprise ISO 27001 / SOC2)</option>
                <option value={4}>Tier 4 (High Security / Gov Clearances)</option>
                <option value={5}>Tier 5 (Top Secret / Military Grade)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tender Specifications & Scope of Work
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail technical requirements, delivery timelines, SLA constraints, and verification criteria..."
              className="w-full bg-[#0D1527] border border-[#1E2E4E] rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div className="p-3.5 rounded-lg bg-[#0D1527] border border-[#1E2E4E] text-xs text-slate-400 flex items-center justify-between">
            <span>Authority Public Key:</span>
            <span className="font-mono text-slate-300">
              {truncateAddress(authorityAddress)}
            </span>
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
              className="btn-primary text-xs px-6 py-2.5"
            >
              {isSubmitting ? "Broadcasting Circuit..." : "Create & Deploy Tender"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

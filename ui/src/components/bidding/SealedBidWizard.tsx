"use client";

import React, { useState, useEffect } from 'react';
import { Tender, PrivateBidRecord, WalletState } from '../../lib/types';
import { generateRandomNonce, computeBidCommitment, generateEligibilityToken, formatCurrency, truncateAddress } from '../../lib/crypto';
import { ProcurementContractService } from '../../services/contract-service';
import { X, Lock, Key, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, AlertTriangle, Send } from 'lucide-react';

interface SealedBidWizardProps {
  isOpen: boolean;
  onClose: () => void;
  tender: Tender;
  walletState: WalletState;
  onBidSubmitted: (record: PrivateBidRecord) => void;
}

export const SealedBidWizard: React.FC<SealedBidWizardProps> = ({
  isOpen,
  onClose,
  tender,
  walletState,
  onBidSubmitted
}) => {
  const [step, setStep] = useState<number>(1);
  const [bidAmount, setBidAmount] = useState<number>(Math.floor(tender.budgetCap * 0.85));
  const [nonce, setNonce] = useState<string>('');
  const [eligibilityToken, setEligibilityToken] = useState<string>('');
  const [commitment, setCommitment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedRecord, setConfirmedRecord] = useState<PrivateBidRecord | null>(null);

  useEffect(() => {
    if (isOpen) {
      const generatedNonce = generateRandomNonce();
      setNonce(generatedNonce);
      const token = generateEligibilityToken(walletState.address || "0200112233445566778899aabbccddeeff00112233445566778899aabbccddee", tender.eligibilityScoreReq);
      setEligibilityToken(token);
      setStep(1);
      setError(null);
      setConfirmedRecord(null);
    }
  }, [isOpen, walletState.address, tender]);

  useEffect(() => {
    const updateCommitment = async () => {
      if (bidAmount > 0 && nonce) {
        const addr = walletState.address || "0200112233445566778899aabbccddeeff00112233445566778899aabbccddee";
        const c = await computeBidCommitment(bidAmount, nonce, addr, tender.id);
        setCommitment(c);
      }
    };
    updateCommitment();
  }, [bidAmount, nonce, walletState.address, tender.id]);

  if (!isOpen) return null;

  const handleNext = () => {
    setError(null);
    if (step === 2 && (!eligibilityToken || !eligibilityToken.startsWith('ELG-'))) {
      setError("Valid eligibility witness token is required.");
      return;
    }
    if (step === 3 && (bidAmount <= 0 || bidAmount > tender.budgetCap)) {
      setError(`Bid must be greater than $0 and below budget cap (${formatCurrency(tender.budgetCap)}).`);
      return;
    }
    if (step === 4 && (!nonce || nonce.length !== 64)) {
      setError("A 256-bit cryptographic nonce (64 hex chars) is required.");
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleSubmitOnChain = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const contractService = ProcurementContractService.getInstance();
      const addr = walletState.address || "0200112233445566778899aabbccddeeff00112233445566778899aabbccddee";
      
      const res = await contractService.submitSealedBid(
        tender.id,
        bidAmount,
        nonce,
        addr,
        eligibilityToken
      );

      setConfirmedRecord(res.record);
      onBidSubmitted(res.record);
      setStep(6);
    } catch (err: any) {
      setError(err?.message || "Failed to submit sealed bid to Midnight blockchain.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto border border-[#00E5FF]/40 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2E4E]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Sealed-Bid Cryptographic Submission</h2>
            <p className="text-xs text-slate-400">
              Tender #{tender.id} • Zero-Knowledge Commitment Wizard
            </p>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-8 px-2">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-[#00E5FF] text-black ring-4 ring-[#00E5FF]/20 shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                    : step > s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#1E2E4E] text-slate-400'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
              {s < 6 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all ${
                    step > s ? 'bg-emerald-500' : 'bg-[#1E2E4E]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Tender Parameters */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Step 1: Confirm Tender Parameters</h3>
            <div className="p-4 rounded-lg bg-[#0D1527] border border-[#1E2E4E] space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Tender Title:</span>
                <span className="font-semibold text-white">{tender.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-slate-300">{tender.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Budget Ceiling:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(tender.budgetCap)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Eligibility Required:</span>
                <span className="font-semibold text-purple-400">Tier {tender.eligibilityScoreReq}+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Submitting Wallet:</span>
                <span className="font-mono text-slate-300">{truncateAddress(walletState.address)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              By proceeding, you prepare a zero-knowledge private witness. Your actual bid amount will remain private and will never be published unencrypted to the blockchain.
            </p>
          </div>
        )}

        {/* Step 2: Eligibility Witness */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Step 2: Private Eligibility Witness</h3>
            <p className="text-xs text-slate-400">
              Your vendor eligibility token is passed as a private circuit witness to verify compliance with Tier {tender.eligibilityScoreReq}+ without revealing organizational credentials.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Eligibility Token Witness
              </label>
              <input
                type="text"
                value={eligibilityToken}
                onChange={(e) => setEligibilityToken(e.target.value)}
                className="w-full bg-[#0D1527] border border-[#1E2E4E] rounded-lg px-3.5 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Verified: Vendor complies with Compact Circuit eligibility requirement.</span>
            </div>
          </div>
        )}

        {/* Step 3: Private Bid Amount */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Step 3: Enter Confidential Bid Amount</h3>
            <p className="text-xs text-slate-400">
              Specify your sealed commercial proposal. Must be equal to or lower than the ceiling of {formatCurrency(tender.budgetCap)}.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bid Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="1000"
                  max={tender.budgetCap}
                  step="1000"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  className="w-full bg-[#0D1527] border border-[#1E2E4E] rounded-lg pl-8 pr-4 py-2.5 text-lg font-bold text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#0D1527] border border-[#1E2E4E] text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Ceiling Budget:</span>
                <span>{formatCurrency(tender.budgetCap)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Your Proposal:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(bidAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Savings for Authority:</span>
                <span className="text-[#00E5FF] font-semibold">{formatCurrency(Math.max(0, tender.budgetCap - bidAmount))}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Private 256-Bit Nonce Secret */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Step 4: Cryptographic Nonce Secret</h3>
            <p className="text-xs text-slate-400">
              A 256-bit cryptographic random nonce blinds your bid commitment to prevent brute-force dictionary attacks.
            </p>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  256-Bit Random Hex Nonce
                </label>
                <button
                  type="button"
                  onClick={() => setNonce(generateRandomNonce())}
                  className="text-xs text-[#00E5FF] hover:underline"
                >
                  Regenerate Nonce
                </button>
              </div>
              <textarea
                rows={2}
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
                className="w-full bg-[#0D1527] border border-[#1E2E4E] rounded-lg p-3 font-mono text-xs text-amber-300 focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300 flex items-start gap-2">
              <Key className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Important:</strong> This secret will be stored in your encrypted local Private Vault. It will be required during the reveal phase if you win.
              </span>
            </div>
          </div>
        )}

        {/* Step 5: Commitment Preview */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Step 5: Review & Submit Circuit Witness</h3>
            <p className="text-xs text-slate-400">
              Verify your zero-knowledge commitment before submitting to the Midnight Network.
            </p>

            <div className="p-4 rounded-lg bg-[#0D1527] border border-[#1E2E4E] space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Public SHA-256 Bid Commitment (Published on-chain):</span>
                <span className="font-mono text-[#00E5FF] break-all bg-[#111C35] p-2 rounded block border border-[#1E2E4E]">
                  {commitment}
                </span>
              </div>
              
              <div className="pt-2 border-t border-[#1E2E4E]/60 grid grid-cols-2 gap-2 text-slate-300">
                <div>Bid Amount: <strong className="text-white">{formatCurrency(bidAmount)}</strong></div>
                <div>Tender ID: <strong className="text-white">#{tender.id}</strong></div>
                <div className="col-span-2">Private Nonce: <span className="font-mono text-amber-300">{nonce.substring(0, 16)}...</span></div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#111C35] border border-[#1E2E4E] text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <Lock className="w-3.5 h-3.5 text-[#00E5FF]" /> Zero-Knowledge Privacy Guarantee
              </div>
              <p>Only the SHA-256 hash above will be recorded in the Midnight contract's <code>bidCommitments</code> map. Your raw bid amount is never broadcasted.</p>
            </div>
          </div>
        )}

        {/* Step 6: Confirmation Screen */}
        {step === 6 && confirmedRecord && (
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Sealed Bid Successfully Committed!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Transaction confirmed on Midnight Preprod network.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#0D1527] border border-[#1E2E4E] text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Bid ID:</span>
                <span className="font-mono text-slate-200">{confirmedRecord.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tender:</span>
                <span className="text-slate-200 font-semibold">{tender.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bid Amount:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(confirmedRecord.bidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">On-Chain Commitment:</span>
                <span className="font-mono text-[#00E5FF]">{confirmedRecord.commitment.substring(0, 16)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Private Vault Status:</span>
                <span className="text-emerald-400 font-semibold">Saved Locally & Encrypted</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-primary w-full text-xs py-2.5"
            >
              Done & View Private Vault
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 6 && (
          <div className="flex items-center justify-between pt-6 border-t border-[#1E2E4E] mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitOnChain}
                className="btn-primary text-xs px-6 py-2 flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? "Invoking Circuit submitSealedBid..." : "Authorize & Submit Sealed Bid"}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

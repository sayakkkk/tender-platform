"use client";

import React, { useState, useEffect } from 'react';
import { Tender, PrivateBidRecord, WalletState } from '../lib/types';
import { ProcurementContractService } from '../services/contract-service';
import { MidnightWalletConnector } from '../services/midnight-connector';
import { Header } from '../components/layout/Header';
import { Hero } from '../components/layout/Hero';
import { Footer } from '../components/layout/Footer';
import { TenderCard } from '../components/tenders/TenderCard';
import { CreateTenderModal } from '../components/tenders/CreateTenderModal';
import { SealedBidWizard } from '../components/bidding/SealedBidWizard';
import { WinnerRevealModal } from '../components/tenders/WinnerRevealModal';
import { PrivateVault } from '../components/bidding/PrivateVault';
import { OutcomeCertificate } from '../components/verification/OutcomeCertificate';
import { NetworkTelemetry } from '../components/status/NetworkTelemetry';
import { Wallet, AlertCircle, AlertTriangle, ExternalLink, X, Loader2, Plus, ShieldCheck, RefreshCw } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'authority' | 'vendor' | 'verifier' | 'telemetry'>('explorer');
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [walletState, setWalletState] = useState<WalletState>(MidnightWalletConnector.getWalletState());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBidWizardOpen, setIsBidWizardOpen] = useState(false);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [activeTenderForBid, setActiveTenderForBid] = useState<Tender | null>(null);
  const [activeTenderForReveal, setActiveTenderForReveal] = useState<Tender | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  useEffect(() => {
    // Initial load of tenders
    const loadedTenders = ProcurementContractService.getAllTenders();
    setTenders(loadedTenders);

    // Initial wallet state check
    const state = MidnightWalletConnector.getWalletState();
    setWalletState(state);

    // Subscribe to wallet state changes
    const unsubscribe = MidnightWalletConnector.subscribe((updatedState) => {
      setWalletState(updatedState);
      if (updatedState.error && !updatedState.isConnected) {
        setIsWalletModalOpen(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleConnectWallet = async () => {
    try {
      const state = await MidnightWalletConnector.connect();
      setWalletState(state);
      if (state.isConnected && !state.isWrongNetwork) {
        setIsWalletModalOpen(false);
      } else {
        setIsWalletModalOpen(true);
      }
    } catch (err: any) {
      console.error('[App] Wallet connection error:', err);
      setIsWalletModalOpen(true);
    }
  };

  const handleDisconnectWallet = async () => {
    await MidnightWalletConnector.disconnect();
    const state = MidnightWalletConnector.getWalletState();
    setWalletState(state);
  };

  const handleOpenBidWizard = (tender: Tender) => {
    setActiveTenderForBid(tender);
    setIsBidWizardOpen(true);
  };

  const handleOpenRevealModal = (tender: Tender) => {
    setActiveTenderForReveal(tender);
    setIsRevealModalOpen(true);
  };

  const handleVerifyOutcome = (tender: Tender) => {
    setActiveTab('verifier');
  };

  const handleTenderCreated = (tender: Tender) => {
    const updated = ProcurementContractService.getAllTenders();
    setTenders(updated);
  };

  const handleBidSubmitted = (bid: PrivateBidRecord) => {
    const updated = ProcurementContractService.getAllTenders();
    setTenders(updated);
  };

  const handleWinnerRevealed = () => {
    const updated = ProcurementContractService.getAllTenders();
    setTenders(updated);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-[#00E5FF]/20 selection:text-[#00E5FF]">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletState={walletState}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Network & Wallet Warning Alert Bar */}
        {walletState.error && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-amber-100 mr-2">
                  {walletState.isWrongNetwork ? 'Network Mismatch:' : 'Midnight Wallet Notice:'}
                </span>
                <span>{walletState.error}</span>
                {walletState.detectedNetwork && (
                  <span className="ml-2 font-mono text-[11px] text-slate-400">
                    (Detected: {walletState.detectedNetwork})
                  </span>
                )}
              </div>
            </div>
            <button
              id="resolve-network-banner-btn"
              onClick={() => setIsWalletModalOpen(true)}
              className="px-3 py-1.5 bg-amber-900/60 hover:bg-amber-800/80 rounded border border-amber-700 font-medium text-amber-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Resolve</span>
            </button>
          </div>
        )}

        <main>
          {/* TAB 1: MARKETPLACE */}
          {activeTab === 'explorer' && (
            <div className="space-y-12">
              <Hero
                onExploreTenders={() => {
                  const el = document.getElementById('tender-market-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onCreateTender={() => setIsCreateModalOpen(true)}
                onOpenVerifier={() => setActiveTab('verifier')}
              />

              <div id="tender-market-grid" className="pt-6 border-t border-[#1E2E4E]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>Confidential Tender Marketplace</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-mono">
                        {tenders.length} Active
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Zero-Knowledge sealed-bid tenders running on Midnight Preprod smart contract circuits.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      id="hero-create-btn"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="btn-primary text-xs px-4 py-2 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Post New Tender</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tenders.map((tender) => (
                    <TenderCard
                      key={tender.id}
                      tender={tender}
                      onSelectBid={handleOpenBidWizard}
                      onSelectVerify={handleVerifyOutcome}
                      onSelectReveal={handleOpenRevealModal}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUTHORITY CONSOLE */}
          {activeTab === 'authority' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-7 h-7 text-[#00E5FF]" />
                    <span>Procurement Authority Portal</span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage RFP lifecycles, initiate evaluation circuits, and publish ZK winner settlement proofs.
                  </p>
                </div>
                <button
                  id="authority-create-tender-btn"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-primary text-xs px-4 py-2 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Tender RFP</span>
                </button>
              </div>

              {/* Authority Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-5 border border-[#1E2E4E]">
                  <span className="text-xs text-slate-400 block mb-1">Total Managed Tenders</span>
                  <span className="text-2xl font-bold text-white">{tenders.length}</span>
                </div>
                <div className="glass-panel p-5 border border-[#1E2E4E]">
                  <span className="text-xs text-slate-400 block mb-1">Active Open Biddings</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    {tenders.filter(t => t.status === 'OPEN').length}
                  </span>
                </div>
                <div className="glass-panel p-5 border border-[#1E2E4E]">
                  <span className="text-xs text-slate-400 block mb-1">Total Committed Sealed Bids</span>
                  <span className="text-2xl font-bold text-[#00E5FF]">
                    {tenders.reduce((acc, t) => acc + t.bidCommitmentsCount, 0)}
                  </span>
                </div>
              </div>

              {/* Authority Tender Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenders.map((tender) => (
                  <TenderCard
                    key={tender.id}
                    tender={tender}
                    onSelectBid={handleOpenBidWizard}
                    onSelectVerify={handleVerifyOutcome}
                    onSelectReveal={handleOpenRevealModal}
                    isAuthority={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VENDOR PORTAL */}
          {activeTab === 'vendor' && (
            <div className="space-y-10">
              <div>
                <h1 className="text-2xl font-bold text-white">Vendor Portal & Sealed-Bid Submissions</h1>
                <p className="text-xs text-slate-400">Submit confidential tenders, manage cryptographic nonces, and access your local private vault.</p>
              </div>

              <PrivateVault />

              <div className="pt-6 border-t border-[#1E2E4E]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">Available Tenders for Sealed Bidding</h2>
                    <p className="text-xs text-slate-400">Select an open tender to initiate the 8-step cryptographic commitment wizard.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tenders.filter(t => t.status === 'OPEN').map((tender) => (
                    <TenderCard
                      key={tender.id}
                      tender={tender}
                      onSelectBid={handleOpenBidWizard}
                      onSelectVerify={handleVerifyOutcome}
                      onSelectReveal={handleOpenRevealModal}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PUBLIC VERIFIER */}
          {activeTab === 'verifier' && (
            <OutcomeCertificate tenders={tenders} />
          )}

          {/* TAB 5: TELEMETRY & DIAGNOSTICS */}
          {activeTab === 'telemetry' && (
            <NetworkTelemetry />
          )}

        </main>
      </div>

      <Footer />

      {/* Midnight Wallet Status / Network Resolution Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 relative border border-[#00E5FF]/40 shadow-2xl">
            <button
              id="modal-close-icon-btn"
              onClick={() => setIsWalletModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2E4E] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Midnight Lace Wallet</h3>
                <p className="text-xs text-slate-400">Midnight DApp Connection & Preprod Authorization</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300 mb-6">
              
              {/* Scenario 1: Wrong Network / Non-Midnight Account */}
              {walletState.isWrongNetwork ? (
                <div className="p-5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 space-y-3.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span>Wrong Network / Account</span>
                  </div>

                  <div className="space-y-2 bg-[#0A0F1D]/80 p-3.5 rounded-lg border border-amber-900/40 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Expected:</span>
                      <span className="font-semibold text-emerald-400">Midnight Preprod</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Detected:</span>
                      <span className="font-semibold text-amber-300">
                        {walletState.detectedNetwork || 'Non-Midnight Account'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed pt-1">
                    <p>
                      <strong>Action:</strong> In the Midnight Lace authorization popup (or Lace header), select your <strong>Midnight Preprod</strong> account from the <em>Source Account</em> dropdown, then click <strong>Retry Connection</strong> below.
                    </p>
                  </div>
                </div>
              ) : walletState.error ? (
                /* Scenario 2: General Midnight Wallet Notice */
                <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <strong className="block font-semibold mb-1">Midnight Wallet Notice:</strong>
                    <span>{walletState.error}</span>
                  </div>
                </div>
              ) : null}

              {/* Scenario 3: Lace Extension Not Detected */}
              {!walletState.isLaceInstalled ? (
                <div className="p-4 rounded-lg bg-[#0D1527] border border-[#1E2E4E] space-y-2">
                  <span className="font-semibold text-white block">Required: Midnight Lace Extension</span>
                  <p className="text-slate-400 leading-relaxed">
                    The Midnight Lace Wallet extension is required to sign Zero-Knowledge proofs and submit transactions to Midnight Preprod.
                  </p>
                  <a
                    href="https://midnight.network"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#00E5FF] font-semibold hover:underline pt-1">
                    <span>Download Midnight Lace Wallet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : !walletState.isWrongNetwork && !walletState.error ? (
                <p className="text-slate-400 leading-relaxed">
                  Please click <strong>Authorize</strong> inside the Midnight Lace popup window to link your Midnight Preprod account.
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2E4E]">
              <button
                id="modal-close-btn"
                type="button"
                onClick={() => setIsWalletModalOpen(false)}
                className="btn-secondary text-xs px-4 py-2 cursor-pointer"
              >
                Close
              </button>
              <button
                id="modal-retry-connect-btn"
                type="button"
                onClick={handleConnectWallet}
                disabled={walletState.isConnecting}
                className="btn-primary text-xs px-5 py-2 cursor-pointer flex items-center gap-2"
              >
                {walletState.isConnecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting Midnight...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Connection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateTenderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleTenderCreated}
        authorityAddress={walletState.address || "02008899aabbccddeeff00112233445566778899aabbccddeeff00112233445566"}
      />

      {activeTenderForBid && (
        <SealedBidWizard
          isOpen={isBidWizardOpen}
          onClose={() => setIsBidWizardOpen(false)}
          tender={activeTenderForBid}
          walletState={walletState}
          onBidSubmitted={handleBidSubmitted}
        />
      )}

      {activeTenderForReveal && (
        <WinnerRevealModal
          isOpen={isRevealModalOpen}
          onClose={() => setIsRevealModalOpen(false)}
          tender={activeTenderForReveal}
          onRevealed={handleWinnerRevealed}
        />
      )}
    </div>
  );
}
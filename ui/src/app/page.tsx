"use client";

import React, { useState, useEffect } from 'react';
import { Tender, PrivateBidRecord, WalletState } from '../lib/types';
import { ProcurementContractService } from '../services/contract-service';
import { MidnightWalletConnector } from '../services/midnight-connector';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { TenderCard } from '../components/tenders/TenderCard';
import { CreateTenderModal } from '../components/tenders/CreateTenderModal';
import { WinnerRevealModal } from '../components/tenders/WinnerRevealModal';
import { SealedBidWizard } from '../components/bidding/SealedBidWizard';
import { PrivateVault } from '../components/bidding/PrivateVault';
import { OutcomeCertificate } from '../components/verification/OutcomeCertificate';
import { NetworkTelemetry } from '../components/status/NetworkTelemetry';
import { Shield, Lock, Plus, Award, FileCheck } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'authority' | 'vendor' | 'verifier' | 'telemetry'>('explorer');
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isLaceInstalled: false,
    address: null,
    networkId: null,
    isConnecting: false
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBidWizardOpen, setIsBidWizardOpen] = useState(false);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [activeTenderForBid, setActiveTenderForBid] = useState<Tender | null>(null);
  const [activeTenderForReveal, setActiveTenderForReveal] = useState<Tender | null>(null);

  useEffect(() => {
    const contractService = ProcurementContractService.getInstance();
    setTenders(contractService.getTenders());

    const walletConnector = MidnightWalletConnector.getInstance();
    setWalletState(prev => ({ ...prev, isLaceInstalled: walletConnector.isLaceAvailable() }));
  }, []);

  const handleConnectWallet = async () => {
    const walletConnector = MidnightWalletConnector.getInstance();
    setWalletState(prev => ({ ...prev, isConnecting: true }));
    const state = await walletConnector.connect();
    setWalletState(state);
  };

  const handleDisconnectWallet = () => {
    const walletConnector = MidnightWalletConnector.getInstance();
    const state = walletConnector.disconnect();
    setWalletState(state);
  };

  const handleTenderCreated = (newTender: Tender) => {
    setTenders(prev => [newTender, ...prev]);
  };

  const handleBidSubmitted = (_record: PrivateBidRecord) => {
    const contractService = ProcurementContractService.getInstance();
    setTenders(contractService.getTenders());
  };

  const handleWinnerRevealed = (updatedTender: Tender) => {
    setTenders(prev => prev.map(t => t.id === updatedTender.id ? updatedTender : t));
  };

  const handleOpenBidWizard = (tender: Tender) => {
    setActiveTenderForBid(tender);
    setIsBidWizardOpen(true);
  };

  const handleOpenRevealModal = (tender: Tender) => {
    setActiveTenderForReveal(tender);
    setIsRevealModalOpen(true);
  };

  const handleVerifyOutcome = (_tender: Tender) => {
    setActiveTab('verifier');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          walletState={walletState}
          onConnectWallet={handleConnectWallet}
          onDisconnectWallet={handleDisconnectWallet}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          
          {/* TAB 1: EXPLORER / LANDING */}
          {activeTab === 'explorer' && (
            <div className="space-y-12">
              
              {/* Hero Banner */}
              <div className="glass-panel p-8 sm:p-12 relative overflow-hidden border border-[#00E5FF]/30">
                <div className="max-w-3xl relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 text-xs font-semibold mb-4">
                    <Shield className="w-3.5 h-3.5" />
                    Zero-Knowledge Sealed-Bid Protocol on Midnight
                  </div>
                  
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                    Enterprise Procurement with <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-blue-500">
                      Cryptographic Privacy
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
                    Prevent front-running, bid leakage, and vendor price discrimination. Bid proposals remain cryptographically sealed until authorized closure and selective reveal.
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => setActiveTab('vendor')}
                      className="btn-primary"
                    >
                      <Lock className="w-4 h-4" /> Enter Vendor Portal
                    </button>
                    <button
                      onClick={() => setActiveTab('authority')}
                      className="btn-secondary"
                    >
                      <Plus className="w-4 h-4" /> Authority Workspace
                    </button>
                    <button
                      onClick={() => setActiveTab('verifier')}
                      className="btn-secondary text-slate-300"
                    >
                      <FileCheck className="w-4 h-4 text-[#00E5FF]" /> Public Outcome Verifier
                    </button>
                  </div>
                </div>

                <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
              </div>

              {/* Protocol Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 border border-[#1E2E4E]">
                  <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] mb-4">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Zero-Knowledge Sealed Bids</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Commercial terms are shielded with 256-bit entropy. Only mathematical SHA-256 commitments reach the public Midnight ledger.
                  </p>
                </div>

                <div className="glass-panel p-6 border border-[#1E2E4E]">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Private Eligibility Witnesses</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Vendors prove compliance with ISO / SOC2 / Tier clearances via private Compact circuit inputs without leaking internal business credentials.
                  </p>
                </div>

                <div className="glass-panel p-6 border border-[#1E2E4E]">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Selective Winner Reveal</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upon deadline closure, only the winning proposal is cryptographically bound and revealed. Losing bids remain forever private.
                  </p>
                </div>
              </div>

              {/* Active Tender Marketplace */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Active Tender Marketplace</h2>
                    <p className="text-xs text-slate-400">Inspect open tenders, submission deadlines, and committed bid volumes.</p>
                  </div>

                  <span className="badge-provenance">DATA PROVENANCE: BLOCKCHAIN</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tenders.map((tender) => (
                    <TenderCard
                      key={tender.id}
                      tender={tender}
                      onSelectBid={handleOpenBidWizard}
                      onSelectVerify={handleVerifyOutcome}
                      onSelectReveal={handleOpenRevealModal}
                      isAuthority={false}
                    />
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AUTHORITY WORKSPACE */}
          {activeTab === 'authority' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">Procurement Authority Management Workspace</h1>
                  <p className="text-xs text-slate-400">Deploy new tenders, manage deadline closures, and execute winner revelation circuits.</p>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-primary text-xs py-2.5 px-4"
                >
                  <Plus className="w-4 h-4" /> Create New Tender
                </button>
              </div>

              {/* Authority Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

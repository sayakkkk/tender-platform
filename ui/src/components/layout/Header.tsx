"use client";

import React, { useState } from 'react';
import { WalletState } from '../../lib/types';
import { truncateAddress } from '../../lib/crypto';
import { APP_CONFIG } from '../../lib/config';
import { Shield, Wallet, CheckCircle, LogOut, Loader2, Copy, Check, RefreshCw } from 'lucide-react';
import { MidnightWalletConnector } from '../../services/midnight-connector';

interface HeaderProps {
  activeTab: 'explorer' | 'authority' | 'vendor' | 'verifier' | 'telemetry';
  setActiveTab: (tab: 'explorer' | 'authority' | 'vendor' | 'verifier' | 'telemetry') => void;
  walletState: WalletState;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  walletState,
  onConnectWallet,
  onDisconnectWallet
}) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!walletState.address) return;
    try {
      await navigator.clipboard.writeText(walletState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address to clipboard:', err);
    }
  };

  const handleRefreshAddress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    try {
      await MidnightWalletConnector.refreshAddress();
    } finally {
      setIsRefreshing(false);
    }
  };

  const networkLabel = walletState.detectedNetwork || APP_CONFIG.NETWORK_NAME;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E2E4E] bg-[#070B14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('explorer')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#00E5FF]/20 to-[#0099FF]/10 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">MIDNIGHT</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                  LEVEL 3
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Confidential Procurement & Sealed-Bid Platform
              </p>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0D1527] p-1.5 rounded-xl border border-[#1E2E4E]">
            <button
              id="nav-marketplace-btn"
              onClick={() => setActiveTab('explorer')}
              className={"px-4 py-2 text-sm font-medium rounded-lg transition-all " + (activeTab === 'explorer' ? "bg-[#111C35] text-[#00E5FF] shadow-sm border border-[#1E2E4E]" : "text-slate-400 hover:text-slate-200")}
            >
              Marketplace
            </button>
            <button
              id="nav-authority-btn"
              onClick={() => setActiveTab('authority')}
              className={"px-4 py-2 text-sm font-medium rounded-lg transition-all " + (activeTab === 'authority' ? "bg-[#111C35] text-[#00E5FF] shadow-sm border border-[#1E2E4E]" : "text-slate-400 hover:text-slate-200")}
            >
              Authority
            </button>
            <button
              id="nav-vendor-btn"
              onClick={() => setActiveTab('vendor')}
              className={"px-4 py-2 text-sm font-medium rounded-lg transition-all " + (activeTab === 'vendor' ? "bg-[#111C35] text-[#00E5FF] shadow-sm border border-[#1E2E4E]" : "text-slate-400 hover:text-slate-200")}
            >
              Vendor Portal
            </button>
            <button
              id="nav-verifier-btn"
              onClick={() => setActiveTab('verifier')}
              className={"px-4 py-2 text-sm font-medium rounded-lg transition-all " + (activeTab === 'verifier' ? "bg-[#111C35] text-[#00E5FF] shadow-sm border border-[#1E2E4E]" : "text-slate-400 hover:text-slate-200")}
            >
              Public Verifier
            </button>
            <button
              id="nav-telemetry-btn"
              onClick={() => setActiveTab('telemetry')}
              className={"px-4 py-2 text-sm font-medium rounded-lg transition-all " + (activeTab === 'telemetry' ? "bg-[#111C35] text-[#00E5FF] shadow-sm border border-[#1E2E4E]" : "text-slate-400 hover:text-slate-200")}
            >
              Telemetry
            </button>
          </nav>

          {/* Right-Hand Controls: Network Badge + Wallet Status */}
          <div className="flex items-center gap-3">
            
            {/* SEPARATE NETWORK BADGE */}
            <div
              id="network-status-badge"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D1527] border border-[#1E2E4E] text-xs text-slate-300 shadow-inner"
              title={"Connected Network: " + networkLabel}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono font-semibold text-slate-300">{networkLabel}</span>
            </div>

            {/* CONNECTED WALLET CONTROL */}
            {walletState.isConnected ? (
              <div className="flex items-center gap-2 bg-[#111C35] border border-[#1E2E4E] rounded-lg p-1 shadow-sm">
                
                {walletState.address ? (
                  /* Case A: Real Address Successfully Retrieved */
                  <div
                    id="wallet-address-pill"
                    className="group relative flex items-center gap-2 px-3 py-1 text-xs font-mono text-emerald-400 bg-[#0A101D] border border-emerald-500/20 rounded-md cursor-pointer hover:border-emerald-500/40 transition-colors"
                    onClick={handleCopyAddress}
                    title={walletState.address}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    
                    {/* Shortened Real Address */}
                    <span className="tracking-tight font-medium text-emerald-300">
                      {truncateAddress(walletState.address)}
                    </span>

                    {/* Copy Button & Feedback */}
                    <button
                      id="copy-address-btn"
                      type="button"
                      onClick={handleCopyAddress}
                      title="Copy full Midnight address"
                      className="p-0.5 text-slate-400 hover:text-emerald-300 transition-colors rounded"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                      )}
                    </button>

                    {/* Hover Full Address Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                      <div className="bg-[#0A0F1D] text-slate-200 text-[11px] font-mono px-3 py-1.5 rounded-md border border-[#1E2E4E] shadow-xl max-w-xs break-all text-center">
                        {copied ? '✓ Full Address Copied!' : walletState.address}
                      </div>
                      <div className="w-2 h-2 bg-[#0A0F1D] border-r border-b border-[#1E2E4E] transform rotate-45 -mt-1"></div>
                    </div>
                  </div>
                ) : (
                  /* Case B: Connected but Address Query Pending / Locked */
                  <div className="flex items-center gap-2 px-2.5 py-1 text-xs font-mono text-amber-400 bg-amber-950/20 border border-amber-800/40 rounded-md">
                    {walletState.walletDataStatus === 'LOADING' || isRefreshing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span className="text-amber-300">Loading Address...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-amber-300">Address Unavailable</span>
                        <button
                          id="refresh-address-btn"
                          type="button"
                          onClick={handleRefreshAddress}
                          disabled={isRefreshing}
                          title="Fetch Midnight Address from Lace"
                          className="p-1 text-amber-400 hover:text-amber-200 transition-colors rounded hover:bg-amber-900/30"
                        >
                          <RefreshCw className={"w-3.5 h-3.5 " + (isRefreshing ? 'animate-spin' : '')} />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Disconnect Control */}
                <button
                  id="disconnect-lace-btn"
                  onClick={onDisconnectWallet}
                  title="Disconnect Lace Wallet"
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-[#162444] transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Disconnected State */
              <button
                id="connect-lace-btn"
                type="button"
                onClick={onConnectWallet}
                disabled={walletState.isConnecting}
                className="btn-primary text-xs px-4 py-2 cursor-pointer relative z-30 flex items-center gap-2"
              >
                {walletState.isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting Lace...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Connect Lace</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

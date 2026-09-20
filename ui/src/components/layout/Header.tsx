"use client";

import React from 'react';
import { WalletState } from '../../lib/types';
import { truncateAddress } from '../../lib/crypto';
import { APP_CONFIG } from '../../lib/config';
import { Shield, Wallet, CheckCircle, LogOut } from 'lucide-react';

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
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E2E4E] bg-[#070B14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
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

          <nav className="hidden md:flex items-center gap-1 bg-[#0D1527] p-1.5 rounded-xl border border-[#1E2E4E]">
            <button
              onClick={() => setActiveTab('explorer')}
              className={"px-4 py-2 text-sm font-medium rounded-lg transition-all " + (activeTab === 'explorer' ? "bg-[#111C35] text-[#00E5FF] shadow-sm border border-[#1E2E4E]" : "text-slate-400 hover:text-slate-200")}
            >
              Marketplace
            </button>
            <button
              onClick={() => setActiveTab('authority')}
              className={"px-4 py-2 text-sm font-medium rounded-lg transition-all " + (activeTab === 'authority' ? "bg-[#111C35] text-[#00E5FF] shadow-sm border border-[#1E2E4E]" : "text-slate-400 hover:text-slate-200")}
            >
              Authority
            </button>
            <button
              onClick={() => setActiveTab('vendor')}
              className={"px-4 py-2 text-sm font-medium rounded-lg transition-all " + (activeTab === 'vendor' ? "bg-[#111C35] text-[#00E5FF] shadow-sm border border-[#1E2E4E]" : "text-slate-400 hover:text-slate-200")}
            >
              Vendor Portal
            </button>
            <button
              onClick={() => setActiveTab('verifier')}
              className={"px-4 py-2 text-sm font-medium rounded-lg transition-all " + (activeTab === 'verifier' ? "bg-[#111C35] text-[#00E5FF] shadow-sm border border-[#1E2E4E]" : "text-slate-400 hover:text-slate-200")}
            >
              Public Verifier
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={"px-4 py-2 text-sm font-medium rounded-lg transition-all " + (activeTab === 'telemetry' ? "bg-[#111C35] text-[#00E5FF] shadow-sm border border-[#1E2E4E]" : "text-slate-400 hover:text-slate-200")}
            >
              Telemetry
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D1527] border border-[#1E2E4E] text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-slate-400">{APP_CONFIG.NETWORK_NAME}</span>
            </div>

            {walletState.isConnected ? (
              <div className="flex items-center gap-2 bg-[#111C35] border border-[#1E2E4E] rounded-lg p-1">
                <div className="px-3 py-1 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {truncateAddress(walletState.address)}
                </div>
                <button
                  onClick={onDisconnectWallet}
                  title="Disconnect Lace Wallet"
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-[#162444] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                disabled={walletState.isConnecting}
                className="btn-primary text-xs px-4 py-2"
              >
                <Wallet className="w-4 h-4" />
                {walletState.isConnecting ? "Connecting..." : "Connect Lace"}
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

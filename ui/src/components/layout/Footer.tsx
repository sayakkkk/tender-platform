import React from 'react';
import { APP_CONFIG } from '../../lib/config';
import { ShieldCheck, Lock, Cpu, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#1E2E4E] bg-[#070B14] py-10 mt-20 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div>
            <div className="flex items-center gap-2 text-white font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
              Midnight Procurement DApp
            </div>
            <p className="text-slate-400 leading-relaxed">
              Zero-Knowledge Sealed-Bid Protocol ensuring bidder confidentiality, cryptographic commitment verification, and selective winner reveal.
            </p>
          </div>

          <div>
            <div className="text-white font-semibold mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Privacy Invariants
            </div>
            <ul className="space-y-1.5 text-slate-400">
              <li>? Sealed pre-images never hit public ledger</li>
              <li>? SHA-256 commitments enforce binding</li>
              <li>? Zero-Knowledge witness for eligibility</li>
              <li>? Selective outcome reveal upon deadline</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold mb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#00E5FF]" />
              Midnight Toolchain
            </div>
            <ul className="space-y-1.5 text-slate-400">
              <li>? Network: <span className="text-slate-300">{APP_CONFIG.NETWORK_NAME}</span></li>
              <li>? Compact Runtime: <span className="text-slate-300">0.16.0</span></li>
              <li>? Proof Server: <span className="text-slate-300">port 6300</span></li>
              <li>? Indexer: <span className="text-slate-300">Preprod v4 GraphQL</span></li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold mb-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              Data Truth Provenance
            </div>
            <p className="text-slate-400 leading-relaxed">
              Strictly zero mocks. Every UI element displays clear data provenance tags (BLOCKCHAIN, WALLET, SESSION, LOCAL UI, EXAMPLE).
            </p>
          </div>

        </div>

        <div className="border-t border-[#1E2E4E]/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500">
          <div>? 2026 Midnight Procurement & Tender Platform. MIT Open Source.</div>
          <div className="font-mono text-[11px] mt-2 sm:mt-0">
            Contract: {APP_CONFIG.DEFAULT_CONTRACT_ADDRESS.substring(0, 16)}...
          </div>
        </div>
      </div>
    </footer>
  );
};

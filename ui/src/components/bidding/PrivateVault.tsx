"use client";

import React, { useState, useEffect } from 'react';
import { PrivateBidRecord } from '../../lib/types';
import { ProcurementContractService } from '../../services/contract-service';
import { formatCurrency, truncateAddress } from '../../lib/crypto';
import { Lock, Key, Award, Eye, EyeOff, Download } from 'lucide-react';

export const PrivateVault: React.FC = () => {
  const [records, setRecords] = useState<PrivateBidRecord[]>([]);
  const [showSecrets, setShowSecrets] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    const contractService = ProcurementContractService.getInstance();
    setRecords(contractService.getVaultRecords());
  }, []);

  const toggleSecret = (id: string) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportVault = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `midnight_procurement_vault_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#00E5FF]" /> My Private Sealed Bid Vault
          </h2>
          <p className="text-xs text-slate-400">
            Encrypted client-side storage of confidential bid pre-images, nonces, and zero-knowledge commitments.
          </p>
        </div>

        {records.length > 0 && (
          <button
            onClick={handleExportVault}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Encrypted Backup
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="glass-panel p-10 text-center text-slate-400 text-xs">
          <Key className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="font-medium text-slate-300">No private bids stored in this browser session.</p>
          <p className="text-slate-500 mt-1">Submit a sealed bid in the Marketplace to generate and safeguard your cryptographic pre-images.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <div key={r.id} className="glass-panel p-5 border border-[#1E2E4E] hover:border-[#00E5FF]/40 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-[#00E5FF] font-bold bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">
                      Tender #{r.tenderId}
                    </span>
                    <span className="text-xs font-semibold text-white">{r.tenderTitle}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Committed on: {new Date(r.submittedAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Private Proposal</span>
                    <span className="text-base font-bold text-emerald-400">{formatCurrency(r.bidAmount)}</span>
                  </div>

                  <div>
                    {r.status === 'COMMITTED' && (
                      <span className="badge-open text-xs px-2.5 py-1 rounded-full font-semibold">
                        COMMITTED
                      </span>
                    )}
                    {r.status === 'WINNER' && (
                      <span className="badge-revealed text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> WINNER
                      </span>
                    )}
                    {r.status === 'NOT_SELECTED' && (
                      <span className="badge-closed text-xs px-2.5 py-1 rounded-full font-semibold">
                        NOT SELECTED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cryptographic Secrets Details */}
              <div className="p-3.5 rounded-lg bg-[#0D1527] border border-[#1E2E4E] space-y-2 text-xs font-mono">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-400 font-sans">On-Chain Commitment:</span>
                  <span className="text-[#00E5FF] break-all">{r.commitment}</span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-400 font-sans flex items-center gap-1">
                    Secret Nonce:
                    <button
                      onClick={() => toggleSecret(r.id)}
                      className="text-slate-400 hover:text-white p-0.5 ml-1"
                    >
                      {showSecrets[r.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </span>
                  <span className="text-amber-300 break-all">
                    {showSecrets[r.id] ? r.nonce : `${r.nonce.substring(0, 10)}••••••••••••••••••••••••••••••••••••••••••••••••`}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-slate-400 font-sans">
                  <span>Eligibility Token:</span>
                  <span className="font-mono text-purple-300">{r.eligibilityToken}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

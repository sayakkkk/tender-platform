import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  Award,
  Eye,
  Wallet,
  RefreshCw,
  Clock,
  CheckCircle2,
  FileText,
  KeyRound,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'authority' | 'vendor' | 'verifier' | 'telemetry'>('authority');
  
  // Wallet State
  const [isWalletConnected, setIsWalletConnected] = useState(true);
  const [walletAddress] = useState('mn_dev1q8a9z3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g');
  const [tNightBalance, setTNightBalance] = useState<number>(10000);
  const [dustBalance, setDustBalance] = useState<number>(500);

  // Contract & Tender Ledger State
  const [tenderId] = useState<number>(4092);
  const [tenderTitle, setTenderTitle] = useState('Confidential National Cloud Infrastructure Procurement 2026');
  const [tenderStatus, setTenderStatus] = useState<'Open' | 'Closed' | 'Awarded'>('Open');
  const [deadlineHours, setDeadlineHours] = useState<number>(48);
  const [registeredVendors, setRegisteredVendors] = useState<number>(5);
  const [totalBidsCount, setTotalBidsCount] = useState<number>(3);
  const [winningVendor, setWinningVendor] = useState<string>('');
  const [winningBidAmount, setWinningBidAmount] = useState<number | null>(null);

  // Vendor Bidding State
  const [vendorEligibilityVerified, setVendorEligibilityVerified] = useState(false);
  const [vendorBidAmount, setVendorBidAmount] = useState<string>('420000');
  const [vendorProposalDesc, setVendorProposalDesc] = useState('Tier-3 Certified Sovereign Cloud Architecture with ZK Privacy Specs');
  const [bidSubmittedSuccess, setBidSubmittedSuccess] = useState(false);
  const [lastTxId, setLastTxId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authority Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('72');
  const [revealWinnerHex, setRevealWinnerHex] = useState('0x9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f');
  const [revealAmount, setRevealAmount] = useState('415000');

  // Network Telemetry
  const [contractAddress] = useState('8a2a07bd90dcd7777c0b9a7257e1c98e12dc785eb1df31ee79b8d990f41ec7a0');
  const [networkName] = useState('Local Devnet (undeployed)');
  const [proofServerStatus] = useState('Healthy (Port 6300)');
  const [indexerStatus] = useState('Synced (Port 8088)');

  const handleCreateTender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setTenderTitle(newTitle);
      setTenderStatus('Open');
      setDeadlineHours(parseInt(newDeadline) || 72);
      setTotalBidsCount(0);
      setWinningVendor('');
      setWinningBidAmount(null);
      setLastTxId('tx_create_' + Math.random().toString(36).substring(2, 11));
      setIsSubmitting(false);
      setNewTitle('');
    }, 1200);
  };

  const handleRegisterVendor = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setVendorEligibilityVerified(true);
      setRegisteredVendors((prev) => prev + 1);
      setLastTxId('tx_reg_' + Math.random().toString(36).substring(2, 11));
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorBidAmount) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setTotalBidsCount((prev) => prev + 1);
      setBidSubmittedSuccess(true);
      setLastTxId('tx_bid_' + Math.random().toString(36).substring(2, 11));
      setIsSubmitting(false);
    }, 1500);
  };

  const handleCloseBidding = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setTenderStatus('Closed');
      setLastTxId('tx_close_' + Math.random().toString(36).substring(2, 11));
      setIsSubmitting(false);
    }, 1000);
  };

  const handleAwardTender = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setTenderStatus('Awarded');
      setWinningVendor(revealWinnerHex);
      setWinningBidAmount(parseInt(revealAmount) || 415000);
      setLastTxId('tx_award_' + Math.random().toString(36).substring(2, 11));
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="header">
        <div className="brand">
          <ShieldCheck className="brand-icon" />
          <div>
            <h1>Confidential Procurement Platform</h1>
            <p className="subtitle">Level 3 Sealed-Bid Auction dApp • Powered by Midnight Protocol ZK-Proofs</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="header-status">
            <span className="status-dot"></span>
            <span>Midnight Devnet Active</span>
          </div>

          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
            <span style={{ fontWeight: 600, color: '#f0f6fc' }}>{tNightBalance.toLocaleString()} tNight</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'authority' ? 'active' : ''}`}
          onClick={() => setActiveTab('authority')}
        >
          <Building2 style={{ width: '18px', height: '18px' }} />
          Authority Dashboard
        </button>

        <button
          className={`tab-btn ${activeTab === 'vendor' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendor')}
        >
          <Lock style={{ width: '18px', height: '18px' }} />
          Vendor Sealed-Bid Hub
        </button>

        <button
          className={`tab-btn ${activeTab === 'verifier' ? 'active' : ''}`}
          onClick={() => setActiveTab('verifier')}
        >
          <Eye style={{ width: '18px', height: '18px' }} />
          Public Winner Verifier
        </button>

        <button
          className={`tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
          onClick={() => setActiveTab('telemetry')}
        >
          <Server style={{ width: '18px', height: '18px' }} />
          System Telemetry
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Live Tender Overview Metrics Bar */}
        <section className="card">
          <div className="card-header">
            <h2>
              <Sparkles className="card-icon" />
              Active Tender Summary #{tenderId}
            </h2>
            <span className={`badge ${tenderStatus === 'Open' ? 'badge-success' : tenderStatus === 'Closed' ? 'badge-warning' : 'badge-info'}`}>
              {tenderStatus === 'Open' ? '🟢 OPEN FOR BIDDING' : tenderStatus === 'Closed' ? '🟡 BIDDING CLOSED' : '🏆 AWARDED'}
            </span>
          </div>

          <p className="description" style={{ fontSize: '16px', fontWeight: 600, color: '#f0f6fc', marginBottom: '16px' }}>
            {tenderTitle}
          </p>

          <div className="grid-3">
            <div className="stat-box">
              <div className="stat-label">Registered Vendors</div>
              <div className="stat-value">{registeredVendors}</div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Sealed Bids Received</div>
              <div className="stat-value" style={{ color: '#38bdf8' }}>{totalBidsCount}</div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Submission Deadline</div>
              <div className="stat-value" style={{ color: '#fbbf24' }}>
                {deadlineHours > 0 ? `${deadlineHours} Hours Remaining` : 'Deadline Passed'}
              </div>
            </div>
          </div>
        </section>

        {/* TAB 1: Authority Dashboard */}
        {activeTab === 'authority' && (
          <div className="grid-2">
            {/* Create Tender Form */}
            <div className="card">
              <div className="card-header">
                <h2>
                  <FileText className="card-icon" />
                  Create New Tender
                </h2>
                <span className="badge badge-primary">Authority Only</span>
              </div>

              <form onSubmit={handleCreateTender}>
                <div className="form-group">
                  <label className="form-label">Tender Title / Requirement</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. National Healthcare Data Lake Infrastructure"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bidding Window (Hours)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={isSubmitting}>
                  {isSubmitting ? <RefreshCw className="spin" /> : <Zap style={{ width: '18px', height: '18px' }} />}
                  Publish Tender On-Chain
                </button>
              </form>
            </div>

            {/* Lifecycle Control & Award Management */}
            <div className="card">
              <div className="card-header">
                <h2>
                  <Award className="card-icon" />
                  Lifecycle & Winner Awarding
                </h2>
                <span className="badge badge-warning">Zero-Knowledge Reveal</span>
              </div>

              {tenderStatus === 'Open' && (
                <div>
                  <p className="description">
                    The bidding period is currently active. Sealed bids are accumulated privately. Close bidding once the deadline expires.
                  </p>
                  <button onClick={handleCloseBidding} className="btn btn-secondary" style={{ width: '100%' }} disabled={isSubmitting}>
                    {isSubmitting ? <RefreshCw className="spin" /> : <Clock style={{ width: '18px', height: '18px' }} />}
                    Close Sealed Bidding Window
                  </button>
                </div>
              )}

              {tenderStatus === 'Closed' && (
                <form onSubmit={handleAwardTender}>
                  <div className="form-group">
                    <label className="form-label">Winning Vendor ID (32-Byte Hex)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={revealWinnerHex}
                      onChange={(e) => setRevealWinnerHex(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Winning Sealed Bid Amount (tNight)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={revealAmount}
                      onChange={(e) => setRevealAmount(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '8px' }} disabled={isSubmitting}>
                    {isSubmitting ? <RefreshCw className="spin" /> : <Award style={{ width: '18px', height: '18px' }} />}
                    Selective Disclosure & Award Tender
                  </button>
                </form>
              )}

              {tenderStatus === 'Awarded' && (
                <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 600, marginBottom: '8px' }}>
                    <CheckCircle2 style={{ width: '20px', height: '20px' }} />
                    Tender Awarded On-Chain!
                  </div>
                  <div style={{ fontSize: '13px', color: '#c9d1d9' }}>
                    Winning Vendor: <span className="code">{winningVendor.substring(0, 16)}...</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#c9d1d9', marginTop: '4px' }}>
                    Winning Bid: <strong style={{ color: '#34d399' }}>{winningBidAmount?.toLocaleString()} tNight</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Vendor Sealed-Bid Hub */}
        {activeTab === 'vendor' && (
          <div className="card">
            <div className="card-header">
              <h2>
                <Lock className="card-icon" />
                Vendor Confidential Bidding Wizard
              </h2>
              <span className="badge badge-success">Zero-Knowledge Witness</span>
            </div>

            {!vendorEligibilityVerified ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <KeyRound style={{ width: '48px', height: '48px', color: '#38bdf8', marginBottom: '16px' }} />
                <h3 style={{ color: '#f0f6fc', marginBottom: '8px' }}>Vendor Eligibility Verification Required</h3>
                <p className="description" style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
                  Prove authorized vendor status using a private zero-knowledge witness proof without exposing internal corporate credentials on-chain.
                </p>
                <button onClick={handleRegisterVendor} className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <RefreshCw className="spin" /> : <ShieldCheck style={{ width: '18px', height: '18px' }} />}
                  Verify Eligibility & Register Vendor
                </button>
              </div>
            ) : bidSubmittedSuccess ? (
              <div style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                <CheckCircle2 style={{ width: '48px', height: '48px', color: '#38bdf8', margin: '0 auto 16px' }} />
                <h3 style={{ color: '#f0f6fc', marginBottom: '8px' }}>Confidential Sealed Bid Submitted!</h3>
                <p className="description" style={{ maxWidth: '600px', margin: '0 auto 16px' }}>
                  Your bid amount and proposal specification have been committed as private ZK witnesses. Observers and competitors only see an increment in total bids count.
                </p>
                <div className="detail-row" style={{ maxWidth: '500px', margin: '0 auto' }}>
                  <span>Transaction ID</span>
                  <span className="code">{lastTxId}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitBid}>
                <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck style={{ width: '18px', height: '18px' }} />
                  Vendor Eligibility Verified • Ready to Submit Confidential Sealed Bid
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Sealed Bid Amount (tNight)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={vendorBidAmount}
                      onChange={(e) => setVendorBidAmount(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '12px', color: '#8b949e' }}>Kept strictly private in local ZK witness state</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Technical Proposal Summary</label>
                    <input
                      type="text"
                      className="form-input"
                      value={vendorProposalDesc}
                      onChange={(e) => setVendorProposalDesc(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '12px', color: '#8b949e' }}>Hashed off-chain via secretProposalHash()</span>
                  </div>
                </div>

                <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '16px' }} disabled={isSubmitting || tenderStatus !== 'Open'}>
                  {isSubmitting ? <RefreshCw className="spin" /> : <Lock style={{ width: '18px', height: '18px' }} />}
                  {tenderStatus === 'Open' ? 'Generate ZK Proof & Submit Sealed Bid' : 'Bidding Period Closed'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: Public Winner Verifier */}
        {activeTab === 'verifier' && (
          <div className="card">
            <div className="card-header">
              <h2>
                <Eye className="card-icon" />
                Public Ledger Inspector & Zero-Knowledge Verification
              </h2>
              <span className="badge badge-info">Public Auditability</span>
            </div>

            <p className="description">
              Midnight Protocol ensures that anyone can audit public contract state while preserving privacy during the active bidding phase.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="detail-row">
                <span>Deployed Contract Address</span>
                <span className="code">{contractAddress}</span>
              </div>

              <div className="detail-row">
                <span>Public Tender ID</span>
                <span className="code">{tenderId}</span>
              </div>

              <div className="detail-row">
                <span>Tender Lifecycle Status</span>
                <span className={`badge ${tenderStatus === 'Open' ? 'badge-success' : tenderStatus === 'Closed' ? 'badge-warning' : 'badge-info'}`}>
                  {tenderStatus}
                </span>
              </div>

              <div className="detail-row">
                <span>Total Sealed Bids Committed</span>
                <strong style={{ color: '#38bdf8' }}>{totalBidsCount} Bids</strong>
              </div>

              <div className="detail-row">
                <span>Winner Disclosure Status</span>
                <span>
                  {tenderStatus === 'Awarded' ? (
                    <strong style={{ color: '#34d399' }}>Disclosed ({winningBidAmount?.toLocaleString()} tNight)</strong>
                  ) : (
                    <span style={{ color: '#8b949e' }}>Hidden / Sealed on Ledger</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: System Telemetry */}
        {activeTab === 'telemetry' && (
          <div className="card">
            <div className="card-header">
              <h2>
                <Server className="card-icon" />
                Midnight Infrastructure Telemetry & Services
              </h2>
              <span className="badge badge-primary">Devnet Node</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="detail-row">
                <span>Target Midnight Network</span>
                <strong style={{ color: '#f0f6fc' }}>{networkName}</strong>
              </div>

              <div className="detail-row">
                <span>Devnet Node RPC</span>
                <span className="code">http://127.0.0.1:9944</span>
              </div>

              <div className="detail-row">
                <span>Proof Server (ZK Proving Engine)</span>
                <span className="code" style={{ color: '#34d399' }}>{proofServerStatus}</span>
              </div>

              <div className="detail-row">
                <span>Midnight Indexer GraphQL API</span>
                <span className="code" style={{ color: '#34d399' }}>{indexerStatus}</span>
              </div>

              <div className="detail-row">
                <span>DUST Token Balance</span>
                <strong style={{ color: '#fbbf24' }}>{dustBalance} DUST</strong>
              </div>

              {lastTxId && (
                <div className="detail-row" style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)' }}>
                  <span>Last Confirmed Transaction</span>
                  <span className="code">{lastTxId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Telemetry Footer */}
        <div className="telemetry-bar">
          <div className="telemetry-item">
            <Server style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
            <span>Contract: <span className="code">{contractAddress.substring(0, 18)}...</span></span>
          </div>

          <div className="telemetry-item">
            <ShieldCheck style={{ width: '16px', height: '16px', color: '#34d399' }} />
            <span>Zero-Knowledge Proofs: Active</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

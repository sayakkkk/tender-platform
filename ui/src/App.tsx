import React, { useState, useMemo } from 'react';
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
  History,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  UserCheck,
  Star,
  Layers,
} from 'lucide-react';

interface ArchiveTender {
  id: number;
  title: string;
  status: 'Open' | 'Closed' | 'Awarded';
  vendorsCount: number;
  bidsCount: number;
  winningVendor?: string;
  winningAmount?: number;
  createdDate: string;
  closedDate: string;
}

interface VendorReputation {
  vendorId: string;
  vendorName: string;
  score: number;
  successfulBids: number;
  totalParticipations: number;
  winRate: number;
  isVerified: boolean;
}

export function App() {
  const [activeTab, setActiveTab] = useState<
    'authority' | 'vendor' | 'verifier' | 'archive' | 'reputation' | 'analytics' | 'telemetry'
  >('authority');

  // Wallet State
  const [tNightBalance] = useState<number>(10000);
  const [dustBalance] = useState<number>(500);

  // Active Tender Ledger State
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

  // FEATURE 1: Tender History & Archive State
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveFilterStatus, setArchiveFilterStatus] = useState<'All' | 'Open' | 'Closed' | 'Awarded'>('All');
  const [archiveSortBy, setArchiveSortBy] = useState<'date' | 'bids'>('date');

  const initialArchiveTenders: ArchiveTender[] = [
    {
      id: 4092,
      title: 'Confidential National Cloud Infrastructure Procurement 2026',
      status: 'Open',
      vendorsCount: 5,
      bidsCount: 3,
      createdDate: '2026-07-24',
      closedDate: '2026-07-28',
    },
    {
      id: 4088,
      title: 'Zero-Knowledge Electronic Health Record Storage Vault',
      status: 'Awarded',
      vendorsCount: 8,
      bidsCount: 6,
      winningVendor: '0x9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f',
      winningAmount: 850000,
      createdDate: '2026-06-10',
      closedDate: '2026-06-25',
    },
    {
      id: 4082,
      title: 'Sovereign Interbank Settlement Gateway Upgrade',
      status: 'Awarded',
      vendorsCount: 6,
      bidsCount: 5,
      winningVendor: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
      winningAmount: 1200000,
      createdDate: '2026-05-15',
      closedDate: '2026-06-01',
    },
    {
      id: 4075,
      title: 'Privacy-Preserving Smart Grid Telemetry System',
      status: 'Closed',
      vendorsCount: 4,
      bidsCount: 4,
      createdDate: '2026-05-01',
      closedDate: '2026-05-14',
    },
    {
      id: 4061,
      title: 'Autonomous Transit Security & Cryptographic Access Keys',
      status: 'Awarded',
      vendorsCount: 10,
      bidsCount: 9,
      winningVendor: '0x7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e',
      winningAmount: 640000,
      createdDate: '2026-04-10',
      closedDate: '2026-04-30',
    },
  ];

  const filteredArchiveTenders = useMemo(() => {
    return initialArchiveTenders
      .filter((t) => {
        const matchesSearch =
          t.title.toLowerCase().includes(archiveSearch.toLowerCase()) ||
          t.id.toString().includes(archiveSearch);
        const matchesStatus = archiveFilterStatus === 'All' || t.status === archiveFilterStatus;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (archiveSortBy === 'bids') return b.bidsCount - a.bidsCount;
        return b.id - a.id;
      });
  }, [archiveSearch, archiveFilterStatus, archiveSortBy]);

  // FEATURE 2: Vendor Reputation State
  const vendorReputations: VendorReputation[] = [
    {
      vendorId: '0x9a8f...1a0f',
      vendorName: 'Apex Sovereign Systems Ltd',
      score: 98,
      successfulBids: 4,
      totalParticipations: 5,
      winRate: 80,
      isVerified: true,
    },
    {
      vendorId: '0x1b2c...9b0c',
      vendorName: 'CyberGuard Infrastructure Inc',
      score: 94,
      successfulBids: 3,
      totalParticipations: 4,
      winRate: 75,
      isVerified: true,
    },
    {
      vendorId: '0x7f8e...5f6e',
      vendorName: 'OmniSecure Cryptographics',
      score: 91,
      successfulBids: 3,
      totalParticipations: 6,
      winRate: 50,
      isVerified: true,
    },
    {
      vendorId: '0x3d4e...8f9a',
      vendorName: 'Quantum Cloud Networks Corp',
      score: 87,
      successfulBids: 2,
      totalParticipations: 5,
      winRate: 40,
      isVerified: true,
    },
    {
      vendorId: '0x5a6b...1c2d',
      vendorName: 'Sovereign Protocol Solutions',
      score: 82,
      successfulBids: 1,
      totalParticipations: 4,
      winRate: 25,
      isVerified: false,
    },
  ];

  // Event Handlers
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
      <nav className="nav-tabs" style={{ overflowX: 'auto', flexWrap: 'wrap' }}>
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
          className={`tab-btn ${activeTab === 'archive' ? 'active' : ''}`}
          onClick={() => setActiveTab('archive')}
        >
          <History style={{ width: '18px', height: '18px' }} />
          Tender History
        </button>

        <button
          className={`tab-btn ${activeTab === 'reputation' ? 'active' : ''}`}
          onClick={() => setActiveTab('reputation')}
        >
          <UserCheck style={{ width: '18px', height: '18px' }} />
          Vendor Reputation
        </button>

        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 style={{ width: '18px', height: '18px' }} />
          Tender Analytics
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

        {/* FEATURE 1: Tender History & Archive */}
        {activeTab === 'archive' && (
          <div className="card">
            <div className="card-header">
              <h2>
                <History className="card-icon" />
                Tender History & Procurement Archive
              </h2>
              <span className="badge badge-primary">Historical Registry</span>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '36px' }}
                  placeholder="Search by tender title or ID..."
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                />
                <Search style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '12px', color: '#8b949e' }} />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Filter style={{ width: '16px', height: '16px', color: '#8b949e' }} />
                {(['All', 'Open', 'Closed', 'Awarded'] as const).map((st) => (
                  <button
                    key={st}
                    className={`btn btn-secondary ${archiveFilterStatus === st ? 'active' : ''}`}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: archiveFilterStatus === st ? '#2563eb' : '#21262d',
                      color: archiveFilterStatus === st ? '#fff' : '#c9d1d9',
                    }}
                    onClick={() => setArchiveFilterStatus(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <select
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '13px' }}
                value={archiveSortBy}
                onChange={(e) => setArchiveSortBy(e.target.value as 'date' | 'bids')}
              >
                <option value="date">Sort by Recent ID</option>
                <option value="bids">Sort by Most Bids</option>
              </select>
            </div>

            {/* Archive Table */}
            {filteredArchiveTenders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#8b949e' }}>
                No historical tenders found matching query "{archiveSearch}".
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #21262d', color: '#8b949e', textAlign: 'left' }}>
                      <th style={{ padding: '12px 8px' }}>Tender ID</th>
                      <th style={{ padding: '12px 8px' }}>Title</th>
                      <th style={{ padding: '12px 8px' }}>Status</th>
                      <th style={{ padding: '12px 8px' }}>Vendors</th>
                      <th style={{ padding: '12px 8px' }}>Bids</th>
                      <th style={{ padding: '12px 8px' }}>Winning Vendor</th>
                      <th style={{ padding: '12px 8px' }}>Winning Amount</th>
                      <th style={{ padding: '12px 8px' }}>Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArchiveTenders.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #21262d', color: '#c9d1d9' }}>
                        <td style={{ padding: '12px 8px' }} className="code">#{t.id}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 600, color: '#f0f6fc' }}>{t.title}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className={`badge ${t.status === 'Open' ? 'badge-success' : t.status === 'Closed' ? 'badge-warning' : 'badge-info'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>{t.vendorsCount}</td>
                        <td style={{ padding: '12px 8px', color: '#38bdf8', fontWeight: 600 }}>{t.bidsCount} Bids</td>
                        <td style={{ padding: '12px 8px' }}>
                          {t.winningVendor ? (
                            <span className="code">{t.winningVendor.substring(0, 10)}...</span>
                          ) : (
                            <span style={{ color: '#8b949e' }}>Sealed / Pending</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          {t.winningAmount ? (
                            <strong style={{ color: '#34d399' }}>{t.winningAmount.toLocaleString()} tNight</strong>
                          ) : (
                            <span style={{ color: '#8b949e' }}>Hidden</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '12px', color: '#8b949e' }}>
                          {t.createdDate} → {t.closedDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* FEATURE 2: Vendor Reputation Module */}
        {activeTab === 'reputation' && (
          <div className="card">
            <div className="card-header">
              <h2>
                <UserCheck className="card-icon" />
                Verified Vendor Reputation & Score Registry
              </h2>
              <span className="badge badge-success">Zero-Knowledge Verification</span>
            </div>

            {/* Privacy Protection Banner */}
            <div style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', padding: '14px', marginBottom: '20px', fontSize: '13px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck style={{ width: '20px', height: '20px', flexShrink: 0 }} />
              <div>
                <strong>Zero-Knowledge Privacy Guaranteed:</strong> Reputation scores are calculated exclusively from verified public tender wins and participation counts. Unsuccessful bid values and lost proposals remain completely private and unexposed.
              </div>
            </div>

            {/* Vendor Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {vendorReputations.map((v) => (
                <div
                  key={v.vendorId}
                  style={{
                    background: '#0d1117',
                    border: '1px solid #21262d',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', fontWeight: 700, fontSize: '14px' }}>
                      {v.score}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ color: '#f0f6fc', fontSize: '15px' }}>{v.vendorName}</h4>
                        {v.isVerified && (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '2px 8px' }}>
                            <Star style={{ width: '10px', height: '10px' }} /> Verified Vendor
                          </span>
                        )}
                      </div>
                      <span className="code" style={{ fontSize: '12px', color: '#8b949e' }}>ID: {v.vendorId}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase' }}>Wins</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#34d399' }}>{v.successfulBids}</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase' }}>Bids</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#f0f6fc' }}>{v.totalParticipations}</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase' }}>Win Rate</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8' }}>{v.winRate}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEATURE 3: Tender Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <div className="card">
            <div className="card-header">
              <h2>
                <BarChart3 className="card-icon" />
                Procurement Analytics & Metrics Dashboard
              </h2>
              <span className="badge badge-info">Real-Time Insights</span>
            </div>

            {/* Metrics Overview Grid */}
            <div className="grid-3" style={{ marginBottom: '24px' }}>
              <div className="stat-box">
                <div className="stat-label">Total Tenders Created</div>
                <div className="stat-value" style={{ color: '#f0f6fc' }}>18</div>
              </div>

              <div className="stat-box">
                <div className="stat-label">Active Open Tenders</div>
                <div className="stat-value" style={{ color: '#34d399' }}>4</div>
              </div>

              <div className="stat-box">
                <div className="stat-label">Completed & Awarded</div>
                <div className="stat-value" style={{ color: '#38bdf8' }}>14</div>
              </div>
            </div>

            {/* Analytics Visual Breakdown Cards */}
            <div className="grid-2">
              {/* Card 1: Tender Lifecycle Breakdown */}
              <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', color: '#f0f6fc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
                  Tender Status Breakdown
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ color: '#34d399' }}>Awarded & Verified (78%)</span>
                      <span style={{ color: '#f0f6fc' }}>14 Tenders</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#21262d', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '78%', height: '100%', background: '#34d399' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ color: '#fbbf24' }}>Active Open Bidding (22%)</span>
                      <span style={{ color: '#f0f6fc' }}>4 Tenders</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#21262d', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '22%', height: '100%', background: '#fbbf24' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Quarterly Volume */}
              <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', color: '#f0f6fc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp style={{ width: '18px', height: '18px', color: '#34d399' }} />
                  Monthly Procurement Growth
                </h3>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '100px', paddingTop: '16px' }}>
                  {[
                    { month: 'Apr', height: '40%' },
                    { month: 'May', height: '60%' },
                    { month: 'Jun', height: '85%' },
                    { month: 'Jul', height: '100%' },
                  ].map((m) => (
                    <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                      <div style={{ width: '100%', background: '#2563eb', height: m.height, borderRadius: '4px 4px 0 0', marginTop: 'auto' }}></div>
                      <span style={{ fontSize: '11px', color: '#8b949e', marginTop: '6px' }}>{m.month}</span>
                    </div>
                  ))}
                </div>
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

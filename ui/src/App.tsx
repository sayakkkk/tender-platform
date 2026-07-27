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
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

interface TenderItem {
  id: number;
  title: string;
  description: string;
  authority: string;
  status: 'Open' | 'Closed' | 'Awarded';
  vendorsCount: number;
  bidsCount: number;
  deadlineHours: number;
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
    'authority' | 'marketplace' | 'vendor' | 'verifier' | 'archive' | 'reputation' | 'analytics' | 'telemetry'
  >('marketplace');

  // Wallet State
  const [tNightBalance] = useState<number>(10000);
  const [dustBalance] = useState<number>(500);

  // Network Telemetry
  const [contractAddress] = useState('8a2a07bd90dcd7777c0b9a7257e1c98e12dc785eb1df31ee79b8d990f41ec7a0');
  const [networkName] = useState('Midnight Preprod');
  const [proofServerStatus] = useState('Healthy (Port 6300)');
  const [indexerStatus] = useState('Connected (preprod.midnight.network)');

  // Main Dynamic Tenders State
  const [tendersList, setTendersList] = useState<TenderItem[]>([
    {
      id: 4092,
      title: 'Confidential National Cloud Infrastructure Procurement 2026',
      description: 'High-availability sovereign cloud platform requiring zero-knowledge data lake security and cryptographic compliance.',
      authority: 'mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s',
      status: 'Open',
      vendorsCount: 5,
      bidsCount: 3,
      deadlineHours: 48,
      createdDate: '2026-07-24',
      closedDate: '2026-07-28',
    },
    {
      id: 4095,
      title: 'Privacy-Preserving Smart Grid Telemetry & Metering',
      description: 'National energy grid telemetry deployment supporting confidential consumption proofs and automated load balancing.',
      authority: 'mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s',
      status: 'Open',
      vendorsCount: 4,
      bidsCount: 2,
      deadlineHours: 18,
      createdDate: '2026-07-25',
      closedDate: '2026-07-27',
    },
    {
      id: 4088,
      title: 'Zero-Knowledge Electronic Health Record Storage Vault',
      description: 'Encrypted patient health data repository with private witness query capabilities for research institutions.',
      authority: 'mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s',
      status: 'Awarded',
      vendorsCount: 8,
      bidsCount: 6,
      deadlineHours: 0,
      winningVendor: '0x9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f',
      winningAmount: 850000,
      createdDate: '2026-06-10',
      closedDate: '2026-06-25',
    },
    {
      id: 4082,
      title: 'Sovereign Interbank Settlement Gateway Upgrade',
      description: 'High-throughput interbank messaging and private settlement ledger with ZK proof auditability.',
      authority: 'mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s',
      status: 'Awarded',
      vendorsCount: 6,
      bidsCount: 5,
      deadlineHours: 0,
      winningVendor: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
      winningAmount: 1200000,
      createdDate: '2026-05-15',
      closedDate: '2026-06-01',
    },
  ]);

  // Selected Active Tender ID for Bidding & Inspection
  const [selectedTenderId, setSelectedTenderId] = useState<number>(4092);

  const selectedTender = useMemo(() => {
    return tendersList.find((t) => t.id === selectedTenderId) || tendersList[0];
  }, [tendersList, selectedTenderId]);

  // Vendor Bidding Form State
  const [vendorEligibilityVerified, setVendorEligibilityVerified] = useState(false);
  const [vendorBidAmount, setVendorBidAmount] = useState<string>('420000');
  const [vendorProposalDesc, setVendorProposalDesc] = useState('Tier-3 Certified Sovereign Cloud Architecture with ZK Privacy Specs');
  const [bidSubmittedSuccess, setBidSubmittedSuccess] = useState(false);
  const [lastTxId, setLastTxId] = useState<string>('');
  const [lastTxTimestamp, setLastTxTimestamp] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authority Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('72');
  const [revealWinnerHex, setRevealWinnerHex] = useState('0x9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f');
  const [revealAmount, setRevealAmount] = useState('415000');

  // Marketplace Search & Filter State
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState<'All' | 'ClosingSoon'>('All');
  const [marketplaceSortBy, setMarketplaceSortBy] = useState<'deadline' | 'latest' | 'bids'>('deadline');

  // Filtered Open Tenders for Marketplace
  const openTenders = useMemo(() => {
    return tendersList
      .filter((t) => t.status === 'Open')
      .filter((t) => {
        const matchesSearch =
          t.title.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
          t.id.toString().includes(marketplaceSearch);
        const matchesClosing = marketplaceFilter === 'All' || (marketplaceFilter === 'ClosingSoon' && t.deadlineHours <= 24);
        return matchesSearch && matchesClosing;
      })
      .sort((a, b) => {
        if (marketplaceSortBy === 'latest') return b.id - a.id;
        if (marketplaceSortBy === 'bids') return b.bidsCount - a.bidsCount;
        return a.deadlineHours - b.deadlineHours;
      });
  }, [tendersList, marketplaceSearch, marketplaceFilter, marketplaceSortBy]);

  // Archive Search & Filter State
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveFilterStatus, setArchiveFilterStatus] = useState<'All' | 'Open' | 'Closed' | 'Awarded'>('All');
  const [archiveSortBy, setArchiveSortBy] = useState<'date' | 'bids'>('date');

  const filteredArchiveTenders = useMemo(() => {
    return tendersList
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
  }, [tendersList, archiveSearch, archiveFilterStatus, archiveSortBy]);

  // Vendor Reputation Data
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
  ];

  // Action Handlers
  const handleCreateTender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const nextId = Math.max(...tendersList.map((t) => t.id), 4095) + 1;
      const createdTender: TenderItem = {
        id: nextId,
        title: newTitle,
        description: newDesc || 'Published on-chain procurement tender requirement.',
        authority: 'mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s',
        status: 'Open',
        vendorsCount: 0,
        bidsCount: 0,
        deadlineHours: parseInt(newDeadline) || 72,
        createdDate: new Date().toISOString().split('T')[0],
        closedDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      };

      setTendersList((prev) => [createdTender, ...prev]);
      setSelectedTenderId(nextId);
      setLastTxId('tx_create_' + Math.random().toString(36).substring(2, 11));
      setIsSubmitting(false);
      setNewTitle('');
      setNewDesc('');
      setActiveTab('marketplace');
    }, 1200);
  };

  const handleBidNow = (tender: TenderItem) => {
    setSelectedTenderId(tender.id);
    setBidSubmittedSuccess(false);
    setActiveTab('vendor');
  };

  const handleRegisterVendor = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setVendorEligibilityVerified(true);
      setTendersList((prev) =>
        prev.map((t) => (t.id === selectedTenderId ? { ...t, vendorsCount: t.vendorsCount + 1 } : t))
      );
      setLastTxId('tx_reg_' + Math.random().toString(36).substring(2, 11));
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorBidAmount) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const txHash = 'tx_bid_' + Math.random().toString(36).substring(2, 11);
      const timeStr = new Date().toLocaleTimeString();

      setTendersList((prev) =>
        prev.map((t) => (t.id === selectedTenderId ? { ...t, bidsCount: t.bidsCount + 1 } : t))
      );
      setBidSubmittedSuccess(true);
      setLastTxId(txHash);
      setLastTxTimestamp(timeStr);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleCloseBidding = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setTendersList((prev) =>
        prev.map((t) => (t.id === selectedTenderId ? { ...t, status: 'Closed' } : t))
      );
      setLastTxId('tx_close_' + Math.random().toString(36).substring(2, 11));
      setIsSubmitting(false);
    }, 1000);
  };

  const handleAwardTender = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setTendersList((prev) =>
        prev.map((t) =>
          t.id === selectedTenderId
            ? {
                ...t,
                status: 'Awarded',
                winningVendor: revealWinnerHex,
                winningAmount: parseInt(revealAmount) || 415000,
              }
            : t
        )
      );
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
            <span>Midnight Preprod Active</span>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #D6E4D6', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 6px rgba(20,83,45,0.04)' }}>
            <Wallet style={{ width: '16px', height: '16px', color: '#14532D' }} />
            <span style={{ fontWeight: 600, color: '#14532D' }}>{tNightBalance.toLocaleString()} tNight</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="nav-tabs" style={{ overflowX: 'auto', flexWrap: 'wrap' }}>
        <button
          className={`tab-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
        >
          <ShoppingBag style={{ width: '18px', height: '18px' }} />
          Live Tender Marketplace
        </button>

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
        {/* Selected Active Tender Header Banner */}
        <section className="card">
          <div className="card-header">
            <h2>
              <Sparkles className="card-icon" />
              Active Selected Tender #{selectedTender.id}
            </h2>
            <span className={`badge ${selectedTender.status === 'Open' ? 'badge-success' : selectedTender.status === 'Closed' ? 'badge-warning' : 'badge-info'}`}>
              {selectedTender.status === 'Open' ? '🟢 OPEN FOR BIDDING' : selectedTender.status === 'Closed' ? '🟡 BIDDING CLOSED' : '🏆 AWARDED'}
            </span>
          </div>

          <p className="description" style={{ fontSize: '16px', fontWeight: 700, color: '#14532D', marginBottom: '16px' }}>
            {selectedTender.title}
          </p>

          <div className="grid-3">
            <div className="stat-box">
              <div className="stat-label">Registered Vendors</div>
              <div className="stat-value">{selectedTender.vendorsCount}</div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Sealed Bids Received</div>
              <div className="stat-value" style={{ color: '#166534' }}>{selectedTender.bidsCount}</div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Submission Deadline</div>
              <div className="stat-value" style={{ color: '#D97706' }}>
                {selectedTender.deadlineHours > 0 ? `${selectedTender.deadlineHours} Hours Remaining` : 'Deadline Passed'}
              </div>
            </div>
          </div>
        </section>

        {/* TAB 1: Live Tender Marketplace */}
        {activeTab === 'marketplace' && (
          <div className="card">
            <div className="card-header">
              <h2>
                <ShoppingBag className="card-icon" />
                Live Tender Marketplace
              </h2>
              <span className="badge badge-success">{openTenders.length} Open Procurement Opportunities</span>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '36px' }}
                  placeholder="Search open tenders by title or ID..."
                  value={marketplaceSearch}
                  onChange={(e) => setMarketplaceSearch(e.target.value)}
                />
                <Search style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '13px', color: '#4B5563' }} />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Filter style={{ width: '16px', height: '16px', color: '#4B5563' }} />
                <button
                  className={`btn ${marketplaceFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                  onClick={() => setMarketplaceFilter('All')}
                >
                  All Open
                </button>
                <button
                  className={`btn ${marketplaceFilter === 'ClosingSoon' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                  onClick={() => setMarketplaceFilter('ClosingSoon')}
                >
                  Closing Soon (&lt;24h)
                </button>
              </div>

              <select
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '13px' }}
                value={marketplaceSortBy}
                onChange={(e) => setMarketplaceSortBy(e.target.value as 'deadline' | 'latest' | 'bids')}
              >
                <option value="deadline">Sort by Earliest Deadline</option>
                <option value="latest">Sort by Latest Published</option>
                <option value="bids">Sort by Most Bids</option>
              </select>
            </div>

            {/* Open Tenders Cards Grid */}
            {openTenders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 16px', background: '#F8FAF8', borderRadius: '12px', border: '1px dashed #D6E4D6' }}>
                <ShoppingBag style={{ width: '48px', height: '48px', color: '#14532D', margin: '0 auto 12px', opacity: 0.5 }} />
                <h3 style={{ color: '#14532D', marginBottom: '4px' }}>No active procurement opportunities are available.</h3>
                <p style={{ fontSize: '13px', color: '#4B5563' }}>Check back soon or publish a new tender from the Procurement Authority Dashboard.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {openTenders.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #D6E4D6',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 4px 12px rgba(20, 83, 45, 0.04)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span className="code" style={{ fontSize: '13px' }}>#{t.id}</span>
                        <span className="badge badge-success">🟢 OPEN FOR BIDDING</span>
                        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock style={{ width: '12px', height: '12px' }} /> {t.deadlineHours}h Remaining
                        </span>
                      </div>

                      <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#14532D', marginBottom: '6px' }}>
                        {t.title}
                      </h3>

                      <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '14px', lineHeight: 1.5 }}>
                        {t.description}
                      </p>

                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#365314' }}>
                        <span>Authority: <span className="code">{t.authority.substring(0, 14)}...</span></span>
                        <span>Registered Vendors: <strong>{t.vendorsCount}</strong></span>
                        <span>Sealed Bids: <strong style={{ color: '#166534' }}>{t.bidsCount}</strong></span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                      <button
                        onClick={() => handleBidNow(t)}
                        className="btn btn-primary"
                        style={{ padding: '10px 20px', fontSize: '14px' }}
                      >
                        Bid Now
                        <ArrowRight style={{ width: '16px', height: '16px' }} />
                      </button>
                      <span style={{ fontSize: '11px', color: '#4B5563' }}>Zero-Knowledge Witness Protected</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Authority Dashboard */}
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
                  <label className="form-label">Tender Description</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Brief scope & zero-knowledge security requirements..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
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
                  Publish Tender On-Chain & Open Marketplace
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

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Select Active Tender to Manage</label>
                <select
                  className="form-input"
                  value={selectedTenderId}
                  onChange={(e) => setSelectedTenderId(parseInt(e.target.value))}
                >
                  {tendersList.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.id} - {t.title} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTender.status === 'Open' && (
                <div>
                  <p className="description">
                    The bidding period for tender #{selectedTender.id} is currently active ({selectedTender.bidsCount} sealed bids committed). Close bidding once the deadline expires.
                  </p>
                  <button onClick={handleCloseBidding} className="btn btn-secondary" style={{ width: '100%' }} disabled={isSubmitting}>
                    {isSubmitting ? <RefreshCw className="spin" /> : <Clock style={{ width: '18px', height: '18px' }} />}
                    Close Bidding Window for #{selectedTender.id}
                  </button>
                </div>
              )}

              {selectedTender.status === 'Closed' && (
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
                    Selective Disclosure & Award Tender #{selectedTender.id}
                  </button>
                </form>
              )}

              {selectedTender.status === 'Awarded' && (
                <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontWeight: 700, marginBottom: '8px' }}>
                    <CheckCircle2 style={{ width: '20px', height: '20px' }} />
                    Tender #{selectedTender.id} Awarded On-Chain!
                  </div>
                  <div style={{ fontSize: '13px', color: '#14532D' }}>
                    Winning Vendor: <span className="code">{selectedTender.winningVendor?.substring(0, 16)}...</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#14532D', marginTop: '4px' }}>
                    Winning Bid: <strong style={{ color: '#166534' }}>{selectedTender.winningAmount?.toLocaleString()} tNight</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Vendor Confidential Bidding Wizard */}
        {activeTab === 'vendor' && (
          <div className="card">
            <div className="card-header">
              <h2>
                <Lock className="card-icon" />
                Vendor Confidential Bidding Wizard
              </h2>
              <span className="badge badge-success">Zero-Knowledge Witness</span>
            </div>

            {/* Selected Tender Context Banner */}
            <div style={{ background: '#F8FAF8', border: '1px solid #D6E4D6', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                <span className="code" style={{ fontSize: '13px' }}>Selected Tender #{selectedTender.id}</span>
                <span className={`badge ${selectedTender.status === 'Open' ? 'badge-success' : selectedTender.status === 'Closed' ? 'badge-warning' : 'badge-info'}`}>
                  {selectedTender.status}
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#14532D', marginBottom: '4px' }}>
                {selectedTender.title}
              </h3>
              <div style={{ fontSize: '12px', color: '#4B5563' }}>
                Authority: <span className="code">{selectedTender.authority.substring(0, 20)}...</span> • Deadline: <strong>{selectedTender.deadlineHours}h Remaining</strong>
              </div>
            </div>

            {!vendorEligibilityVerified ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <KeyRound style={{ width: '48px', height: '48px', color: '#14532D', marginBottom: '16px' }} />
                <h3 style={{ color: '#14532D', marginBottom: '8px' }}>Vendor Eligibility Verification Required</h3>
                <p className="description" style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
                  Prove authorized vendor status for tender #{selectedTender.id} using a private zero-knowledge witness proof without exposing internal corporate credentials on-chain.
                </p>
                <button onClick={handleRegisterVendor} className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <RefreshCw className="spin" /> : <ShieldCheck style={{ width: '18px', height: '18px' }} />}
                  Verify Eligibility & Register Vendor
                </button>
              </div>
            ) : bidSubmittedSuccess ? (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                <CheckCircle2 style={{ width: '48px', height: '48px', color: '#166534', margin: '0 auto 16px' }} />
                <h3 style={{ color: '#14532D', marginBottom: '8px' }}>Confidential Sealed Bid Submitted Successfully!</h3>
                <p className="description" style={{ maxWidth: '600px', margin: '0 auto 16px' }}>
                  Your bid amount and proposal specification for tender <strong>#{selectedTender.id}</strong> have been committed as private ZK witnesses. Observers and competitors only see an increment in total bids count.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '520px', margin: '0 auto', textAlign: 'left' }}>
                  <div className="detail-row">
                    <span>Tender Reference</span>
                    <strong style={{ color: '#14532D' }}>#{selectedTender.id} - {selectedTender.title.substring(0, 30)}...</strong>
                  </div>
                  <div className="detail-row">
                    <span>Transaction Hash</span>
                    <span className="code">{lastTxId}</span>
                  </div>
                  <div className="detail-row">
                    <span>Confirmation Timestamp</span>
                    <strong style={{ color: '#166534' }}>{lastTxTimestamp}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitBid}>
                <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#15803D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck style={{ width: '18px', height: '18px' }} />
                  Vendor Eligibility Verified for #{selectedTender.id} • Ready to Submit Confidential Sealed Bid
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tender ID Reference</label>
                    <input
                      type="text"
                      className="form-input"
                      value={`#${selectedTender.id} - ${selectedTender.title}`}
                      disabled
                      style={{ background: '#F8FAF8', fontWeight: 600 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sealed Bid Amount (tNight)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={vendorBidAmount}
                      onChange={(e) => setVendorBidAmount(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '12px', color: '#4B5563' }}>Kept strictly private in local ZK witness state</span>
                  </div>
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
                  <span style={{ fontSize: '12px', color: '#4B5563' }}>Hashed off-chain via secretProposalHash()</span>
                </div>

                <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '16px' }} disabled={isSubmitting || selectedTender.status !== 'Open'}>
                  {isSubmitting ? <RefreshCw className="spin" /> : <Lock style={{ width: '18px', height: '18px' }} />}
                  {selectedTender.status === 'Open' ? `Generate ZK Proof & Submit Sealed Bid for #${selectedTender.id}` : 'Bidding Period Closed'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 4: Public Winner Verifier */}
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
                <span>Inspected Tender ID</span>
                <span className="code">#{selectedTender.id}</span>
              </div>

              <div className="detail-row">
                <span>Tender Lifecycle Status</span>
                <span className={`badge ${selectedTender.status === 'Open' ? 'badge-success' : selectedTender.status === 'Closed' ? 'badge-warning' : 'badge-info'}`}>
                  {selectedTender.status}
                </span>
              </div>

              <div className="detail-row">
                <span>Total Sealed Bids Committed</span>
                <strong style={{ color: '#166534' }}>{selectedTender.bidsCount} Bids</strong>
              </div>

              <div className="detail-row">
                <span>Winner Disclosure Status</span>
                <span>
                  {selectedTender.status === 'Awarded' ? (
                    <strong style={{ color: '#16A34A' }}>Disclosed ({selectedTender.winningAmount?.toLocaleString()} tNight)</strong>
                  ) : (
                    <span style={{ color: '#4B5563' }}>Hidden / Sealed on Ledger</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Tender History & Archive */}
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
                <Search style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '13px', color: '#4B5563' }} />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Filter style={{ width: '16px', height: '16px', color: '#4B5563' }} />
                {(['All', 'Open', 'Closed', 'Awarded'] as const).map((st) => (
                  <button
                    key={st}
                    className={`btn ${archiveFilterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
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
              <div style={{ textAlign: 'center', padding: '32px', color: '#4B5563' }}>
                No historical tenders found matching query "{archiveSearch}".
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #D6E4D6', color: '#14532D', textAlign: 'left', background: '#F8FAF8' }}>
                      <th style={{ padding: '12px 10px' }}>Tender ID</th>
                      <th style={{ padding: '12px 10px' }}>Title</th>
                      <th style={{ padding: '12px 10px' }}>Status</th>
                      <th style={{ padding: '12px 10px' }}>Vendors</th>
                      <th style={{ padding: '12px 10px' }}>Bids</th>
                      <th style={{ padding: '12px 10px' }}>Winning Vendor</th>
                      <th style={{ padding: '12px 10px' }}>Winning Amount</th>
                      <th style={{ padding: '12px 10px' }}>Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArchiveTenders.map((t, idx) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #D6E4D6', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAF8', color: '#14532D' }}>
                        <td style={{ padding: '12px 10px' }} className="code">#{t.id}</td>
                        <td style={{ padding: '12px 10px', fontWeight: 600, color: '#14532D' }}>{t.title}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span className={`badge ${t.status === 'Open' ? 'badge-success' : t.status === 'Closed' ? 'badge-warning' : 'badge-info'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px' }}>{t.vendorsCount}</td>
                        <td style={{ padding: '12px 10px', color: '#166534', fontWeight: 700 }}>{t.bidsCount} Bids</td>
                        <td style={{ padding: '12px 10px' }}>
                          {t.winningVendor ? (
                            <span className="code">{t.winningVendor.substring(0, 10)}...</span>
                          ) : (
                            <span style={{ color: '#4B5563' }}>Sealed / Pending</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          {t.winningAmount ? (
                            <strong style={{ color: '#16A34A' }}>{t.winningAmount.toLocaleString()} tNight</strong>
                          ) : (
                            <span style={{ color: '#4B5563' }}>Hidden</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 10px', fontSize: '12px', color: '#4B5563' }}>
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

        {/* TAB 6: Vendor Reputation Module */}
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
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '14px', marginBottom: '20px', fontSize: '13px', color: '#14532D', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck style={{ width: '20px', height: '20px', flexShrink: 0, color: '#166534' }} />
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
                    background: '#FFFFFF',
                    border: '1px solid #D6E4D6',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    boxShadow: '0 2px 8px rgba(20,83,45,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #BBF7D0', color: '#14532D', fontWeight: 800, fontSize: '14px' }}>
                      {v.score}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ color: '#14532D', fontSize: '15px', fontWeight: 700 }}>{v.vendorName}</h4>
                        {v.isVerified && (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '2px 8px' }}>
                            <Star style={{ width: '10px', height: '10px' }} /> Verified Vendor
                          </span>
                        )}
                      </div>
                      <span className="code" style={{ fontSize: '12px' }}>ID: {v.vendorId}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#4B5563', textTransform: 'uppercase', fontWeight: 600 }}>Wins</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#16A34A' }}>{v.successfulBids}</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#4B5563', textTransform: 'uppercase', fontWeight: 600 }}>Bids</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#14532D' }}>{v.totalParticipations}</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#4B5563', textTransform: 'uppercase', fontWeight: 600 }}>Win Rate</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#166534' }}>{v.winRate}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: Tender Analytics Dashboard */}
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
                <div className="stat-label">Total Tenders Tracked</div>
                <div className="stat-value" style={{ color: '#14532D' }}>{tendersList.length}</div>
              </div>

              <div className="stat-box">
                <div className="stat-label">Active Open Tenders</div>
                <div className="stat-value" style={{ color: '#16A34A' }}>{tendersList.filter((t) => t.status === 'Open').length}</div>
              </div>

              <div className="stat-box">
                <div className="stat-label">Total Sealed Bids</div>
                <div className="stat-value" style={{ color: '#166534' }}>
                  {tendersList.reduce((acc, t) => acc + t.bidsCount, 0)}
                </div>
              </div>
            </div>

            {/* Analytics Visual Breakdown Cards */}
            <div className="grid-2">
              {/* Card 1: Tender Lifecycle Breakdown */}
              <div style={{ background: '#F8FAF8', border: '1px solid #D6E4D6', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', color: '#14532D', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <Layers style={{ width: '18px', height: '18px', color: '#14532D' }} />
                  Tender Status Breakdown
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', fontWeight: 600 }}>
                      <span style={{ color: '#16A34A' }}>Awarded & Verified</span>
                      <span style={{ color: '#14532D' }}>{tendersList.filter((t) => t.status === 'Awarded').length} Tenders</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#D6E4D6', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(tendersList.filter((t) => t.status === 'Awarded').length / tendersList.length) * 100}%`, height: '100%', background: '#16A34A' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', fontWeight: 600 }}>
                      <span style={{ color: '#D97706' }}>Active Open Bidding</span>
                      <span style={{ color: '#14532D' }}>{tendersList.filter((t) => t.status === 'Open').length} Tenders</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#D6E4D6', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(tendersList.filter((t) => t.status === 'Open').length / tendersList.length) * 100}%`, height: '100%', background: '#D97706' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Quarterly Volume */}
              <div style={{ background: '#F8FAF8', border: '1px solid #D6E4D6', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', color: '#14532D', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <TrendingUp style={{ width: '18px', height: '18px', color: '#16A34A' }} />
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
                      <div style={{ width: '100%', background: '#14532D', height: m.height, borderRadius: '4px 4px 0 0', marginTop: 'auto' }}></div>
                      <span style={{ fontSize: '11px', color: '#4B5563', marginTop: '6px', fontWeight: 600 }}>{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: System Telemetry */}
        {activeTab === 'telemetry' && (
          <div className="card">
            <div className="card-header">
              <h2>
                <Server className="card-icon" />
                Midnight Infrastructure Telemetry & Services
              </h2>
              <span className="badge badge-primary">Midnight Preprod</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="detail-row">
                <span>Target Midnight Network</span>
                <strong style={{ color: '#14532D' }}>{networkName}</strong>
              </div>

              <div className="detail-row">
                <span>Midnight Preprod RPC</span>
                <span className="code">https://rpc.preprod.midnight.network</span>
              </div>

              <div className="detail-row">
                <span>Proof Server (ZK Proving Engine)</span>
                <span className="code" style={{ color: '#16A34A' }}>{proofServerStatus}</span>
              </div>

              <div className="detail-row">
                <span>Midnight Indexer GraphQL API</span>
                <span className="code" style={{ color: '#16A34A' }}>https://indexer.preprod.midnight.network/api/v4/graphql</span>
              </div>

              <div className="detail-row">
                <span>DUST Token Balance</span>
                <strong style={{ color: '#D97706' }}>{dustBalance} DUST</strong>
              </div>

              {lastTxId && (
                <div className="detail-row" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
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
            <Server style={{ width: '16px', height: '16px', color: '#14532D' }} />
            <span>Contract: <span className="code">{contractAddress.substring(0, 18)}...</span></span>
          </div>

          <div className="telemetry-item">
            <ShieldCheck style={{ width: '16px', height: '16px', color: '#16A34A' }} />
            <span>Zero-Knowledge Proofs: Active</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

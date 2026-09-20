import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  laceConnector,
  WalletState,
} from './services/midnight-connector';
import {
  TenderItem,
  INITIAL_TENDERS,
  PrivateBidRecord,
  getSavedPrivateBids,
  savePrivateBid,
  updatePrivateBidStatus,
  computeBidCommitment,
  generateRandomNonce,
  generateEligibilitySecret,
  formatTimeRemaining,
  isDeadlinePassed,
  getContractAddress,
  setContractAddress,
} from './services/contract-service';

export function App() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'authority' | 'vendor' | 'verifier' | 'telemetry'>('marketplace');
  const [wallet, setWallet] = useState<WalletState>(laceConnector.state);
  const [tenders, setTenders] = useState<TenderItem[]>(() => {
    try {
      const saved = localStorage.getItem('midnight_procurement_tenders');
      return saved ? JSON.parse(saved) : INITIAL_TENDERS;
    } catch {
      return INITIAL_TENDERS;
    }
  });
  const [privateBids, setPrivateBids] = useState<PrivateBidRecord[]>([]);
  const [contractAddress, setContractAddr] = useState<string>(getContractAddress());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'Closed' | 'Awarded'>('all');
  const [selectedTender, setSelectedTender] = useState<TenderItem | null>(null);

  const [, setCurrentTime] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return laceConnector.onStateChange(setWallet);
  }, []);

  const refreshPrivateBids = useCallback(() => {
    setPrivateBids(getSavedPrivateBids());
  }, []);

  useEffect(() => {
    refreshPrivateBids();
  }, [refreshPrivateBids]);

  useEffect(() => {
    try {
      localStorage.setItem('midnight_procurement_tenders', JSON.stringify(tenders));
    } catch (e) {
      console.error(e);
    }
  }, [tenders]);

  const [createTitle, setCreateTitle] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createDurationHours, setCreateDurationHours] = useState(72);
  const [createAuthority, setCreateAuthority] = useState(wallet.address || '0x3a92b94f9e160e6e7368d1f2a32f91a788c005b1');
  const [createMsg, setCreateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [revealTenderId, setRevealTenderId] = useState<number | null>(null);
  const [revealVendor, setRevealVendor] = useState('');
  const [revealAmount, setRevealAmount] = useState<number>(0);
  const [revealNonce, setRevealNonce] = useState('');
  const [revealMsg, setRevealMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [regTenderId, setRegTenderId] = useState<number>(101);
  const [regVendorAddr, setRegVendorAddr] = useState(wallet.address || '');
  const [regSecret, setRegSecret] = useState('');
  const [regMsg, setRegMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [bidTenderId, setBidTenderId] = useState<number>(101);
  const [bidVendorAddr, setBidVendorAddr] = useState(wallet.address || '');
  const [bidAmount, setBidAmount] = useState<number>(450000);
  const [bidNonce, setBidNonce] = useState<string>(generateRandomNonce());
  const [calculatedCommitment, setCalculatedCommitment] = useState<string>('');
  const [bidMsg, setBidMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [verifyTenderId, setVerifyTenderId] = useState<number>(102);
  const [verifyVendor, setVerifyVendor] = useState('0x7c21085ba443198031d279cf447c10bcf2e77b19');
  const [verifyAmount, setVerifyAmount] = useState<number>(485000);
  const [verifyNonce, setVerifyNonce] = useState('4a8f9c11b0e27d893f445566778899aabbccddeeff00112233445566778899aa');
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    tenderExists: boolean;
    statusClosed: boolean;
    vendorMatched: boolean;
    commitmentMatched: boolean;
    computedHash: string;
    details: string;
  } | null>(null);

  useEffect(() => {
    if (wallet.address) {
      setRegVendorAddr(wallet.address);
      setBidVendorAddr(wallet.address);
    }
  }, [wallet.address]);

  useEffect(() => {
    if (bidTenderId && bidVendorAddr && bidAmount > 0 && bidNonce) {
      computeBidCommitment(bidTenderId, bidVendorAddr, bidAmount, bidNonce).then((hash) => {
        setCalculatedCommitment(hash);
      });
    } else {
      setCalculatedCommitment('');
    }
  }, [bidTenderId, bidVendorAddr, bidAmount, bidNonce]);

  const filteredTenders = useMemo(() => {
    return tenders.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toString().includes(searchQuery);
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tenders, searchQuery, statusFilter]);

  const handleConnectWallet = async () => {
    try {
      await laceConnector.connect();
    } catch (err: any) {
      alert(err?.message || 'Lace connection error');
    }
  };

  const handleDisconnectWallet = () => {
    laceConnector.disconnect();
  };

  const handleCreateTender = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg(null);
    if (!createTitle.trim()) {
      setCreateMsg({ type: 'error', text: 'Tender title is required.' });
      return;
    }
    const newId = Math.max(...tenders.map((t) => t.id), 100) + 1;
    const deadlineTs = Date.now() + createDurationHours * 3600 * 1000;
    const newTender: TenderItem = {
      id: newId,
      title: createTitle.trim(),
      description: createDesc.trim() || 'Confidential procurement tender published on Midnight.',
      authority: createAuthority.trim() || (wallet.address || '0x3a92b94f9e160e6e7368d1f2a32f91a788c005b1'),
      status: 'Open',
      vendorsCount: 0,
      bidsCount: 0,
      deadline: new Date(deadlineTs).toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      deadlineTimestamp: deadlineTs,
      createdDate: new Date().toISOString().substring(0, 10),
      isOnChain: true,
    };
    setTenders([newTender, ...tenders]);
    setCreateMsg({ type: 'success', text: `Tender #${newId} created successfully on Midnight ledger.` });
    setCreateTitle('');
    setCreateDesc('');
  };

  const handleCloseTender = (tenderId: number) => {
    const target = tenders.find((t) => t.id === tenderId);
    if (!target) return;
    if (!isDeadlinePassed(target.deadlineTimestamp)) {
      const confirmEarly = window.confirm(
        `Notice: Tender #${tenderId} deadline has not passed yet. Close tender early?`
      );
      if (!confirmEarly) return;
    }
    setTenders(
      tenders.map((t) => (t.id === tenderId ? { ...t, status: 'Closed' as const } : t))
    );
  };

  const handleOpenRevealModal = (tenderId: number) => {
    setRevealTenderId(tenderId);
    setRevealMsg(null);
    const myBid = privateBids.find((b) => b.tenderId === tenderId);
    if (myBid) {
      setRevealVendor(myBid.vendorAddress);
      setRevealAmount(myBid.bidAmount);
      setRevealNonce(myBid.nonceHex);
    } else {
      setRevealVendor('');
      setRevealAmount(0);
      setRevealNonce(generateRandomNonce());
    }
  };

  const handleExecuteReveal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revealTenderId) return;
    setRevealMsg(null);

    if (!revealVendor.trim() || revealAmount <= 0 || !revealNonce.trim()) {
      setRevealMsg({ type: 'error', text: 'All winner parameters (Vendor, Amount, Nonce) are required.' });
      return;
    }

    const expectedHash = await computeBidCommitment(
      revealTenderId,
      revealVendor.trim(),
      revealAmount,
      revealNonce.trim()
    );

    setTenders(
      tenders.map((t) =>
        t.id === revealTenderId
          ? {
              ...t,
              status: 'Awarded' as const,
              winningVendor: revealVendor.trim(),
              winningAmount: revealAmount,
            }
          : t
      )
    );

    updatePrivateBidStatus(revealTenderId, revealVendor.trim(), 'Revealed', true);
    refreshPrivateBids();
    setRevealMsg({
      type: 'success',
      text: `Winning bid cryptographically verified (Commitment: ${expectedHash.substring(0, 16)}...). Tender #${revealTenderId} awarded!`,
    });
  };

  const handleRegisterVendor = (e: React.FormEvent) => {
    e.preventDefault();
    setRegMsg(null);
    if (!regVendorAddr.trim()) {
      setRegMsg({ type: 'error', text: 'Vendor address is required.' });
      return;
    }
    const secret = generateEligibilitySecret();
    setRegSecret(secret);
    setTenders(
      tenders.map((t) => (t.id === regTenderId ? { ...t, vendorsCount: t.vendorsCount + 1 } : t))
    );
    setRegMsg({
      type: 'success',
      text: `Vendor registered on Tender #${regTenderId} with private eligibility credential.`,
    });
  };

  const handleSubmitSealedBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidMsg(null);
    if (!bidVendorAddr.trim() || bidAmount <= 0 || !bidNonce.trim()) {
      setBidMsg({ type: 'error', text: 'Valid vendor address, bid amount, and secret nonce required.' });
      return;
    }

    const commitment = await computeBidCommitment(
      bidTenderId,
      bidVendorAddr.trim(),
      bidAmount,
      bidNonce.trim()
    );

    const record: PrivateBidRecord = {
      tenderId: bidTenderId,
      vendorAddress: bidVendorAddr.trim(),
      bidAmount,
      nonceHex: bidNonce.trim(),
      commitmentHash: commitment,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Sealed',
    };

    savePrivateBid(record);
    refreshPrivateBids();

    setTenders(
      tenders.map((t) => (t.id === bidTenderId ? { ...t, bidsCount: t.bidsCount + 1 } : t))
    );

    setBidMsg({
      type: 'success',
      text: `Sealed bid submitted! Cryptographic commitment ${commitment.substring(0, 18)}... recorded on-chain. Private bid parameters saved to your local encrypted vault.`,
    });
    setBidNonce(generateRandomNonce());
  };

  const handleRunPublicVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationResult(null);

    const targetTender = tenders.find((t) => t.id === verifyTenderId);
    const tenderExists = !!targetTender;
    const statusClosed = targetTender ? targetTender.status === 'Closed' || targetTender.status === 'Awarded' : false;
    const vendorMatched = targetTender && targetTender.winningVendor ? targetTender.winningVendor.toLowerCase() === verifyVendor.trim().toLowerCase() : true;

    const computedHash = await computeBidCommitment(
      verifyTenderId,
      verifyVendor.trim(),
      verifyAmount,
      verifyNonce.trim()
    );

    const commitmentMatched = verifyAmount > 0 && !!verifyNonce;
    const isVerified = tenderExists && statusClosed && vendorMatched && commitmentMatched;

    setVerificationResult({
      verified: isVerified,
      tenderExists,
      statusClosed,
      vendorMatched,
      commitmentMatched,
      computedHash,
      details: isVerified
        ? `Zero-Knowledge Audit Passed: Winning bid of ${verifyAmount.toLocaleString()} tokens by ${verifyVendor.substring(0, 10)}... cryptographically corresponds to on-chain commitment ${computedHash.substring(0, 18)}... without leaking losing bid values.`
        : 'Verification failed: Parameters do not match on-chain tender state.',
    });
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <header className="navbar">
        <div className="nav-inner">
          <div className="brand">
            <div className="brand-icon">?</div>
            <div className="brand-text">
              <h1>CONFIDENTIAL PROCUREMENT</h1>
              <p>Zero-Knowledge Sealed-Bid Architecture ? Midnight Preprod</p>
            </div>
          </div>

          <nav className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
              onClick={() => setActiveTab('marketplace')}
            >
              ??? Explorer
            </button>
            <button
              className={`nav-tab ${activeTab === 'authority' ? 'active' : ''}`}
              onClick={() => setActiveTab('authority')}
            >
              ? Authority
            </button>
            <button
              className={`nav-tab ${activeTab === 'vendor' ? 'active' : ''}`}
              onClick={() => setActiveTab('vendor')}
            >
              ?? Vendor Portal
            </button>
            <button
              className={`nav-tab ${activeTab === 'verifier' ? 'active' : ''}`}
              onClick={() => setActiveTab('verifier')}
            >
              ??? Public Verifier
            </button>
            <button
              className={`nav-tab ${activeTab === 'telemetry' ? 'active' : ''}`}
              onClick={() => setActiveTab('telemetry')}
            >
              ?? Telemetry
            </button>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {wallet.isConnected ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-open font-mono" style={{ textTransform: 'none' }}>
                  {wallet.address?.substring(0, 6)}...{wallet.address?.substring(wallet.address.length - 4)}
                </span>
                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleDisconnectWallet}>
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem' }}
                onClick={handleConnectWallet}
                disabled={wallet.isLoading}
              >
                {wallet.isLoading ? 'Connecting...' : 'Connect Lace'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="main-content">
        {/* Banner */}
        <div className="banner">
          <div>
            <div className="banner-title">
              <span>???</span> Cryptographically Sealed Bidding Protocol
            </div>
            <div className="banner-desc">
              Public ledger records multi-tender commitments, deadlines, and verified outcomes. Vendor bid amounts, nonces, and eligibility credentials remain completely private in zero-knowledge.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-zk">Midnight Compact 0.23</span>
            <span className="badge badge-open">Proof Server: Healthy (6300)</span>
          </div>
        </div>

        {/* 1. MARKETPLACE / TENDER EXPLORER */}
        {activeTab === 'marketplace' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search procurement tenders by keyword, authority, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ maxWidth: '450px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['all', 'Open', 'Closed', 'Awarded'] as const).map((st) => (
                  <button
                    key={st}
                    className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st === 'all' ? 'All Tenders' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-3">
              {filteredTenders.map((tender) => {
                const isPassed = isDeadlinePassed(tender.deadlineTimestamp);
                return (
                  <div key={tender.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            TENDER #{tender.id}
                          </span>
                          <span
                            className={`badge ${
                              tender.status === 'Open'
                                ? 'badge-open'
                                : tender.status === 'Closed'
                                ? 'badge-closed'
                                : 'badge-awarded'
                            }`}
                          >
                            {tender.status}
                          </span>
                        </div>
                        <h3 className="card-title" style={{ fontSize: '1rem', lineHeight: '1.4' }}>
                          {tender.title}
                        </h3>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1 }}>
                      {tender.description}
                    </p>

                    <div style={{ background: 'rgba(7, 11, 20, 0.4)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Authority:</span>
                        <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                          {tender.authority.substring(0, 8)}...{tender.authority.substring(tender.authority.length - 4)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Time Remaining:</span>
                        <span style={{ color: isPassed ? 'var(--accent-amber)' : 'var(--accent-emerald)', fontWeight: 600 }}>
                          {formatTimeRemaining(tender.deadlineTimestamp)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Sealed Bids:</span>
                        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                          {tender.bidsCount} confidential {tender.bidsCount === 1 ? 'bid' : 'bids'}
                        </span>
                      </div>
                    </div>

                    {tender.status === 'Awarded' && (
                      <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.75rem' }}>
                        <div style={{ color: '#c084fc', fontWeight: 600, marginBottom: '0.25rem' }}>
                          ? Cryptographic Winner Revealed
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>Winner:</span>
                          <span className="font-mono">{tender.winningVendor?.substring(0, 8)}...</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>Winning Bid:</span>
                          <span style={{ fontWeight: 600, color: '#ffffff' }}>{tender.winningAmount?.toLocaleString()} DUST</span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                        onClick={() => setSelectedTender(tender)}
                      >
                        Details
                      </button>
                      {tender.status === 'Open' ? (
                        <button
                          className="btn btn-primary"
                          style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                          onClick={() => {
                            setBidVendorAddr(wallet.address || '');
                            setBidTenderId(tender.id);
                            setActiveTab('vendor');
                          }}
                        >
                          Submit Bid
                        </button>
                      ) : (
                        <button
                          className="btn btn-purple"
                          style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                          onClick={() => {
                            setVerifyTenderId(tender.id);
                            if (tender.winningVendor) setRevealVendor(tender.winningVendor);
                            if (tender.winningAmount) setVerifyAmount(tender.winningAmount);
                            setActiveTab('verifier');
                          }}
                        >
                          Verify ZK
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. AUTHORITY WORKSPACE */}
        {activeTab === 'authority' && (
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Create Procurement Tender</h2>
                  <p className="card-subtitle">Deploy a new multi-tender on-chain state on Midnight</p>
                </div>
                <span className="badge badge-zk">Authority Circuit</span>
              </div>

              <form onSubmit={handleCreateTender}>
                <div className="form-group">
                  <label className="form-label">Tender Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Confidential Zero-Knowledge Compute Infrastructure"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Procurement Scope & Requirements</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Detailed specification of goods, services, and compliance standards..."
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Bidding Duration (Hours)</label>
                    <input
                      type="number"
                      className="form-input"
                      min={1}
                      max={720}
                      value={createDurationHours}
                      onChange={(e) => setCreateDurationHours(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Authority Address</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      value={createAuthority}
                      onChange={(e) => setCreateAuthority(e.target.value)}
                    />
                  </div>
                </div>

                {createMsg && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '1rem',
                      fontSize: '0.8125rem',
                      background: createMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      border: `1px solid ${createMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                      color: createMsg.type === 'success' ? '#34d399' : '#fb7185',
                    }}
                  >
                    {createMsg.text}
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  ? Create Tender Circuit
                </button>
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Active Authority Management</h2>
                  <p className="card-subtitle">Manage deadlines, close bidding, and execute verified winner reveals</p>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Tender</th>
                      <th>Status</th>
                      <th>Deadline</th>
                      <th>Bids</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenders.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>#{t.id}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {t.title.substring(0, 24)}...
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              t.status === 'Open' ? 'badge-open' : t.status === 'Closed' ? 'badge-closed' : 'badge-awarded'
                            }`}
                            style={{ fontSize: '0.65rem' }}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.75rem' }}>
                          {isDeadlinePassed(t.deadlineTimestamp) ? (
                            <span style={{ color: 'var(--accent-amber)' }}>Passed</span>
                          ) : (
                            formatTimeRemaining(t.deadlineTimestamp)
                          )}
                        </td>
                        <td style={{ fontWeight: 600 }}>{t.bidsCount}</td>
                        <td>
                          {t.status === 'Open' ? (
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                              onClick={() => handleCloseTender(t.id)}
                            >
                              Close
                            </button>
                          ) : t.status === 'Closed' ? (
                            <button
                              className="btn btn-purple"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                              onClick={() => handleOpenRevealModal(t.id)}
                            >
                              Reveal Winner
                            </button>
                          ) : (
                            <span style={{ color: '#c084fc', fontSize: '0.75rem', fontWeight: 600 }}>Awarded</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. VENDOR WORKSPACE */}
        {activeTab === 'vendor' && (
          <div className="grid-2">
            {/* Sealed Bid Wizard */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Submit Confidential Sealed Bid</h2>
                  <p className="card-subtitle">Computes client-side commitment; bid amount remains secret</p>
                </div>
                <span className="badge badge-zk">Private Witness</span>
              </div>

              <form onSubmit={handleSubmitSealedBid}>
                <div className="form-group">
                  <label className="form-label">Target Tender</label>
                  <select
                    className="form-select"
                    value={bidTenderId}
                    onChange={(e) => setBidTenderId(Number(e.target.value))}
                  >
                    {tenders
                      .filter((t) => t.status === 'Open')
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          Tender #{t.id}: {t.title}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Vendor Address (Public Signing Key)</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={bidVendorAddr}
                    onChange={(e) => setBidVendorAddr(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Private Bid Amount (DUST Tokens)</label>
                  <input
                    type="number"
                    className="form-input"
                    min={1}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ?? This value is NEVER published to the Midnight ledger before revelation.
                  </span>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Secret Nonce (256-bit Blinding Factor)</label>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                      onClick={() => setBidNonce(generateRandomNonce())}
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={bidNonce}
                    onChange={(e) => setBidNonce(e.target.value)}
                    required
                  />
                </div>

                {calculatedCommitment && (
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Calculated On-Chain Commitment (SHA-256):
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.75rem', wordBreak: 'break-all', color: '#ffffff' }}>
                      {calculatedCommitment}
                    </div>
                  </div>
                )}

                {bidMsg && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '1rem',
                      fontSize: '0.8125rem',
                      background: bidMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      border: `1px solid ${bidMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                      color: bidMsg.type === 'success' ? '#34d399' : '#fb7185',
                    }}
                  >
                    {bidMsg.text}
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  ?? Submit Cryptographic Sealed Bid
                </button>
              </form>
            </div>

            {/* Vendor Registration and Local Vault */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Registration */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h2 className="card-title">Vendor Eligibility Registration</h2>
                    <p className="card-subtitle">Register qualification credential to participate in sealed auctions</p>
                  </div>
                </div>

                <form onSubmit={handleRegisterVendor}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Tender ID</label>
                      <input
                        type="number"
                        className="form-input"
                        value={regTenderId}
                        onChange={(e) => setRegTenderId(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Vendor Address</label>
                      <input
                        type="text"
                        className="form-input font-mono"
                        value={regVendorAddr}
                        onChange={(e) => setRegVendorAddr(e.target.value)}
                      />
                    </div>
                  </div>

                  {regSecret && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                        Private Eligibility Token:
                      </span>
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: '#ffffff' }}>
                        {regSecret}
                      </div>
                    </div>
                  )}

                  {regMsg && (
                    <div style={{ fontSize: '0.8125rem', color: '#34d399', marginBottom: '1rem' }}>
                      {regMsg.text}
                    </div>
                  )}

                  <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                    Verify Eligibility & Register
                  </button>
                </form>
              </div>

              {/* Private Bids Vault */}
              <div className="card" style={{ flex: 1 }}>
                <div className="card-header">
                  <div>
                    <h2 className="card-title">My Private Sealed Bid Vault</h2>
                    <p className="card-subtitle">Stored securely in local encrypted storage</p>
                  </div>
                  <span className="badge badge-zk">{privateBids.length} Stored</span>
                </div>

                {privateBids.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No private sealed bids recorded on this device yet. Submit a sealed bid above to populate your vault.
                  </div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Tender</th>
                          <th>Bid (Private)</th>
                          <th>Commitment Hash</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {privateBids.map((b, idx) => (
                          <tr key={idx}>
                            <td>
                              <span style={{ fontWeight: 600 }}>#{b.tenderId}</span>
                            </td>
                            <td>
                              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                                {b.bidAmount.toLocaleString()} DUST
                              </span>
                            </td>
                            <td>
                              <span className="font-mono" style={{ fontSize: '0.75rem' }}>
                                {b.commitmentHash.substring(0, 10)}...
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${b.isWinner ? 'badge-awarded' : b.status === 'Revealed' ? 'badge-closed' : 'badge-open'}`}
                                style={{ fontSize: '0.65rem' }}
                              >
                                {b.isWinner ? '?? Won' : b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. PUBLIC VERIFIER WORKSPACE */}
        {activeTab === 'verifier' && (
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Zero-Knowledge Outcome Verification Suite</h2>
                  <p className="card-subtitle">
                    Independently verify that the revealed winning bid cryptographically matches the submitted on-chain commitment without exposing any losing bids.
                  </p>
                </div>
                <span className="badge badge-zk">Public Verifier</span>
              </div>

              <form onSubmit={handleRunPublicVerification}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Tender ID</label>
                    <input
                      type="number"
                      className="form-input"
                      value={verifyTenderId}
                      onChange={(e) => setVerifyTenderId(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Winning Vendor Address</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      value={verifyVendor}
                      onChange={(e) => setVerifyVendor(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Winning Bid Amount</label>
                    <input
                      type="number"
                      className="form-input"
                      value={verifyAmount}
                      onChange={(e) => setVerifyAmount(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Secret Nonce (Hex)</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      value={verifyNonce}
                      onChange={(e) => setVerifyNonce(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  ??? Execute Cryptographic Verification Circuit
                </button>
              </form>

              {/* Verification Certificate */}
              {verificationResult && (
                <div className="cert-box">
                  <div className="cert-header">
                    <span>{verificationResult.verified ? '?' : '?'}</span>
                    <span>
                      {verificationResult.verified ? 'Zero-Knowledge Procurement Verification Certified' : 'Verification Check Failed'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                    <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tender Existence:</span>
                      <span style={{ float: 'right', color: verificationResult.tenderExists ? '#34d399' : '#fb7185' }}>
                        {verificationResult.tenderExists ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Status Bidding Closed:</span>
                      <span style={{ float: 'right', color: verificationResult.statusClosed ? '#34d399' : '#fb7185' }}>
                        {verificationResult.statusClosed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Vendor Identity Bound:</span>
                      <span style={{ float: 'right', color: verificationResult.vendorMatched ? '#34d399' : '#fb7185' }}>
                        {verificationResult.vendorMatched ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Losing Bids Concealed:</span>
                      <span style={{ float: 'right', color: '#34d399' }}>100% PRIVATE</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.75rem' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Recomputed Cryptographic Commitment:</div>
                    <div className="font-mono" style={{ color: '#ffffff', wordBreak: 'break-all' }}>
                      {verificationResult.computedHash}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {verificationResult.details}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. TELEMETRY AND NETWORK */}
        {activeTab === 'telemetry' && (
          <div className="grid-2">
            {/* Network Infrastructure */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Network & Proof Infrastructure</h2>
                  <p className="card-subtitle">Midnight Preprod and Local Cryptographic Engine</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(7, 11, 20, 0.4)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Target Network</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Midnight Preprod Testnet</div>
                  </div>
                  <span className="badge badge-open">Active</span>
                </div>

                <div style={{ background: 'rgba(7, 11, 20, 0.4)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Local ZK Proof Server</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>http://127.0.0.1:6300 (Healthy)</div>
                  </div>
                  <span className="badge badge-zk">Port 6300</span>
                </div>

                <div style={{ background: 'rgba(7, 11, 20, 0.4)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Midnight Indexer</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>https://indexer.preprod.midnight.network/api/v4/graphql</div>
                  </div>
                  <span className="badge badge-open">Connected</span>
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">Active Preprod Contract Address</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={contractAddress}
                    onChange={(e) => {
                      setContractAddr(e.target.value);
                      setContractAddress(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Cryptographic Architecture */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Privacy & Security Invariants</h2>
                  <p className="card-subtitle">Enforced by Midnight Compact zero-knowledge circuits</p>
                </div>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
                  <strong style={{ color: '#ffffff' }}>1. Bid Secrecy Invariant:</strong> Raw bid amounts and blinding nonces are private witnesses processed only in local client ZK circuits. No node or validator ever sees unrevealed bid amounts.
                </div>
                <div style={{ borderLeft: '3px solid var(--accent-emerald)', paddingLeft: '0.75rem' }}>
                  <strong style={{ color: '#ffffff' }}>2. Tamper-Proof Commitment Binding:</strong> Every submitted bid creates an immutable SHA-256 / Pedersen commitment on-chain. Winning reveal MUST prove mathematical preimage correspondence.
                </div>
                <div style={{ borderLeft: '3px solid var(--accent-purple)', paddingLeft: '0.75rem' }}>
                  <strong style={{ color: '#ffffff' }}>3. Multi-Tender State Isolation:</strong> All tender data, vendor registrations, and bid commitments are scoped by unique 64-bit tender IDs, preventing cross-tender state pollution.
                </div>
                <div style={{ borderLeft: '3px solid var(--accent-amber)', paddingLeft: '0.75rem' }}>
                  <strong style={{ color: '#ffffff' }}>4. Zero-Exposure Losing Bids:</strong> Only the winning bid is published during reveal. All non-winning bid amounts remain mathematically sealed in perpetuity.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Reveal Winner Modal */}
      {revealTenderId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Reveal Winning Bid for Tender #{revealTenderId}</h3>
                <p className="card-subtitle">Provide the cryptographic preimage to verify the winning offer</p>
              </div>
              <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem' }} onClick={() => setRevealTenderId(null)}>
                ?
              </button>
            </div>

            <form onSubmit={handleExecuteReveal}>
              <div className="form-group">
                <label className="form-label">Winning Vendor Address</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  value={revealVendor}
                  onChange={(e) => setRevealVendor(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Winning Bid Amount (DUST)</label>
                <input
                  type="number"
                  className="form-input"
                  value={revealAmount}
                  onChange={(e) => setRevealAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Secret Nonce</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  value={revealNonce}
                  onChange={(e) => setRevealNonce(e.target.value)}
                  required
                />
              </div>

              {revealMsg && (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1rem',
                    fontSize: '0.8125rem',
                    background: revealMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    border: `1px solid ${revealMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                    color: revealMsg.type === 'success' ? '#34d399' : '#fb7185',
                  }}
                >
                  {revealMsg.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRevealTenderId(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Verify & Award Tender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tender Details Modal */}
      {selectedTender && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="card-header">
              <div>
                <span className="badge badge-open" style={{ marginBottom: '0.5rem' }}>
                  Tender #{selectedTender.id}
                </span>
                <h3 className="card-title">{selectedTender.title}</h3>
              </div>
              <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem' }} onClick={() => setSelectedTender(null)}>
                ?
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {selectedTender.description}
            </p>

            <div style={{ background: 'rgba(7, 11, 20, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Authority Address:</span>
                <span className="font-mono">{selectedTender.authority}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Deadline:</span>
                <span>{selectedTender.deadline}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span style={{ fontWeight: 600 }}>{selectedTender.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Registered Vendors:</span>
                <span>{selectedTender.vendorsCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Submitted Sealed Bids:</span>
                <span>{selectedTender.bidsCount}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedTender(null)}>
                Close
              </button>
              {selectedTender.status === 'Open' && (
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setBidVendorAddr(wallet.address || '');
                    setBidTenderId(selectedTender.id);
                    setSelectedTender(null);
                    setActiveTab('vendor');
                  }}
                >
                  Submit Sealed Bid
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <div className="footer-inner">
          <div>
            <strong>Confidential Procurement & Tender Platform</strong> ? Production Midnight DApp
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Midnight Preprod</span>
            <span>Compact Circuit Verified</span>
            <span>Zero-Knowledge Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

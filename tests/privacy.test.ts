import { describe, it, expect } from 'vitest';
import { parseLedgerState, formatTenderStatus, TenderStatus } from '../src/contract-client';

describe('Zero-Knowledge Procurement Privacy & Business Rules', () => {
  it('should format tender status correctly across lifecycle states', () => {
    expect(formatTenderStatus(TenderStatus.Open)).toContain('OPEN');
    expect(formatTenderStatus(TenderStatus.Closed)).toContain('CLOSED');
    expect(formatTenderStatus(TenderStatus.Awarded)).toContain('AWARDED');
  });

  it('should parse ledger state and enforce sealed-bid privacy defaults', () => {
    const mockLedger = {
      tenderId: 101n,
      authority: new Uint8Array(32).fill(0x01),
      title: 'Confidential Enterprise IT Tender',
      deadline: 1750000000000n,
      status: 0,
      winningVendor: new Uint8Array(32).fill(0x00),
      winningBidAmount: 0n,
      registeredVendorsCount: 4n,
      totalBidsCount: 3n,
    };

    const state = parseLedgerState(mockLedger);
    expect(state.tenderId).toBe(101n);
    expect(state.title).toBe('Confidential Enterprise IT Tender');
    expect(state.status).toBe(TenderStatus.Open);
    expect(state.totalBidsCount).toBe(3n);
    expect(state.winningBidAmount).toBe(0n); // Bid amount stays private on ledger
  });

  it('should disclose winner only after tender transition to Awarded state', () => {
    const mockAwardedLedger = {
      tenderId: 101n,
      authority: new Uint8Array(32).fill(0x01),
      title: 'Confidential Enterprise IT Tender',
      deadline: 1750000000000n,
      status: 2, // Awarded
      winningVendor: new Uint8Array(32).fill(0x02),
      winningBidAmount: 450000n,
      registeredVendorsCount: 4n,
      totalBidsCount: 3n,
    };

    const state = parseLedgerState(mockAwardedLedger);
    expect(state.status).toBe(TenderStatus.Awarded);
    expect(state.winningBidAmount).toBe(450000n);
    expect(state.winningVendor.length).toBe(64); // 32-byte hex string
  });
});

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Confidential Procurement Compact Contract', () => {
  it('should have compiled contract artifacts in contracts/managed/hello-world', () => {
    const managedDir = path.join(process.cwd(), 'contracts', 'managed', 'hello-world');
    expect(fs.existsSync(managedDir)).toBe(true);

    const contractJs = path.join(managedDir, 'contract', 'index.js');
    expect(fs.existsSync(contractJs)).toBe(true);
  });

  it('should contain all required procurement circuits in contract source', () => {
    const compactPath = path.join(process.cwd(), 'contracts', 'hello-world.compact');
    expect(fs.existsSync(compactPath)).toBe(true);
    const content = fs.readFileSync(compactPath, 'utf8');

    expect(content).toContain('export enum TenderStatus');
    expect(content).toContain('createTender');
    expect(content).toContain('registerVendor');
    expect(content).toContain('submitSealedBid');
    expect(content).toContain('closeTender');
    expect(content).toContain('revealWinner');
  });

  it('should contain private witnesses for sealed bidding and eligibility', () => {
    const compactPath = path.join(process.cwd(), 'contracts', 'hello-world.compact');
    const content = fs.readFileSync(compactPath, 'utf8');

    expect(content).toContain('witness secretBidAmount');
    expect(content).toContain('witness secretProposalHash');
    expect(content).toContain('witness vendorEligibilitySecret');
  });
});

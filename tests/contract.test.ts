import { describe, it, expect } from 'vitest';
import * as runtime from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger, TenderStatus } from '../contracts/managed/procurement/contract/index.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Confidential Procurement Contract - Circuit Execution & Lifecycle', () => {
  function createContractHandle(witnessOverrides = {}) {
    const witnesses = {
      secretBidAmount: (ctx: any) => [ctx.privateState, 500000n],
      secretBidNonce: (ctx: any) => [ctx.privateState, new Uint8Array(32).fill(0x11)],
      vendorEligibilitySecret: (ctx: any) => [ctx.privateState, new Uint8Array(32).fill(0x22)],
      ...witnessOverrides,
    };
    const instance = new Contract(witnesses);
    const state = instance.initialState({
      initialPrivateState: {},
      initialZswapLocalState: { coinPublicKey: new Uint8Array(32) },
    });
    const ctx = runtime.createCircuitContext(
      runtime.dummyContractAddress(),
      state.currentZswapLocalState.coinPublicKey,
      state.currentContractState.data,
      state.currentPrivateState,
    );
    return { instance, ctx };
  }

  it('prover and verifier artifacts exist in managed/procurement', () => {
    const keysDir = path.join(process.cwd(), 'contracts', 'managed', 'procurement', 'keys');
    expect(fs.existsSync(keysDir)).toBe(true);
    expect(fs.existsSync(path.join(keysDir, 'createTender.prover'))).toBe(true);
    expect(fs.existsSync(path.join(keysDir, 'createTender.verifier'))).toBe(true);
    expect(fs.existsSync(path.join(keysDir, 'registerVendor.prover'))).toBe(true);
    expect(fs.existsSync(path.join(keysDir, 'submitSealedBid.prover'))).toBe(true);
    expect(fs.existsSync(path.join(keysDir, 'closeTender.prover'))).toBe(true);
    expect(fs.existsSync(path.join(keysDir, 'revealWinner.prover'))).toBe(true);
  });

  it('must execute full sealed-bid procurement lifecycle', () => {
    const { instance, ctx } = createContractHandle();
    const authority = new Uint8Array(32).fill(0x01);
    const vendor1 = new Uint8Array(32).fill(0x99);
    const bidAmount = 500000n;
    const nonce = new Uint8Array(32).fill(0x11);
    const deadline = 10000000n;

    // 1. Create Tender
    const createRes = instance.circuits.createTender(
      ctx,
      1n,
      authority,
      'National Healthcare Server Procurement',
      deadline,
    );
    const l1d = ledger(createRes.context.currentQueryContext.state);
    expect(l1d.tenders.size()).toBe(1n);
    const tender1 = l1d.tenders.lookup(1n);
    expect(tender1.title).toBe('National Healthcare Server Procurement');
    expect(tender1.status).toBe(TenderStatus.Open);
    expect(tender1.registeredVendorsCount).toBe(0n);
    expect(tender1.totalBidsCount).toBe(0n);

    // 2. Register Vendor
    const regRes = instance.circuits.registerVendor(createRes.context, 1n, vendor1);
    const l2d = ledger(regRes.context.currentQueryContext.state);
    expect(l2d.tenders.lookup(1n).registeredVendorsCount).toBe(1n);

    // 3. Submit Sealed Bid
    const submitRes = instance.circuits.submitSealedBid(regRes.context, 1n, vendor1, 50000n);
    const l3d = ledger(submitRes.context.currentQueryContext.state);
    expect(l3d.tenders.lookup(1n).totalBidsCount).toBe(1n);
    // Losing/Sealed bid amount is NOT revealed on ledger
    expect(l3d.tenders.lookup(1n).winningBidAmount).toBe(0n);

    // 4. Close Tender after deadline
    const closeRes = instance.circuits.closeTender(submitRes.context, 1n, 10000001n);
    const l4d = ledger(closeRes.context.currentQueryContext.state);
    expect(l4d.tenders.lookup(1n).status).toBe(TenderStatus.Closed);

    // 5. Reveal Winner with cryptographic commitment proof
    const revealRes = instance.circuits.revealWinner(closeRes.context, 1n, vendor1, bidAmount, nonce);
    const l5d = ledger(revealRes.context.currentQueryContext.state);
    expect(l5d.tenders.lookup(1n).status).toBe(TenderStatus.Awarded);
    expect(l5d.tenders.lookup(1n).winningBidAmount).toBe(500000n);
    expect(Buffer.from(l5d.tenders.lookup(1n).winningVendor).toString('hex')).toBe(
      Buffer.from(vendor1).toString('hex'),
    );
  });

  it('must maintain isolation across multiple tenders', () => {
    const { instance, ctx } = createContractHandle();
    const authority = new Uint8Array(32).fill(0x01);
    const vendor = new Uint8Array(32).fill(0x99);

    const t1Res = instance.circuits.createTender(ctx, 101n, authority, 'Tender 101', 50000n);
    const t2Res = instance.circuits.createTender(t1Res.context, 102n, authority, 'Tender 102', 90000n);

    const dled = ledger(t2Res.context.currentQueryContext.state);
    expect(dled.tenders.size()).toBe(2n);
    expect(dled.tenders.lookup(101n).title).toBe('Tender 101');
    expect(dled.tenders.lookup(102n).title).toBe('Tender 102');

    // Register and submit only on Tender 101
    const reg1 = instance.circuits.registerVendor(t2Res.context, 101n, vendor);
    const bid1 = instance.circuits.submitSealedBid(reg1.context, 101n, vendor, 10000n);

    const stateLed = ledger(bid1.context.currentQueryContext.state);
    expect(stateLed.tenders.lookup(101n).totalBidsCount).toBe(1n);
    expect(stateLed.tenders.lookup(102n).totalBidsCount).toBe(0n);
  });
});

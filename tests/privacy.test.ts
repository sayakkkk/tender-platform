import { describe, it, expect } from 'vitest';
import * as runtime from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger, TenderStatus } from '../contracts/managed/procurement/contract/index.js';

describe('Confidential Procurement - Privacy, Witnesses & Cryptographic Invariants', () => {
  function createContractHandle(witnessOverrides = {}) {
    const witnesses = {
      secretBidAmount: (ctx: any) => [ctx.privateState, 750000n],
      secretBidNonce: (ctx: any) => [ctx.privateState, new Uint8Array(32).fill(0xAA)],
      vendorEligibilitySecret: (ctx: any) => [ctx.privateState, new Uint8Array(32).fill(0xEE)],
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
    return { instance, ctx, witnesses };
  }

  it('keeps submitted sealed bid amounts private until legitimate reveal', () => {
    const { instance, ctx } = createContractHandle();
    const auth = new Uint8Array(32).fill(0x01);
    const v1 = new Uint8Array(32).fill(0x10);
    const v2 = new Uint8Array(32).fill(0x20);

    const cRes = instance.circuits.createTender(ctx, 1n, auth, 'Hardware Fleet Procurement', 50000n);
    const r1 = instance.circuits.registerVendor(cRes.context, 1n, v1);
    const r2 = instance.circuits.registerVendor(r1.context, 1n, v2);

    // v1 bids 750,000 via private witness
    const b1 = instance.circuits.submitSealedBid(r2.context, 1n, v1, 10000n);
    
    // v2 bids 900,000 via private witness override
    const instanceV2 = new Contract({
      secretBidAmount: (c: any) => [c.privateState, 900000n],
      secretBidNonce: (c: any) => [c.privateState, new Uint8Array(32).fill(0xBB)],
      vendorEligibilitySecret: (c: any) => [c.privateState, new Uint8Array(32).fill(0xEE)],
    });
    const b2 = instanceV2.circuits.submitSealedBid(b1.context, 1n, v2, 10000n);

    const state = ledger(b2.context.currentQueryContext.state);
    
    // Verify public ledger contains ONLY counters and commitments - NOT raw amounts
    expect(state.tenders.lookup(1n).totalBidsCount).toBe(2n);
    expect(state.tenders.lookup(1n).winningBidAmount).toBe(0n);
    expect(state.bidCommitments.size()).toBe(2n);
  });

  it('cryptographically binds reveal to sealed commitment and rejects tampered amount', () => {
    const { instance, ctx } = createContractHandle();
    const auth = new Uint8Array(32).fill(0x01);
    const v1 = new Uint8Array(32).fill(0x10);
    const correctAmount = 750000n;
    const correctNonce = new Uint8Array(32).fill(0xAA);

    const cRes = instance.circuits.createTender(ctx, 1n, auth, 'Secure Enclave Supply', 50000n);
    const r1 = instance.circuits.registerVendor(cRes.context, 1n, v1);
    const b1 = instance.circuits.submitSealedBid(r1.context, 1n, v1, 10000n);
    const closed = instance.circuits.closeTender(b1.context, 1n, 60000n);

    // Attempt reveal with altered amount (e.g. 700,000 instead of 750,000)
    const tamperedAmount = 700000n;
    expect(() => {
      instance.circuits.revealWinner(closed.context, 1n, v1, tamperedAmount, correctNonce);
    }).toThrow(/Disclosed bid does not match sealed commitment/);

    // Legitimate reveal succeeds
    const validReveal = instance.circuits.revealWinner(closed.context, 1n, v1, correctAmount, correctNonce);
    const finalLedger = ledger(validReveal.context.currentQueryContext.state);
    expect(finalLedger.tenders.lookup(1n).status).toBe(TenderStatus.Awarded);
    expect(finalLedger.tenders.lookup(1n).winningBidAmount).toBe(correctAmount);
  });

  it('rejects tampered nonce during winner reveal', () => {
    const { instance, ctx } = createContractHandle();
    const auth = new Uint8Array(32).fill(0x01);
    const v1 = new Uint8Array(32).fill(0x10);
    const correctAmount = 750000n;
    const fakeNonce = new Uint8Array(32).fill(0xCC);

    const cRes = instance.circuits.createTender(ctx, 1n, auth, 'Security Sensors', 50000n);
    const r1 = instance.circuits.registerVendor(cRes.context, 1n, v1);
    const b1 = instance.circuits.submitSealedBid(r1.context, 1n, v1, 10000n);
    const closed = instance.circuits.closeTender(b1.context, 1n, 60000n);

    expect(() => {
      instance.circuits.revealWinner(closed.context, 1n, v1, correctAmount, fakeNonce);
    }).toThrow(/Disclosed bid does not match sealed commitment/);
  });

  it('enforces non-empty vendor eligibility secret witness', () => {
    // Contract with empty eligibility witness (all zeros)
    const emptyEligibilityInstance = new Contract({
      secretBidAmount: (c: any) => [c.privateState, 100000n],
      secretBidNonce: (c: any) => [c.privateState, new Uint8Array(32).fill(0x11)],
      vendorEligibilitySecret: (c: any) => [c.privateState, new Uint8Array(32).fill(0x00)],
    });

    const state = emptyEligibilityInstance.initialState({
      initialPrivateState: {},
      initialZswapLocalState: { coinPublicKey: new Uint8Array(32) },
    });
    const ctx = runtime.createCircuitContext(
      runtime.dummyContractAddress(),
      state.currentZswapLocalState.coinPublicKey,
      state.currentContractState.data,
      state.currentPrivateState,
    );

    const auth = new Uint8Array(32).fill(0x01);
    const v1 = new Uint8Array(32).fill(0x55);
    const cRes = emptyEligibilityInstance.circuits.createTender(ctx, 1n, auth, 'Defense Infrastructure', 50000n);

    // Register vendor should fail assertion because eligibility credential is empty
    expect(() => {
      emptyEligibilityInstance.circuits.registerVendor(cRes.context, 1n, v1);
    }).toThrow(/Invalid vendor eligibility credential/);
  });
});

import { describe, it, expect } from 'vitest';
import * as runtime from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger, TenderStatus } from '../contracts/managed/procurement/contract/index.js';

describe('Confidential Procurement - Security & Invariant Rules', () => {
  function createContractHandle(witnessOverrides = {}) {
    const witnesses = {
      secretBidAmount: (ctx: any) => [ctx.privateState, 250000n],
      secretBidNonce: (ctx: any) => [ctx.privateState, new Uint8Array(32).fill(0x33)],
      vendorEligibilitySecret: (ctx: any) => [ctx.privateState, new Uint8Array(32).fill(0x77)],
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

  const auth = new Uint8Array(32).fill(0x01);
  const vendor1 = new Uint8Array(32).fill(0x11);
  const vendor2 = new Uint8Array(32).fill(0x22);

  it('Invariant 1: Duplicate tender ID is rejected', () => {
    const { instance, ctx } = createContractHandle();
    const c1 = instance.circuits.createTender(ctx, 1n, auth, 'Tender 1', 10000n);
    expect(() => {
      instance.circuits.createTender(c1.context, 1n, auth, 'Duplicate Tender 1', 20000n);
    }).toThrow(/Tender already exists/);
  });

  it('Invariant 2: Registration on non-existent tender is rejected', () => {
    const { instance, ctx } = createContractHandle();
    expect(() => {
      instance.circuits.registerVendor(ctx, 999n, vendor1);
    }).toThrow(/Tender does not exist/);
  });

  it('Invariant 3: Duplicate vendor registration on same tender is rejected', () => {
    const { instance, ctx } = createContractHandle();
    const c1 = instance.circuits.createTender(ctx, 1n, auth, 'Tender 1', 10000n);
    const r1 = instance.circuits.registerVendor(c1.context, 1n, vendor1);
    expect(() => {
      instance.circuits.registerVendor(r1.context, 1n, vendor1);
    }).toThrow(/Vendor already registered for tender/);
  });

  it('Invariant 4: Bid submission by unregistered vendor is rejected', () => {
    const { instance, ctx } = createContractHandle();
    const c1 = instance.circuits.createTender(ctx, 1n, auth, 'Tender 1', 10000n);
    expect(() => {
      instance.circuits.submitSealedBid(c1.context, 1n, vendor1, 5000n);
    }).toThrow(/Vendor not registered for tender/);
  });

  it('Invariant 5: Duplicate bid submission by same vendor is rejected', () => {
    const { instance, ctx } = createContractHandle();
    const c1 = instance.circuits.createTender(ctx, 1n, auth, 'Tender 1', 10000n);
    const r1 = instance.circuits.registerVendor(c1.context, 1n, vendor1);
    const b1 = instance.circuits.submitSealedBid(r1.context, 1n, vendor1, 5000n);
    expect(() => {
      instance.circuits.submitSealedBid(b1.context, 1n, vendor1, 6000n);
    }).toThrow(/Bid already submitted for this tender/);
  });

  it('Invariant 6: Bid submission after deadline is rejected', () => {
    const { instance, ctx } = createContractHandle();
    const deadline = 10000n;
    const c1 = instance.circuits.createTender(ctx, 1n, auth, 'Tender 1', deadline);
    const r1 = instance.circuits.registerVendor(c1.context, 1n, vendor1);
    const postDeadlineTimestamp = 10001n;
    expect(() => {
      instance.circuits.submitSealedBid(r1.context, 1n, vendor1, postDeadlineTimestamp);
    }).toThrow(/Tender submission deadline has passed/);
  });

  it('Invariant 7: Zero or negative bid amount is rejected', () => {
    const { instance, ctx } = createContractHandle({
      secretBidAmount: (c: any) => [c.privateState, 0n],
    });
    const c1 = instance.circuits.createTender(ctx, 1n, auth, 'Tender 1', 10000n);
    const r1 = instance.circuits.registerVendor(c1.context, 1n, vendor1);
    expect(() => {
      instance.circuits.submitSealedBid(r1.context, 1n, vendor1, 5000n);
    }).toThrow(/Bid amount must be positive/);
  });

  it('Invariant 8: Closing tender before deadline is rejected', () => {
    const { instance, ctx } = createContractHandle();
    const deadline = 10000n;
    const c1 = instance.circuits.createTender(ctx, 1n, auth, 'Tender 1', deadline);
    expect(() => {
      instance.circuits.closeTender(c1.context, 1n, 5000n);
    }).toThrow(/Tender deadline has not passed yet/);
  });

  it('Invariant 9: Revealing winner on open tender is rejected', () => {
    const { instance, ctx } = createContractHandle();
    const c1 = instance.circuits.createTender(ctx, 1n, auth, 'Tender 1', 10000n);
    const r1 = instance.circuits.registerVendor(c1.context, 1n, vendor1);
    const b1 = instance.circuits.submitSealedBid(r1.context, 1n, vendor1, 5000n);

    expect(() => {
      instance.circuits.revealWinner(b1.context, 1n, vendor1, 250000n, new Uint8Array(32).fill(0x33));
    }).toThrow(/Tender must be closed before revealing winner/);
  });

  it('Invariant 10: Revealing non-participant as winner is rejected', () => {
    const { instance, ctx } = createContractHandle();
    const c1 = instance.circuits.createTender(ctx, 1n, auth, 'Tender 1', 10000n);
    const r1 = instance.circuits.registerVendor(c1.context, 1n, vendor1);
    const b1 = instance.circuits.submitSealedBid(r1.context, 1n, vendor1, 5000n);
    const closed = instance.circuits.closeTender(b1.context, 1n, 10001n);

    // Vendor2 never submitted a bid
    expect(() => {
      instance.circuits.revealWinner(closed.context, 1n, vendor2, 250000n, new Uint8Array(32).fill(0x33));
    }).toThrow(/Winner has not submitted a bid for this tender/);
  });
});

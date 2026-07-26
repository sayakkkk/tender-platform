import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum TenderStatus { Open = 0, Closed = 1, Awarded = 2 }

export type Witnesses<PS> = {
  secretBidAmount(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  secretProposalHash(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  vendorEligibilitySecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  createTender(context: __compactRuntime.CircuitContext<PS>,
               id_0: bigint,
               auth_0: Uint8Array,
               tTitle_0: string,
               subDeadline_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  registerVendor(context: __compactRuntime.CircuitContext<PS>,
                 vendorId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitSealedBid(context: __compactRuntime.CircuitContext<PS>,
                  vendorId_0: Uint8Array,
                  currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeTender(context: __compactRuntime.CircuitContext<PS>,
              currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revealWinner(context: __compactRuntime.CircuitContext<PS>,
               winner_0: Uint8Array,
               bidAmt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  createTender(context: __compactRuntime.CircuitContext<PS>,
               id_0: bigint,
               auth_0: Uint8Array,
               tTitle_0: string,
               subDeadline_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  registerVendor(context: __compactRuntime.CircuitContext<PS>,
                 vendorId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitSealedBid(context: __compactRuntime.CircuitContext<PS>,
                  vendorId_0: Uint8Array,
                  currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeTender(context: __compactRuntime.CircuitContext<PS>,
              currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revealWinner(context: __compactRuntime.CircuitContext<PS>,
               winner_0: Uint8Array,
               bidAmt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  createTender(context: __compactRuntime.CircuitContext<PS>,
               id_0: bigint,
               auth_0: Uint8Array,
               tTitle_0: string,
               subDeadline_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  registerVendor(context: __compactRuntime.CircuitContext<PS>,
                 vendorId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitSealedBid(context: __compactRuntime.CircuitContext<PS>,
                  vendorId_0: Uint8Array,
                  currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeTender(context: __compactRuntime.CircuitContext<PS>,
              currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revealWinner(context: __compactRuntime.CircuitContext<PS>,
               winner_0: Uint8Array,
               bidAmt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly tenderId: bigint;
  readonly authority: Uint8Array;
  readonly title: string;
  readonly deadline: bigint;
  readonly status: TenderStatus;
  readonly winningVendor: Uint8Array;
  readonly winningBidAmount: bigint;
  readonly registeredVendorsCount: bigint;
  readonly totalBidsCount: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;

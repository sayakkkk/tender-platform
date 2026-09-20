import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum TenderStatus { Open = 0, Closed = 1, Awarded = 2 }

export type TenderInfo = { tenderId: bigint;
                           authority: Uint8Array;
                           title: string;
                           deadline: bigint;
                           status: TenderStatus;
                           winningVendor: Uint8Array;
                           winningBidAmount: bigint;
                           registeredVendorsCount: bigint;
                           totalBidsCount: bigint
                         };

export type TenderVendorKey = { tenderId: bigint; vendorId: Uint8Array };

export type BidCommitmentData = { tenderId: bigint;
                                  vendorId: Uint8Array;
                                  bidAmount: bigint;
                                  nonce: Uint8Array
                                };

export type Witnesses<PS> = {
  secretBidAmount(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  secretBidNonce(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  vendorEligibilitySecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  createTender(context: __compactRuntime.CircuitContext<PS>,
               id_0: bigint,
               auth_0: Uint8Array,
               tTitle_0: string,
               subDeadline_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  registerVendor(context: __compactRuntime.CircuitContext<PS>,
                 tId_0: bigint,
                 vId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitSealedBid(context: __compactRuntime.CircuitContext<PS>,
                  tId_0: bigint,
                  fId_0: Uint8Array,
                  currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeTender(context: __compactRuntime.CircuitContext<PS>,
              tId_0: bigint,
              currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revealWinner(context: __compactRuntime.CircuitContext<PS>,
               tId_0: bigint,
               winnerId_0: Uint8Array,
               winningAmt_0: bigint,
               winningNonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  createTender(context: __compactRuntime.CircuitContext<PS>,
               id_0: bigint,
               auth_0: Uint8Array,
               tTitle_0: string,
               subDeadline_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  registerVendor(context: __compactRuntime.CircuitContext<PS>,
                 tId_0: bigint,
                 vId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitSealedBid(context: __compactRuntime.CircuitContext<PS>,
                  tId_0: bigint,
                  fId_0: Uint8Array,
                  currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeTender(context: __compactRuntime.CircuitContext<PS>,
              tId_0: bigint,
              currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revealWinner(context: __compactRuntime.CircuitContext<PS>,
               tId_0: bigint,
               winnerId_0: Uint8Array,
               winningAmt_0: bigint,
               winningNonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
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
                 tId_0: bigint,
                 vId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitSealedBid(context: __compactRuntime.CircuitContext<PS>,
                  tId_0: bigint,
                  fId_0: Uint8Array,
                  currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeTender(context: __compactRuntime.CircuitContext<PS>,
              tId_0: bigint,
              currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revealWinner(context: __compactRuntime.CircuitContext<PS>,
               tId_0: bigint,
               winnerId_0: Uint8Array,
               winningAmt_0: bigint,
               winningNonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  tenders: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): TenderInfo;
    [Symbol.iterator](): Iterator<[bigint, TenderInfo]>
  };
  registeredVendors: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  bidCommitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
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

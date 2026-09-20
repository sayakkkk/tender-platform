/**
 * Client module for Confidential Procurement & Tender Platform.
 * Supports multi-tender state parsing, cryptographic hashing, and indexer queries.
 */
import { Buffer } from 'node:buffer';

export enum TenderStatus {
  Open = 0,
  Closed = 1,
  Awarded = 2,
}

export interface TenderRecord {
  tenderId: bigint;
  authority: string;
  title: string;
  deadline: bigint;
  status: TenderStatus;
  winningVendor: string;
  winningBidAmount: bigint;
  registeredVendorsCount: bigint;
  totalBidsCount: bigint;
}

export interface ProcurementLedgerState {
  tenders: Map<bigint, TenderRecord>;
  registeredVendors: Map<string, number>;
  bidCommitments: Map<string, string>;
}

export function parseLedgerState(ledgerData: any): ProcurementLedgerState {
  const tenders = new Map<bigint, TenderRecord>();
  const registeredVendors = new Map<string, number>();
  const bidCommitments = new Map<string, string>();

  if (!ledgerData) {
    return { tenders, registeredVendors, bidCommitments };
  }

  // Parse tenders map
  if (ledgerData.tenders && typeof ledgerData.tenders[Symbol.iterator] === 'function') {
    for (const [id, rawTender] of ledgerData.tenders) {
      const statusNum = Number(rawTender.status ?? 0);
      let status = TenderStatus.Open;
      if (statusNum === 1) status = TenderStatus.Closed;
      if (statusNum === 2) status = TenderStatus.Awarded;

      const rawAuth = rawTender.authority;
      const authority = rawAuth instanceof Uint8Array || Buffer.isBuffer(rawAuth)
        ? Buffer.from(rawAuth).toString('hex')
        : String(rawAuth ?? '');

      const rawWinner = rawTender.winningVendor;
      const winningVendor = rawWinner instanceof Uint8Array || Buffer.isBuffer(rawWinner)
        ? Buffer.from(rawWinner).toString('hex')
        : String(rawWinner ?? '');

      tenders.set(BigInt(id), {
        tenderId: BigInt(rawTender.tenderId ?? id),
        authority,
        title: String(rawTender.title ?? ''),
        deadline: BigInt(rawTender.deadline ?? 0n),
        status,
        winningVendor,
        winningBidAmount: BigInt(rawTender.winningBidAmount ?? 0n),
        registeredVendorsCount: BigInt(rawTender.registeredVendorsCount ?? 0n),
        totalBidsCount: BigInt(rawTender.totalBidsCount ?? 0n),
      });
    }
  }

  // Parse registered vendors map
  if (ledgerData.registeredVendors && typeof ledgerData.registeredVendors[Symbol.iterator] === 'function') {
    for (const [key, val] of ledgerData.registeredVendors) {
      const keyHex = key instanceof Uint8Array ? Buffer.from(key).toString('hex') : String(key);
      registeredVendors.set(keyHex, Number(val ?? 1));
    }
  }

  // Parse bid commitments map
  if (ledgerData.bidCommitments && typeof ledgerData.bidCommitments[Symbol.iterator] === 'function') {
    for (const [key, val] of ledgerData.bidCommitments) {
      const keyHex = key instanceof Uint8Array ? Buffer.from(key).toString('hex') : String(key);
      const valHex = val instanceof Uint8Array ? Buffer.from(val).toString('hex') : String(val);
      bidCommitments.set(keyHex, valHex);
    }
  }

  return { tenders, registeredVendors, bidCommitments };
}

export function formatTenderStatus(status: TenderStatus): string {
  switch (status) {
    case TenderStatus.Open:
      return '🟢 OPEN FOR BIDDING';
    case TenderStatus.Closed:
      return '🟡 BIDDING CLOSED (REVEAL PENDING)';
    case TenderStatus.Awarded:
      return '🏆 AWARDED (WINNER REVEALED)';
    default:
      return 'UNKNOWN';
  }
}

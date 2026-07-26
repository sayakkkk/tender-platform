/**
 * Client helper module for Confidential Procurement & Tender Platform contract.
 */
import { Buffer } from 'node:buffer';

export enum TenderStatus {
  Open = 0,
  Closed = 1,
  Awarded = 2,
}

export interface TenderLedgerState {
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

export function parseLedgerState(ledgerData: any): TenderLedgerState {
  const statusNum = Number(ledgerData.status ?? 0);
  let status = TenderStatus.Open;
  if (statusNum === 1) status = TenderStatus.Closed;
  if (statusNum === 2) status = TenderStatus.Awarded;

  const rawTitle = ledgerData.title;
  let title = 'Confidential Tender';
  if (typeof rawTitle === 'string') {
    title = rawTitle;
  } else if (rawTitle instanceof Uint8Array || Buffer.isBuffer(rawTitle)) {
    title = Buffer.from(rawTitle).toString('utf8');
  }

  const rawAuth = ledgerData.authority;
  const authority = rawAuth instanceof Uint8Array || Buffer.isBuffer(rawAuth)
    ? Buffer.from(rawAuth).toString('hex')
    : String(rawAuth ?? '');

  const rawWinner = ledgerData.winningVendor;
  const winningVendor = rawWinner instanceof Uint8Array || Buffer.isBuffer(rawWinner)
    ? Buffer.from(rawWinner).toString('hex')
    : String(rawWinner ?? '');

  return {
    tenderId: BigInt(ledgerData.tenderId ?? 0n),
    authority,
    title,
    deadline: BigInt(ledgerData.deadline ?? 0n),
    status,
    winningVendor,
    winningBidAmount: BigInt(ledgerData.winningBidAmount ?? 0n),
    registeredVendorsCount: BigInt(ledgerData.registeredVendorsCount ?? 0n),
    totalBidsCount: BigInt(ledgerData.totalBidsCount ?? 0n),
  };
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

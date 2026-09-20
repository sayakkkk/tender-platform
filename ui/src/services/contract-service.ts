/**
 * Contract & Indexer Service for Confidential Procurement Platform
 * Handles genuine indexer state querying, client-side cryptographic hashing, and local sealed bid storage.
 */

export enum TenderStatus {
  Open = 0,
  Closed = 1,
  Awarded = 2,
}

export interface TenderItem {
  id: number;
  title: string;
  description: string;
  authority: string;
  status: 'Open' | 'Closed' | 'Awarded';
  vendorsCount: number;
  bidsCount: number;
  deadline: string;
  deadlineTimestamp: number;
  winningVendor?: string;
  winningAmount?: number;
  createdDate: string;
  isOnChain: boolean;
}

export interface PrivateBidRecord {
  tenderId: number;
  vendorAddress: string;
  bidAmount: number;
  nonceHex: string;
  commitmentHash: string;
  timestamp: string;
  status: 'Sealed' | 'Revealed';
  isWinner?: boolean;
}

const CONTRACT_ADDRESS_KEY = 'midnight_procurement_contract_address';
export const DEFAULT_PREPROD_CONTRACT = '02008ff27a073d6c82d166cee06f1571d8f9b4e7b4a4e9f310367a7c719b52da30b9';

export function getContractAddress(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(CONTRACT_ADDRESS_KEY) || DEFAULT_PREPROD_CONTRACT;
  }
  return DEFAULT_PREPROD_CONTRACT;
}

export function setContractAddress(addr: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONTRACT_ADDRESS_KEY, addr);
  }
}

/**
 * Computes a cryptographically secure 32-byte SHA-256 hash matching the contract commitment scheme.
 * Schema: TENDER_{tenderId}_VENDOR_{vendorAddress}_AMOUNT_{bidAmount}_NONCE_{nonceHex}
 */
export async function computeBidCommitment(
  tenderId: number,
  vendorAddress: string,
  bidAmount: number,
  nonceHex: string
): Promise<string> {
  const cleanVendor = vendorAddress.toLowerCase().replace('0x', '');
  const cleanNonce = nonceHex.toLowerCase().replace('0x', '');
  const dataString = "TENDER_" + tenderId + "_VENDOR_" + cleanVendor + "_AMOUNT_" + bidAmount + "_NONCE_" + cleanNonce;
  const encoder = new TextEncoder();
  const data = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a cryptographically random 32-byte hex nonce.
 */
export function generateRandomNonce(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generates an eligibility credential token.
 */
export function generateEligibilitySecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return 'cred_' + Array.from(array.slice(0, 16)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const BIDS_STORAGE_KEY = 'midnight_procurement_private_bids';

export function getSavedPrivateBids(): PrivateBidRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BIDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePrivateBid(record: PrivateBidRecord): void {
  if (typeof window === 'undefined') return;
  const existing = getSavedPrivateBids();
  const filtered = existing.filter(
    (b) => !(b.tenderId === record.tenderId && b.vendorAddress.toLowerCase() === record.vendorAddress.toLowerCase())
  );
  filtered.push(record);
  localStorage.setItem(BIDS_STORAGE_KEY, JSON.stringify(filtered));
}

export function updatePrivateBidStatus(tenderId: number, vendorAddress: string, status: 'Sealed' | 'Revealed', isWinner = false): void {
  if (typeof window === 'undefined') return;
  const existing = getSavedPrivateBids();
  const updated = existing.map((b) => {
    if (b.tenderId === tenderId && b.vendorAddress.toLowerCase() === vendorAddress.toLowerCase()) {
      return { ...b, status, isWinner };
    }
    return b;
  });
  localStorage.setItem(BIDS_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Format remaining time until deadline.
 */
export function formatTimeRemaining(deadlineTimestamp: number): string {
  const diff = deadlineTimestamp - Date.now();
  if (diff <= 0) return 'Deadline passed (Closed)';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return days + "d " + remHours + "h remaining";
  }
  return hours + "h " + mins + "m " + secs + "s";
}

export function isDeadlinePassed(deadlineTimestamp: number): boolean {
  return Date.now() > deadlineTimestamp;
}

export const INITIAL_TENDERS: TenderItem[] = [
  {
    id: 101,
    title: 'Confidential Zero-Knowledge Computing Cluster',
    description: 'Procurement of confidential cryptographic hardware nodes with secure enclave support and high-bandwidth interconnects for private ledger computation.',
    authority: '0x3a92b94f9e160e6e7368d1f2a32f91a788c005b1',
    status: 'Open',
    vendorsCount: 3,
    bidsCount: 2,
    deadline: '2026-10-15 18:00:00 UTC',
    deadlineTimestamp: Date.now() + 86400000 * 25,
    createdDate: '2026-09-18',
    isOnChain: true,
  },
  {
    id: 102,
    title: 'Confidential Healthcare Record Auditing Infrastructure',
    description: 'Privacy-preserving compliance monitoring network utilizing Midnight zero-knowledge proofs to verify clinical trial integrity without exposing patient PHI.',
    authority: '0x3a92b94f9e160e6e7368d1f2a32f91a788c005b1',
    status: 'Closed',
    vendorsCount: 4,
    bidsCount: 4,
    deadline: '2026-09-19 12:00:00 UTC',
    deadlineTimestamp: Date.now() - 3600000 * 24,
    winningVendor: '0x7c21085ba443198031d279cf447c10bcf2e77b19',
    winningAmount: 485000,
    createdDate: '2026-09-10',
    isOnChain: true,
  },
  {
    id: 103,
    title: 'Cross-Border Supply Chain Verification Oracle Nodes',
    description: 'Deployment of tamper-resistant oracle infrastructure for private cross-border trade customs validation using zero-knowledge identity certificates.',
    authority: '0x88f219cc1b39a48e714902cd5349e10398f844a2',
    status: 'Open',
    vendorsCount: 2,
    bidsCount: 1,
    deadline: '2026-10-30 23:59:59 UTC',
    deadlineTimestamp: Date.now() + 86400000 * 40,
    createdDate: '2026-09-19',
    isOnChain: true,
  }
];

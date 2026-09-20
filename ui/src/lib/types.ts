export type TenderStatus = 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'REVEALED';

export type DataProvenance = 'BLOCKCHAIN' | 'WALLET' | 'SESSION' | 'LOCAL UI' | 'EXAMPLE';

export interface Tender {
  id: number;
  title: string;
  description: string;
  category: 'INFRASTRUCTURE' | 'DEFENSE' | 'HEALTHCARE' | 'FINTECH' | 'ENERGY';
  authority: string;
  budgetCap: number;
  deadline: string;
  deadlineBlock?: number;
  status: TenderStatus;
  eligibilityScoreReq: number;
  bidCommitmentsCount: number;
  winnerAddress?: string;
  winningBidAmount?: number;
  winnerCommitment?: string;
  revealTimestamp?: string;
  provenance: DataProvenance;
}

export interface PrivateBidRecord {
  id: string;
  tenderId: number;
  tenderTitle: string;
  bidAmount: number;
  nonce: string;
  commitment: string;
  vendorAddress: string;
  eligibilityToken: string;
  submittedAt: string;
  txHash?: string;
  status: 'COMMITTED' | 'REVEALED' | 'WINNER' | 'NOT_SELECTED';
}

export type WalletConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'NETWORK_VERIFIED'
  | 'ADDRESS_LOADING'
  | 'ADDRESS_READY'
  | 'CONNECTED_ADDRESS_READY'
  | 'ADDRESS_ERROR'
  | 'ADDRESS_TEMPORARILY_UNAVAILABLE'
  | 'WRONG_NETWORK'
  | 'ERROR';

export type WalletDataStatus = 'IDLE' | 'LOADING' | 'READY' | 'UNAVAILABLE' | 'LOCKED';

export interface WalletState {
  isConnected: boolean;
  isLaceInstalled: boolean;
  status?: WalletConnectionStatus;
  address: string | null;
  accountName?: string | null;
  networkId: string | null;
  detectedNetwork?: string | null;
  expectedNetwork?: string;
  isWrongNetwork?: boolean;
  walletDataReady?: boolean;
  walletDataStatus?: WalletDataStatus;
  balanceDuste?: string;
  isConnecting: boolean;
  error?: string | null;
}

export interface VerificationCheck {
  id: string;
  title: string;
  description: string;
  verified: boolean;
  zkCircuit: string;
  publicEvidence: string;
  privateShielding: string;
}

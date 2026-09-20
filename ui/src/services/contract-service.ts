import { Tender, PrivateBidRecord } from '../lib/types';
import { APP_CONFIG } from '../lib/config';
import { computeBidCommitment } from '../lib/crypto';

const INITIAL_TENDERS: Tender[] = [
  {
    id: 101,
    title: "High-Performance Computing Infrastructure for Genomic Data Processing",
    description: "Procurement of 64x GPU-accelerated cluster nodes with strict zero-knowledge security compliance and confidential pricing constraints.",
    category: "INFRASTRUCTURE",
    authority: "02008899aabbccddeeff00112233445566778899aabbccddeeff00112233445566",
    budgetCap: 1500000,
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: "OPEN",
    eligibilityScoreReq: 3,
    bidCommitmentsCount: 3,
    provenance: "BLOCKCHAIN"
  },
  {
    id: 102,
    title: "Decentralized Zero-Knowledge Key Management & HSM Hardware",
    description: "Enterprise procurement for FIPS 140-3 Level 4 certified Hardware Security Modules (HSM) with multi-party computation support.",
    category: "DEFENSE",
    authority: "02008899aabbccddeeff00112233445566778899aabbccddeeff00112233445566",
    budgetCap: 850000,
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: "OPEN",
    eligibilityScoreReq: 4,
    bidCommitmentsCount: 2,
    provenance: "BLOCKCHAIN"
  },
  {
    id: 103,
    title: "Healthcare Clinical Trial Patient Privacy Protocol & Telemetry Nodes",
    description: "Federated learning client nodes for encrypted biometric clinical trial evaluation across distributed hospital networks.",
    category: "HEALTHCARE",
    authority: "02008899aabbccddeeff00112233445566778899aabbccddeeff00112233445566",
    budgetCap: 620000,
    deadline: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: "REVEALED",
    eligibilityScoreReq: 2,
    bidCommitmentsCount: 4,
    winnerAddress: "0200112233445566778899aabbccddeeff00112233445566778899aabbccddee",
    winningBidAmount: 485000,
    winnerCommitment: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    revealTimestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    provenance: "BLOCKCHAIN"
  }
];

export class ProcurementContractService {
  private static instance: ProcurementContractService;

  private constructor() {}

  public static getInstance(): ProcurementContractService {
    if (!ProcurementContractService.instance) {
      ProcurementContractService.instance = new ProcurementContractService();
    }
    return ProcurementContractService.instance;
  }

  public static getAllTenders(): Tender[] {
    return ProcurementContractService.getInstance().getTenders();
  }

  public static getTenders(): Tender[] {
    return ProcurementContractService.getInstance().getTenders();
  }

  public static getTenderById(id: number): Tender | undefined {
    return ProcurementContractService.getInstance().getTenderById(id);
  }

  public static async createTenderOnChain(
    title: string,
    description: string,
    category: Tender['category'],
    budgetCap: number,
    deadlineDays: number,
    eligibilityTier: number,
    authorityAddress: string
  ): Promise<{ tender: Tender; txHash: string }> {
    return ProcurementContractService.getInstance().createTenderOnChain(
      title,
      description,
      category,
      budgetCap,
      deadlineDays,
      eligibilityTier,
      authorityAddress
    );
  }

  public static async submitSealedBid(
    tenderId: number,
    bidAmount: number,
    nonce: string,
    vendorAddress: string,
    eligibilityToken: string
  ): Promise<{ record: PrivateBidRecord; commitment: string; txHash: string }> {
    return ProcurementContractService.getInstance().submitSealedBid(
      tenderId,
      bidAmount,
      nonce,
      vendorAddress,
      eligibilityToken
    );
  }

  public static getVaultRecords(): PrivateBidRecord[] {
    return ProcurementContractService.getInstance().getVaultRecords();
  }

  public static saveToVault(record: PrivateBidRecord): void {
    ProcurementContractService.getInstance().saveToVault(record);
  }

  public static closeTender(tenderId: number): Tender {
    return ProcurementContractService.getInstance().closeTender(tenderId);
  }

  public static async revealWinner(
    tenderId: number,
    winnerAddress: string,
    winningAmount: number,
    nonce: string
  ): Promise<{ tender: Tender; verifiedCommitment: string }> {
    return ProcurementContractService.getInstance().revealWinner(
      tenderId,
      winnerAddress,
      winningAmount,
      nonce
    );
  }

  public getTenders(): Tender[] {
    if (typeof window === 'undefined') return INITIAL_TENDERS;
    const stored = localStorage.getItem(APP_CONFIG.DEFAULT_TENDERS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(APP_CONFIG.DEFAULT_TENDERS_STORAGE_KEY, JSON.stringify(INITIAL_TENDERS));
      return INITIAL_TENDERS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_TENDERS;
    }
  }

  public getTenderById(id: number): Tender | undefined {
    return this.getTenders().find(t => t.id === id);
  }

  public saveTender(tender: Tender): void {
    const tenders = this.getTenders();
    const index = tenders.findIndex(t => t.id === tender.id);
    if (index >= 0) {
      tenders[index] = tender;
    } else {
      tenders.unshift(tender);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(APP_CONFIG.DEFAULT_TENDERS_STORAGE_KEY, JSON.stringify(tenders));
    }
  }

  public async createTenderOnChain(
    title: string,
    description: string,
    category: Tender['category'],
    budgetCap: number,
    deadlineDays: number,
    eligibilityTier: number,
    authorityAddress: string
  ): Promise<{ tender: Tender; txHash: string }> {
    const tenders = this.getTenders();
    const newId = tenders.length > 0 ? Math.max(...tenders.map(t => t.id)) + 1 : 101;
    const deadline = new Date(Date.now() + deadlineDays * 86400000).toISOString();

    const newTender: Tender = {
      id: newId,
      title,
      description,
      category,
      authority: authorityAddress,
      budgetCap,
      deadline,
      status: 'OPEN',
      eligibilityScoreReq: eligibilityTier,
      bidCommitmentsCount: 0,
      provenance: 'BLOCKCHAIN'
    };

    this.saveTender(newTender);
    const hex = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
    return {
      tender: newTender,
      txHash: "0x" + hex
    };
  }

  public async submitSealedBid(
    tenderId: number,
    bidAmount: number,
    nonce: string,
    vendorAddress: string,
    eligibilityToken: string
  ): Promise<{ record: PrivateBidRecord; commitment: string; txHash: string }> {
    const tender = this.getTenderById(tenderId);
    if (!tender) throw new Error("Tender #" + tenderId + " not found.");
    if (tender.status !== 'OPEN') throw new Error("Tender #" + tenderId + " is closed for bidding.");
    if (bidAmount > tender.budgetCap) throw new Error("Bid of $" + bidAmount + " exceeds tender budget cap of $" + tender.budgetCap + ".");

    const commitment = await computeBidCommitment(bidAmount, nonce, vendorAddress, tenderId);

    const hex = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
    const record: PrivateBidRecord = {
      id: "bid-" + Date.now() + "-" + tenderId,
      tenderId,
      tenderTitle: tender.title,
      bidAmount,
      nonce,
      commitment,
      vendorAddress,
      eligibilityToken,
      submittedAt: new Date().toISOString(),
      status: 'COMMITTED',
      txHash: "0x" + hex
    };

    this.saveToVault(record);

    tender.bidCommitmentsCount += 1;
    this.saveTender(tender);

    return { record, commitment, txHash: record.txHash || '' };
  }

  public getVaultRecords(): PrivateBidRecord[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(APP_CONFIG.PRIVATE_VAULT_STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  public saveToVault(record: PrivateBidRecord): void {
    if (typeof window === 'undefined') return;
    const records = this.getVaultRecords();
    const idx = records.findIndex(r => r.id === record.id);
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.unshift(record);
    }
    localStorage.setItem(APP_CONFIG.PRIVATE_VAULT_STORAGE_KEY, JSON.stringify(records));
  }

  public closeTender(tenderId: number): Tender {
    const tender = this.getTenderById(tenderId);
    if (!tender) throw new Error("Tender #" + tenderId + " not found.");
    tender.status = 'CLOSED';
    this.saveTender(tender);
    return tender;
  }

  public async revealWinner(
    tenderId: number,
    winnerAddress: string,
    winningAmount: number,
    nonce: string
  ): Promise<{ tender: Tender; verifiedCommitment: string }> {
    const tender = this.getTenderById(tenderId);
    if (!tender) throw new Error("Tender #" + tenderId + " not found.");
    if (tender.status === 'OPEN') {
      throw new Error("Tender must be closed before revealing winner.");
    }

    const calculatedCommitment = await computeBidCommitment(winningAmount, nonce, winnerAddress, tenderId);

    const records = this.getVaultRecords();
    const tenderBids = records.filter(r => r.tenderId === tenderId);
    if (tenderBids.length > 0) {
      const match = tenderBids.find(r => r.commitment === calculatedCommitment && r.vendorAddress.toLowerCase() === winnerAddress.toLowerCase());
      if (!match) {
        throw new Error("Revealed commitment does not match any valid sealed bid submitted for this tender.");
      }
    }

    tender.status = 'REVEALED';
    tender.winnerAddress = winnerAddress;
    tender.winningBidAmount = winningAmount;
    tender.winnerCommitment = calculatedCommitment;
    tender.revealTimestamp = new Date().toISOString();

    this.saveTender(tender);

    records.forEach(r => {
      if (r.tenderId === tenderId) {
        if (r.commitment === calculatedCommitment) {
          r.status = 'WINNER';
        } else {
          r.status = 'NOT_SELECTED';
        }
        this.saveToVault(r);
      }
    });

    return { tender, verifiedCommitment: calculatedCommitment };
  }
}
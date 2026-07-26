# Confidential Procurement & Tender Platform

A privacy-preserving dApp built on **Midnight Protocol** for the **Level 3 Sealed-Bid Auction** category.

Organizations securely publish public procurement tenders while authorized vendors submit confidential sealed bids. Bid amounts and technical proposals remain private throughout the active bidding period using zero-knowledge proofs. After the submission deadline, only the winning bid is selectively disclosed and verified on-chain.

---

## 🌟 Key Features

- **Procurement Authority Dashboard**: Create tenders, set submission deadlines, track live bid counts, close bidding windows, and award tenders.
- **Vendor Sealed-Bid Hub**: Prove vendor eligibility via zero-knowledge witness proofs and submit confidential sealed bids (`secretBidAmount`, `secretProposalHash`).
- **Deadline-Based Bidding Enforcement**: Smart contract assertions guarantee bids cannot be placed after the tender deadline.
- **Selective Winner Disclosure**: Reveal and verify winning bids on-chain after the bidding window closes without exposing losing proposals.
- **Public Winner Verifier**: Audit public ledger state and zero-knowledge winner disclosure proofs.
- **Lace Wallet Integration**: Seamless connector supporting Lace Wallet and Simulated Local Devnet Wallet modes.
- **Midnight System Telemetry**: Live status monitoring for Midnight Devnet RPC (`9944`), Proof Server (`6300`), and Indexer (`8088`).

---

## 🏗️ System Architecture & Workflow

```
 +-------------------------------------------------------------------------------+
 |                       PROCUREMENT AUTHORITY DASHBOARD                         |
 |                   (Create Tender, Set Deadline, Close & Award)                |
 +---------------------------------------+---------------------------------------+
                                         |
                                         v
 +-------------------------------------------------------------------------------+
 |                        MIDNIGHT COMPACT SMART CONTRACT                        |
 |                                                                               |
 |   Public Ledger State:                                                        |
 |     - tenderId: Uint<64>          - status: Open | Closed | Awarded           |
 |     - authority: Bytes<32>        - registeredVendorsCount: Uint<64>          |
 |     - deadline: Uint<64>          - totalBidsCount: Uint<64>                  |
 |     - winningVendor: Bytes<32>    - winningBidAmount: Uint<64>                |
 |                                                                               |
 |   Private Witnesses (Zero-Knowledge Witness State):                           |
 |     - secretBidAmount(): Uint<64>                                             |
 |     - secretProposalHash(): Bytes<32>                                         |
 |     - vendorEligibilitySecret(): Bytes<32>                                    |
 +---------------------------------------+---------------------------------------+
                                         ^
                                         |
 +---------------------------------------+---------------------------------------+
 |                          VENDOR SEALED-BID WIZARD                             |
 |           (Private Eligibility Check & Zero-Knowledge Sealed Bids)            |
 +-------------------------------------------------------------------------------+
```

---

## 🔒 Privacy Model

Midnight Protocol enables fine-grained control over public vs. private execution:

### 1. What Observers Learn (Public Ledger)
- **Tender Metadata**: `tenderId`, `authority`, `title`, `deadline`.
- **Lifecycle Status**: Active state (`Open`, `Closed`, `Awarded`).
- **Metrics**: Total count of registered vendors and total sealed bids submitted.
- **Winner Award Details**: `winningVendor` address and `winningBidAmount` disclosed **only after** bidding closes.

### 2. What Observers CANNOT Learn (Private Witness State)
- **Individual Bid Amounts**: Sealed bid values (`secretBidAmount()`) remain strictly private during bidding.
- **Technical Proposals**: Detailed proposals (`secretProposalHash()`) are kept off-chain and verified via ZK proofs.
- **Vendor Identity During Bidding**: Competitors cannot see who submitted which bid or how many bids a specific vendor placed.

### 3. Deliberate Disclosures
- Upon tender closure, the authority invokes `revealWinner(winner, bidAmt)` to selectively disclose the winning bid and update the ledger status to `Awarded`.

---

## 📸 Interface Screenshots & Demo

- **Procurement Authority Dashboard**: Create tenders, set deadlines, and manage tender award transitions.
- **Vendor Sealed-Bid Wizard**: Zero-knowledge eligibility check and confidential bid submission.
- **Public Verifier View**: Inspect public ledger state and verify zero-knowledge disclosures.
- **System Telemetry Drawer**: Monitor devnet node (`9944`), proof server (`6300`), and indexer (`8088`).

---

## 📋 Submission Requirements Checklist

### Level 1 Requirements
- [x] Functional Compact smart contract with ledger state and circuits (`contracts/hello-world.compact`).
- [x] Automated contract compilation (`npm run compile`).
- [x] Automated local devnet deployment script (`npm run setup`).
- [x] Interactive CLI for contract interaction (`npm run cli`).

### Level 2 Requirements
- [x] Full-stack web frontend application in `ui/` (`npm run build` cleanly in Vite + React 18).
- [x] Lace Wallet integration with simulated wallet fallback.
- [x] Comprehensive unit test suite (`npm test` passes all tests).
- [x] Structured documentation and `.env.example` configuration.

### Level 3 Requirements (Sealed-Bid Auction Category)
- [x] Multi-circuit ZK architecture: `createTender`, `registerVendor`, `submitSealedBid`, `closeTender`, `revealWinner`.
- [x] Zero-Knowledge private witnesses for sealed bidding and eligibility verification.
- [x] Comprehensive test coverage for privacy invariants and business logic.
- [x] Enterprise-grade UI with Authority, Vendor, and Verifier views.
- [x] Clean Git commit history (10+ commits).

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js 22+ & npm 10+
- Docker & Docker Compose running (Devnet Node, Indexer, Proof Server)
- Compact Compiler CLI (`compact` v0.5.1 / compiler 0.31.1)

### 1. Install Dependencies & Compile Contract
```bash
npm install
npm run compile
```

### 2. Start Local Devnet & Deploy Contract
```bash
docker compose up -d
npm run setup -- --network undeployed
```

### 3. Run Interactive CLI
```bash
npm run cli
```

### 4. Run Vitest Unit Tests
```bash
npm test
```

### 5. Launch React UI Development Server
```bash
cd ui
npm install
npm run dev
```

---

## 🌐 Network Status Report (Local Devnet vs. Preprod)

- **Local Devnet (`undeployed`)**: **FULLY DEPLOYED & OPERATIONAL** (Contract Address: `849625dc40c812bf8f1b2e09da66fc73c829363e49a30c6b83e130bd8a33fd54`).
- **Preprod / Preview Testnets**: Supported via `npm run setup -- --network preprod`. If public testnet wallet synchronization slows due to indexer backfill, local devnet provides full instant testing and verification per mentor guidance.

---

## 🔮 Future Improvements

1. **Multi-Item Sealed Tenders**: Support multi-item tenders with per-item sealed bid evaluations.
2. **Encrypted Off-Chain Proposal Vault**: Integrate IPFS / Arweave encrypted storage for zero-knowledge technical proposal verification.
3. **Automated Minimum-Bid Selection Circuit**: Execute minimum-bid evaluation inside a zero-knowledge circuit prior to disclosure.

---

## 📄 License

Apache-2.0

# Confidential Procurement & Tender Platform

[![Midnight Compact DSL](https://img.shields.io/badge/Compact%20DSL-v0.31.1-14532D?style=for-the-badge&logo=cardano)](https://midnight.network)
[![Node.js Version](https://img.shields.io/badge/Node.js-v22.23.1-14532D?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Vitest Unit Tests](https://img.shields.io/badge/Vitest-9%2F9%20Passing-166534?style=for-the-badge&logo=vitest)](https://vitest.dev)
[![React UI](https://img.shields.io/badge/UI-React%2018%20%2B%20Vite-15803D?style=for-the-badge&logo=react)](https://reactjs.org)
[![License](https://img.shields.io/badge/License-Apache--2.0-14532D?style=for-the-badge)](LICENSE)

> A privacy-preserving decentralized application built on **Midnight Protocol** for the **Level 3 Sealed-Bid Auction** category. Organizations securely publish public procurement tenders while authorized vendors submit confidential sealed bids. Bid amounts and technical proposal specifications remain private throughout the active bidding period using zero-knowledge proofs. After the submission deadline, only the winning bid is selectively disclosed and verified on-chain.

---

## 📋 Challenge Requirements Checklist

### Level 1 — New Moon Requirements
- [x] Functional Compact smart contract with ledger state and zero-knowledge circuit definitions (`contracts/hello-world.compact`).
- [x] Automated contract compilation script (`npm run compile`).
- [x] Automated local devnet deployment orchestrator (`npm run setup`).
- [x] Interactive CLI for contract interaction (`npm run cli`).

### Level 2 — Waxing Crescent Requirements
- [x] Full-stack web frontend application in `ui/` (Vite + React 18 + TypeScript).
- [x] Lace Wallet integration with simulated local devnet wallet fallback.
- [x] Comprehensive unit test suite (`npm test` passes all tests).
- [x] Structured environment configuration template (`.env.example`).

### Level 3 — First Quarter Requirements (Sealed-Bid Auction Category)
- [x] Multi-circuit ZK architecture: `createTender`, `registerVendor`, `submitSealedBid`, `closeTender`, `revealWinner`.
- [x] Zero-Knowledge private witnesses for sealed bidding (`secretBidAmount`, `secretProposalHash`, `vendorEligibilitySecret`).
- [x] Complete test coverage verifying privacy invariants and lifecycle transitions.
- [x] Enterprise Light Theme UI with Authority, Vendor, Verifier, History Archive, Reputation, and Analytics modules.
- [x] CI/CD pipeline workflow (`.github/workflows/ci.yml`) including contract compilation, testing, and frontend build.

---

## 🔒 Midnight Privacy Model

Midnight Protocol enables fine-grained control over public vs. private execution:

### 1. What Observers Learn (Public Ledger State)
- **Tender Metadata**: `tenderId`, `authority`, `title`, `deadline`.
- **Lifecycle Status**: Active state (`Open`, `Closed`, `Awarded`).
- **Metrics**: Total count of registered vendors and total sealed bids submitted.
- **Winner Award Details**: `winningVendor` address and `winningBidAmount` disclosed **only after** bidding closes.

### 2. What Observers CANNOT Learn (Private Witness State)
- **Individual Bid Amounts**: Sealed bid values (`secretBidAmount()`) remain strictly private during bidding.
- **Technical Proposals**: Detailed proposals (`secretProposalHash()`) are kept off-chain and verified via ZK proofs.
- **Vendor Identity During Bidding**: Competitors cannot see who submitted which bid or how many bids a specific vendor placed.

### 3. Selective Disclosures
- Upon tender closure, the procurement authority invokes `revealWinner(winner, bidAmt)` to selectively disclose the winning bid and update the ledger status to `Awarded`.

---

## 📜 Smart Contract & Deployment Details

- **Contract Source**: [`contracts/hello-world.compact`](contracts/hello-world.compact)
- **Compiled Managed Artifacts**: [`contracts/managed/hello-world/`](contracts/managed/hello-world)
- **Deploys Circuit Count**: 5 ZK Circuits (`createTender`, `registerVendor`, `submitSealedBid`, `closeTender`, `revealWinner`)
- **Local Devnet Contract Address**: `8a2a07bd90dcd7777c0b9a7257e1c98e12dc785eb1df31ee79b8d990f41ec7a0`
- **Deployer Address**: `mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s`

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

## 🚀 Quickstart & Local Installation

### Prerequisites
- Node.js 22+ & npm 10+
- Docker & Docker Compose running (Devnet Node, Indexer, Proof Server)
- Compact Compiler CLI (`compact` v0.5.1 / compiler 0.31.1)

### 1. Install Dependencies & Compile Smart Contract
```bash
npm install
npm run compile
```

### 2. Start Local Devnet & Deploy Contract
```bash
docker compose up -d
npm run setup -- --network undeployed
```

### 3. Run Unit Test Suite
```bash
npm test
```

### 4. Launch React UI Development Server
```bash
cd ui
npm install
npm run dev
```
Open **`http://localhost:5174`** (or `http://localhost:5173`) in your browser.

---

## 🛠️ Environment Variables Configuration

Copy `.env.example` to `.env` to configure endpoints:

```ini
# Midnight Network Configuration (undeployed | preview | preprod)
MIDNIGHT_NETWORK=undeployed

# Contract Address (generated during setup / deploy)
VITE_CONTRACT_ADDRESS=8a2a07bd90dcd7777c0b9a7257e1c98e12dc785eb1df31ee79b8d990f41ec7a0

# Infrastructure Endpoints
VITE_PROOF_SERVER_URL=http://127.0.0.1:6300
VITE_INDEXER_URL=http://127.0.0.1:8088
VITE_NODE_RPC_URL=http://127.0.0.1:9944

# Private State Storage Security
PRIVATE_STATE_PASSWORD=Local-Devnet-Development-Placeholder-1
```

---

## 💻 Tech Stack

- **Smart Contract**: Midnight Compact DSL (v0.31.1)
- **Zero-Knowledge Proving**: Midnight Proof Server (Port 6300)
- **Node & Indexer**: Midnight Devnet Node (Port 9944) & Indexer (Port 8088)
- **Frontend Framework**: React 18 + TypeScript + Vite
- **Styling**: Vanilla Enterprise CSS (Deep Forest Green Light Theme)
- **Testing**: Vitest Suite
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)

---

## ❓ Troubleshooting

- **Contract witness missing error during deploy**: Ensure `src/deploy.ts` initializes contracts using `CompiledContract.withWitnesses(witnessContext)` rather than vacant witnesses.
- **Proof Server connection refused**: Verify Docker container health via `docker compose ps` and confirm Port `6300` is open.
- **RPC disconnect warnings**: Brief WebSocket reconnection notices during local node sync are normal and handled automatically by the Midnight SDK.

---

## 🔮 Future Improvements

1. **Multi-Item Sealed Tenders**: Support multi-item tenders with per-item sealed bid evaluations.
2. **Encrypted Off-Chain Proposal Vault**: Integrate IPFS / Arweave encrypted storage for zero-knowledge technical proposal verification.
3. **Automated Minimum-Bid Selection Circuit**: Execute minimum-bid evaluation inside a zero-knowledge circuit prior to disclosure.

---

## 📄 License

Apache-2.0

# Confidential Procurement & Tender Platform

[![Live Demo](https://img.shields.io/badge/Vercel-Live%20Demo-14532D?style=for-the-badge&logo=vercel)](https://procurement-and-tender-rust.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-14532D?style=for-the-badge&logo=github)](https://github.com/sayakkkk/procurement-and-tender)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/sayakkkk/procurement-and-tender/ci.yml?branch=main&style=for-the-badge&label=CI%2FCD)](https://github.com/sayakkkk/procurement-and-tender/actions)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Demo%20Video-14532D?style=for-the-badge&logo=youtube)](https://youtu.be/QRd-vPrFKds)
[![Midnight Network](https://img.shields.io/badge/Midnight-Devnet-14532D?style=for-the-badge&logo=cardano)](https://midnight.network)
[![Compact Version](https://img.shields.io/badge/Compact%20DSL-v0.31.1-14532D?style=for-the-badge)](https://midnight.network)
[![Node Version](https://img.shields.io/badge/Node.js-v22.23.1-14532D?style=for-the-badge&logo=node.js)](https://nodejs.org)

An enterprise-grade, privacy-preserving decentralized procurement platform engineered on **Midnight Protocol** for official **Level 3 Sealed-Bid Auctions**. Procurement authorities publish public tender requirements while verified vendors submit zero-knowledge confidential sealed bids. Commercial bid amounts and technical proposals remain strictly private throughout the bidding window using local zero-knowledge witness execution environments.

---

## Live Demo, Video & Repository

- **Live Web Application**: [https://procurement-and-tender-rust.vercel.app/](https://procurement-and-tender-rust.vercel.app/)
- **GitHub Repository**: [https://github.com/sayakkkk/procurement-and-tender](https://github.com/sayakkkk/procurement-and-tender)
- **Official YouTube Demo Video**: [Watch Demo Video](https://youtu.be/QRd-vPrFKds)
- **CI/CD Pipeline Status**: [View GitHub Actions Runs](https://github.com/sayakkkk/procurement-and-tender/actions)

---

## Screenshots

## Landing Page

![Landing Page](docs/landing-page.png)

*The Live Tender Marketplace & Authority Dashboard showing active procurement opportunities, live deadline countdown timers, registered vendor counters, total sealed bid counts, and the interactive 'Bid Now' workflow navigation.*

---

## Trade Page

![Trade Page](docs/trade-page.png)

*The Vendor Sealed-Bid Hub demonstrating zero-knowledge eligibility verification and confidential bid submission. Sealed bid amounts and technical proposal hashes are evaluated locally in private ZK witness state without exposing financial data on-chain.*

---

## Challenge Requirements & Passing Checklist

- [x] **Level 3 Midnight Project**: Complete implementation of official Level 3 Sealed-Bid Auction dApp.
- [x] **Full-Stack Decentralized Application**: Seamless integration of smart contract, CLI client, and web UI.
- [x] **Compact Smart Contract**: Multi-circuit contract in Compact DSL (`contracts/hello-world.compact`).
- [x] **Midnight Privacy Model**: Dual-state ledger architecture isolating private witness state from public consensus.
- [x] **Lace Wallet Integration**: Modular account connector supporting Lace Wallet API and local devnet accounts.
- [x] **Frontend Web Interface**: React 18 SPA styled with an enterprise Light Theme color palette.
- [x] **Unit Test Suite**: 9/9 passing Vitest unit tests verifying contract compilation, privacy invariants, and network setup.
- [x] **Automated CI/CD Pipeline**: Fully green GitHub Actions workflow executing contract checks, tests, and UI build.
- [x] **Vercel Production Deployment**: Automated continuous deployment hosted on Vercel infrastructure.
- [x] **Public GitHub Repository**: Managed open-source repository with version control history.
- [x] **Comprehensive Documentation**: Production-ready README containing architecture, privacy specifications, and installation steps.
- [x] **Responsive UI Design**: Clean layout optimized across desktop and tablet screen sizes.
- [x] **Version Control Integrity**: Meaningful commit history representing modular feature development.

---

## Midnight Privacy Model

The **Confidential Procurement & Tender Platform** leverages Midnight Protocol's zero-knowledge paradigm to enforce strict cryptographic boundaries between public ledger data and private witness data.

### What an Observer CANNOT Learn

- **Sealed Bid Amounts**: Commercial bid amounts remain strictly encapsulated inside local zero-knowledge witness state (`secretBidAmount()`). Competitors, node operators, and indexers cannot observe financial values during active bidding.
- **Technical Proposal Specifications**: Technical proposals and specifications are hashed off-chain using private witnesses (`secretProposalHash()`), preventing intellectual property leakage.
- **Vendor Corporate Credentials**: Corporate eligibility secrets (`vendorEligibilitySecret()`) are evaluated locally inside the ZK witness context without broadcasting corporate identity attributes.
- **Off-Chain Witness Executions**: Intermediate circuit evaluations and private keys remain unexposed to public RPC endpoints and indexer nodes.

### What an Observer CAN Learn

- **Public Tender ID**: The unique numerical identifier associated with an active procurement tender (e.g. `#4092`).
- **Procurement Authority Identity**: The public address of the authority creating the procurement tender.
- **Submission Deadline**: The block timestamp defining the active submission window.
- **Total Bids Count**: Aggregate count of sealed bids committed to the tender state.
- **Selective Winner Disclosure**: Winning vendor address and winning bid amount disclosed on-chain ONLY after the authority closes bidding and calls `revealWinner`.
- **Public Ledger Lifecycle**: Current status (`Open`, `Closed`, `Awarded`) and total count of registered vendors.

---

## Contract & Deployment Details

| Parameter | Value / Resource Link |
| :--- | :--- |
| **Target Network** | Midnight Devnet (`undeployed`) / Preprod Testnet |
| **Live Web App** | [procurement-and-tender-rust.vercel.app](https://procurement-and-tender-rust.vercel.app/) |
| **GitHub Repository** | [sayakkkk/procurement-and-tender](https://github.com/sayakkkk/procurement-and-tender) |
| **Contract Address** | `8a2a07bd90dcd7777c0b9a7257e1c98e12dc785eb1df31ee79b8d990f41ec7a0` |
| **Midnight Explorer** | [Devnet Explorer](https://explorer.midnight.network) |
| **CI/CD Status** | [GitHub Actions Workflow Runs](https://github.com/sayakkkk/procurement-and-tender/actions) |
| **Demo Video** | [Watch Video on YouTube](https://youtu.be/QRd-vPrFKds) |

---

## Architecture

The platform architecture isolates sensitive corporate data from public blockchain consensus using five decoupled system layers:

1. **Compact Smart Contract**: Written in Midnight Compact DSL (`contracts/hello-world.compact`), implementing 5 zero-knowledge circuits: `createTender`, `registerVendor`, `submitSealedBid`, `closeTender`, and `revealWinner`.
2. **React Frontend**: Enterprise web application built with React 18, Vite, and TypeScript, featuring a Live Tender Marketplace, Vendor Bidding Wizard, and System Telemetry.
3. **Midnight Wallet Adapter**: Flexible account abstraction layer connecting Lace Wallet API and devnet accounts.
4. **Proof Server**: Local Midnight Proof Server listening on port `6300` for off-chain zero-knowledge proof generation.
5. **Midnight Infrastructure**: Devnet Node RPC on port `9944` and Indexer GraphQL API on port `8088`.

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

## Key Features

- **Live Tender Marketplace**: Real-time directory listing active procurement opportunities with countdown timers, bid counts, and automatic "Bid Now" navigation.
- **Vendor Sealed-Bid Hub**: Guided wizard for verifying corporate eligibility via private ZK proofs and committing confidential bids without financial data leakage.
- **Authority Procurement Management**: Create tenders, configure submission windows, close bidding periods, and execute selective winner disclosures.
- **Public Winner Verification**: Audit public ledger state and verify winning bid disclosures post-deadline.
- **Tender History & Archive**: Searchable registry supporting query filtering by status (`Open`, `Closed`, `Awarded`) and sorting by bid volume or date.
- **Vendor Reputation Registry**: Public performance index tracking verified vendor wins and participation rates while preserving the privacy of non-winning bid amounts.
- **Procurement Analytics Dashboard**: Visual distribution charts, lifecycle breakdowns, and volume growth metrics.
- **System Telemetry Drawer**: Live service health monitoring for Devnet Node (`9944`), Proof Server (`6300`), and Indexer (`8088`).

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Smart Contract DSL** | Midnight Compact (`v0.31.1`) |
| **ZK Proving Engine** | Midnight Proof Server (`Port 6300`) |
| **Blockchain Infrastructure** | Midnight Devnet Node (`Port 9944`) & Indexer (`Port 8088`) |
| **Frontend Framework** | React 18 + TypeScript + Vite (`v5.4`) |
| **Styling & Design** | Enterprise Light Theme Styling + Lucide Icons |
| **Unit Testing** | Vitest (`v2.1`) |
| **CI/CD & Hosting** | GitHub Actions & Vercel |

---

## Project Structure

```
confidential-procurement-tender-platform/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI pipeline
├── contracts/
│   ├── hello-world.compact        # Compact smart contract source
│   └── managed/                   # Compiled ZK contract artifacts
├── docs/
│   ├── landing-page.png           # Live Tender Marketplace screenshot
│   └── trade-page.png             # Vendor Sealed-Bid Hub screenshot
├── src/
│   ├── cli.ts                     # Interactive CLI application
│   ├── contract-client.ts         # Contract client & ledger state decoders
│   ├── deploy.ts                  # Local devnet deployment orchestrator
│   └── setup.ts                   # Infrastructure setup script
├── tests/
│   ├── contract.test.ts           # Contract compilation unit tests
│   ├── network.test.ts            # Network configuration unit tests
│   └── privacy.test.ts            # ZK privacy invariant unit tests
├── ui/
│   ├── public/                    # Static frontend assets
│   ├── src/
│   │   ├── App.tsx                # Main React application & components
│   │   ├── index.css              # Enterprise Light Theme styling
│   │   └── main.tsx               # Application entrypoint
│   ├── package.json               # UI dependencies
│   └── vite.config.ts             # Vite build configuration
├── .env.example                   # Environment configuration template
├── docker-compose.yml             # Local Midnight devnet infrastructure
├── package.json                   # Root dependencies & scripts
├── README.md                      # Documentation
└── vercel.json                    # Vercel deployment configuration
```

---

## Local Setup & Installation

### Prerequisites

- Node.js `22.x` & npm `10.x`
- Docker Desktop running (Devnet Node, Indexer, Proof Server)
- Midnight Compact Compiler CLI (`compact` v0.5.1 / compiler 0.31.1)

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/sayakkkk/procurement-and-tender.git
cd procurement-and-tender
npm install
cd ui && npm install && cd ..
```

### 2. Start Local Midnight Infrastructure

```bash
docker compose up -d
```

### 3. Compile Compact Contract

```bash
npm run compile
```

### 4. Run Unit Test Suite

```bash
npm test
```

### 5. Deploy Contract to Local Devnet

```bash
npm run setup -- --network undeployed
```

### 6. Build & Launch Web Frontend

```bash
cd ui
npm run build
npm run dev
```

Open `http://localhost:5174` (or `http://localhost:5173`) in your browser.

---

## Testing

Execute the unit test suite locally to verify circuit declarations, privacy invariants, and network configuration:

```bash
npm test
```

Expected Vitest output:

```
 RUN  v2.1.9 /home/user/midnight-projects/confidential-procurement-tender-platform

 ✓ tests/contract.test.ts (3 tests)
 ✓ tests/network.test.ts (3 tests)
 ✓ tests/privacy.test.ts (3 tests)

 Test Files  3 passed (3)
      Tests  9 passed (9)
   Start at  14:41:20
   Duration  1.59s (transform 1.16s, setup 0ms, collect 1.17s, tests 49ms, environment 2ms, prepare 1.10s)
```

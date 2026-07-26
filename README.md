# Confidential Procurement & Tender Platform

[![Live Demo](https://img.shields.io/badge/Vercel-Live%20Demo-14532D?style=for-the-badge&logo=vercel)](https://procurement-and-tender-rust.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-14532D?style=for-the-badge&logo=github)](https://github.com/sayakkkk/procurement-and-tender)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/sayakkkk/procurement-and-tender/ci.yml?branch=main&style=for-the-badge&label=CI%2FCD)](https://github.com/sayakkkk/procurement-and-tender/actions)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Demo%20Video-14532D?style=for-the-badge&logo=youtube)](https://youtu.be/QRd-vPrFKds)
[![Midnight Network](https://img.shields.io/badge/Midnight-Devnet-14532D?style=for-the-badge&logo=cardano)](https://midnight.network)
[![Compact Version](https://img.shields.io/badge/Compact%20DSL-v0.31.1-14532D?style=for-the-badge)](https://midnight.network)
[![Node Version](https://img.shields.io/badge/Node.js-v22.23.1-14532D?style=for-the-badge&logo=node.js)](https://nodejs.org)

A privacy-preserving decentralized application built on Midnight Protocol for Level 3 Sealed-Bid Auctions, enabling procurement authorities to publish tenders while authorized vendors submit zero-knowledge confidential sealed bids.

---

## Live Demo, Video & Repository

- **Live Demo**: [https://procurement-and-tender-rust.vercel.app/](https://procurement-and-tender-rust.vercel.app/)
- **GitHub Repository**: [https://github.com/sayakkkk/procurement-and-tender](https://github.com/sayakkkk/procurement-and-tender)
- **Demo Video**: [Watch Demo Video](https://youtu.be/QRd-vPrFKds)
- **CI/CD Workflow**: [View GitHub Actions Runs](https://github.com/sayakkkk/procurement-and-tender/actions)

---

## Challenge Requirements & Passing Checklist

- [x] Level 3 Midnight Project
- [x] Full-stack dApp
- [x] Compact Smart Contract
- [x] Midnight Privacy Model
- [x] Lace Wallet Integration
- [x] Frontend Web Application
- [x] Unit Test Suite Passing
- [x] CI/CD Pipeline Passing
- [x] Vercel Live Deployment
- [x] Public GitHub Repository
- [x] Complete README Documentation
- [x] Responsive Light Theme UI
- [x] Meaningful Commit History (15+ Commits)

---

## Midnight Privacy Model

The Confidential Procurement & Tender Platform enforces a strict cryptographic distinction between public ledger state and private zero-knowledge witness state.

### What an Observer CANNOT Learn

- **Vendor Confidential Proposal**: Technical proposal descriptions and internal specifications are kept off-chain and verified via private witnesses (`secretProposalHash()`).
- **Sealed Bid Amount**: Commercial bid amounts (`secretBidAmount()`) remain strictly private inside local zero-knowledge witness state during active bidding.
- **Proposal Hash**: Private hashes generated within the vendor's local witness context are not exposed on the public ledger.
- **Private Witness Execution**: Local witness computations and corporate eligibility secrets (`vendorEligibilitySecret()`) are never transmitted or stored on-chain.
- **Internal ZK Values**: Intermediate circuit values and private keys remain unexposed to RPC nodes, indexers, and competitors.

### What an Observer CAN Learn

- **Tender ID**: The public identifier assigned to an active procurement tender.
- **Tender Title**: The public title and requirement description published by the authority.
- **Submission Deadline**: The timestamp or block height defining the active bidding window.
- **Total Bids Count**: Aggregate count of sealed bids submitted to the tender.
- **Winner After Reveal**: The winning vendor address and winning bid amount selectively disclosed on-chain ONLY after the authority closes bidding and triggers `revealWinner`.
- **Public Ledger State**: Lifecycle status (`Open`, `Closed`, `Awarded`) and total count of registered vendors.

---

## Contract & Deployment Details

| Parameter | Link / Value |
| :--- | :--- |
| **Live Demo** | [procurement-and-tender-rust.vercel.app](https://procurement-and-tender-rust.vercel.app/) |
| **GitHub Repository** | [sayakkkk/procurement-and-tender](https://github.com/sayakkkk/procurement-and-tender) |
| **Contract Address** | `8a2a07bd90dcd7777c0b9a7257e1c98e12dc785eb1df31ee79b8d990f41ec7a0` |
| **Midnight Explorer** | [Devnet Explorer](https://explorer.midnight.network) |
| **CI/CD Pipeline** | [GitHub Actions Workflow](https://github.com/sayakkkk/procurement-and-tender/actions) |
| **Demo Video** | [Watch Video](https://youtu.be/QRd-vPrFKds) |

---

## Architecture

The platform architecture isolates sensitive corporate data from public blockchain consensus using five decoupled layers:

- **Compact Smart Contract**: Written in Midnight Compact DSL (`contracts/hello-world.compact`), exposing 5 zero-knowledge circuits (`createTender`, `registerVendor`, `submitSealedBid`, `closeTender`, `revealWinner`).
- **React Frontend**: Built with React 18, Vite, and TypeScript, providing enterprise dashboards, telemetry drawers, and interactive modules.
- **Midnight Wallet**: Modular account manager connecting with Lace Wallet API and simulated local devnet accounts.
- **Proof Server**: Local Midnight Proof Server listening on port `6300` for generating zero-knowledge proofs off-chain.
- **Midnight Network**: Devnet Node RPC on port `9944` and Indexer GraphQL API on port `8088`.
- **Zero-Knowledge Layer**: Off-chain witness evaluation ensuring bid privacy prior to tender award.

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

## Features

- **Authority Procurement Dashboard**: Publish public tenders, set submission deadlines, close bidding windows, and execute selective winner disclosures.
- **Vendor Sealed-Bid Hub**: Prove corporate eligibility via private ZK proofs and submit confidential sealed bids without exposing financial figures to competitors.
- **Contract Enforcement**: On-chain assertions enforce strict deadline boundaries preventing late bid submissions.
- **Public Winner Verification**: Audit public contract state and verify winning bid disclosures post-deadline.
- **Tender History Registry**: Searchable archive supporting search by title or ID, status filtering, and sorting options.
- **Vendor Reputation Registry**: Public vendor performance directory tracking verified wins and participation rates without leaking lost bid values.
- **Tender Analytics Dashboard**: Visual distribution metrics, lifecycle breakdowns, and quarterly volume growth trackers.
- **System Telemetry Drawer**: Live service health monitoring for Devnet Node (`9944`), Proof Server (`6300`), and Indexer (`8088`).

---

## Tech Stack

| Layer | Component / Technology |
| :--- | :--- |
| **Smart Contract DSL** | Midnight Compact (`v0.31.1`) |
| **ZK Proving Engine** | Midnight Proof Server (`Port 6300`) |
| **Blockchain Node** | Midnight Devnet Node (`Port 9944`) & Indexer (`Port 8088`) |
| **Frontend Framework** | React 18 + TypeScript + Vite (`v5.4`) |
| **Icons & Design** | Lucide React + Enterprise Light Theme Styling |
| **Unit Testing** | Vitest (`v2.1`) |
| **Deployment & CI** | GitHub Actions & Vercel |

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
│   ├── landing-page.png           # Authority Dashboard screenshot
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

## Local Installation

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

### 4. Run Unit Tests

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

---

## Screenshots

## Landing Page

![Landing Page](docs/landing-page.png)

## Trade Page

![Trade Page](docs/trade-page.png)

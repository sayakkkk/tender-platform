# 🛡️ Confidential Procurement & Tender Platform (CPTP)
### Level 3 Sealed-Bid Auction Architecture on Midnight Network

[![Live Demo](https://img.shields.io/badge/Vercel-Live%20Demo-14532D?style=for-the-badge&logo=vercel)](https://procurement-and-tender-rust.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-14532D?style=for-the-badge&logo=github)](https://github.com/sayakkkk/tender-platform)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Demo%20Video-14532D?style=for-the-badge&logo=youtube)](https://youtu.be/QRd-vPrFKds)
[![Midnight Network](https://img.shields.io/badge/Midnight-Preprod-14532D?style=for-the-badge&logo=shield)](https://midnight.network)
[![Compact Compiler](https://img.shields.io/badge/Compact%20DSL-v0.5.1-14532D?style=for-the-badge)](https://midnight.network)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/sayakkkk/tender-platform/ci.yml?branch=main&style=for-the-badge&label=CI%2FCD)](https://github.com/sayakkkk/tender-platform/actions)

An enterprise-grade, zero-knowledge decentralized procurement platform engineered on **Midnight Network** for official **Level 3 Sealed-Bid Auctions**. Procurement authorities publish public tender specifications while authorized vendors submit zero-knowledge confidential sealed bids. Commercial proposal pricing and proprietary vendor credentials remain strictly private throughout the bidding window via local client-side witness execution, while immutable cryptographic commitments are verified on-chain.

---

## 🔗 Quick Resource Links

| Resource | Link / Identifier | Status |
| :--- | :--- | :--- |
| 🌐 **Live Web Application** | [procurement-and-tender-rust.vercel.app](https://procurement-and-tender-rust.vercel.app/) | 🟢 Active & Deployed |
| 📦 **Midnight Smart Contract** | [`14fdda1f6c45f3394b3113fb23dc70357a5fbcabc51caebf036a31f6991a3c0f`](https://indexer.preprod.midnight.network) | 🟢 Preprod Deployed (Block 2648857) |
| 🎥 **YouTube Demonstration** | [Official Video Walkthrough](https://youtu.be/QRd-vPrFKds) | 🟢 Available |
| 💻 **GitHub Repository** | [sayakkkk/tender-platform](https://github.com/sayakkkk/tender-platform) | 🟢 Public Repository |
| 📜 **Technical Architecture** | [PROPOSAL.md](PROPOSAL.md) | 🟢 Level 3 Architecture Specification |
| ⚡ **CI/CD Pipeline** | [GitHub Actions Workflow](https://github.com/sayakkkk/tender-platform/actions) | 🟢 All Checks Passing |

---

## 📌 Project Overview

Traditional public and enterprise procurement mechanisms suffer from critical structural vulnerabilities:
1. **Premature Commercial Leakage**: Centralized procurement databases and database administrators can leak confidential bid figures prior to deadlines, enabling bid sniping, asymmetric price shading, and collusion.
2. **The Public Blockchain Dilemma**: Deploying procurement auctions on standard transparent blockchains exposes all transaction inputs, balances, and bid values publicly on-chain, destroying commercial confidentiality.
3. **Lack of Verifiable Trust**: Offline sealed-bid tenders rely entirely on institutional trust, lacking mathematical guarantees that tenders were closed at the exact deadline or that winners were selected without bid tampering.

The **Confidential Procurement & Tender Platform** resolves this trilemma using **Midnight Protocol's Dual-State Architecture**:
- **Consensus / Public State**: Tracks open tenders, authority identities, registration eligibility commitments, deadline timestamps, cryptographic bid commitments, and lifecycle statuses (`Open`, `Closed`, `Awarded`).
- **Private / Zero-Knowledge State**: Computes secret bid values, blinding nonces, and qualification proofs locally within isolated client-side witness environments.
- **Selective Disclosure**: When bidding concludes, the authority initiates settlement (`revealWinner`). The contract cryptographically verifies that the revealed winning bid matches the on-chain commitment without exposing any losing bids.

---

## ✨ Key Features

- 🔒 **Confidential Sealed Bids**: Commercial bid amounts and technical secrets are evaluated solely within private zero-knowledge witness contexts.
- ⚓ **Cryptographic Commitment Binding**: SHA-256 / Pedersen commitments bind `(tenderId, vendorAddress, bidAmount, secretNonce)` to on-chain state, preventing post-deadline alterations.
- 🏢 **Multi-Tender State Isolation**: Independent multi-tender ledger architecture isolating concurrent procurement opportunities, vendor registries, and bid vaults.
- 🛡️ **Private Vendor Eligibility**: Zero-knowledge qualification validation verifying vendor authorization without revealing private corporate credentials.
- ⏱️ **Enforced Lifecycle & Deadlines**: Strict smart contract circuit constraints governing state transitions (`Open` → `Closed` → `Awarded`) with mathematical deadline enforcement.
- 🏆 **Selective Winner Reveal**: Only the awarded vendor's winning bid is legitimately disclosed post-deadline; losing offers remain permanently sealed.
- 🔍 **Public Zero-Knowledge Verification**: Tamper-proof mathematical verification allowing independent auditors to validate outcomes against on-chain consensus commitments.
- 💼 **Midnight Lace Wallet Integration**: Direct DApp Connector integration validating genuine Midnight Preprod network accounts with zero mock or fallback logic.
- 🌐 **Verified Preprod Deployment**: Active on Midnight Preprod testnet, indexed via live GraphQL Indexer and verified on-chain.

---

## 📋 Challenge Requirements Checklist

| Requirement Category | Description | Status | Evidence / Verification |
| :--- | :--- | :--- | :--- |
| **Level 1: Core Smart Contract** | Domain-specific Compact contract with private/public state separation | ✅ PASS | `contracts/procurement.compact` compiled into `contracts/managed/procurement/` |
| **Level 1: ZK Privacy Model** | Private witnesses for bid amounts, nonces, and eligibility credentials | ✅ PASS | Zero raw bid amounts exposed in public consensus ledger state |
| **Level 2: Automated Tests** | Comprehensive unit, privacy, invariant, and network test suites | ✅ PASS | 21/21 passing tests in Vitest suite (`npm test`) |
| **Level 2: Lace Wallet Integration**| Real Midnight Lace DApp Connector integration | ✅ PASS | Authentic Preprod wallet connection, address resolution, disconnect/reconnect |
| **Level 3: Live Preprod Deployment** | Real contract deployment on Midnight Preprod network | ✅ PASS | Contract Address `14fdda...` confirmed at Block `2648857` (TX `b6d7...`) |
| **Level 3: Live On-Chain Activity** | Real on-chain circuit transactions on Midnight Preprod | ✅ PASS | Real TXs executed: `createTender`, `registerVendor`, `submitSealedBid` |
| **Level 3: Live Indexer Integration**| GraphQL Indexer querying on-chain contract state | ✅ PASS | Indexer returns 20,750-char contract state from Preprod GraphQL endpoint |
| **Level 3: Enterprise Web UI** | Production Next.js 14 App Router DApp | ✅ PASS | Next.js 14 production build compiled with exit code 0 (`ui/npm run build`) |
| **Level 3: CI/CD Pipeline** | Automated GitHub Actions CI workflow | ✅ PASS | Verified green workflow run on GitHub Actions for `main` branch |

---

## 📜 Contract & Deployment Details

### Deployed Network Configuration
| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Target Network** | Midnight Preprod Testnet | Official Midnight Preprod network environment |
| **Network ID** | `preprod` (ID: 1) | Strict network identifier enforced by DApp Connector |
| **Authoritative Contract Address** | `14fdda1f6c45f3394b3113fb23dc70357a5fbcabc51caebf036a31f6991a3c0f` | Verified on-chain procurement contract address |
| **Deployment Transaction Hash** | `b6d79b2d8b9d0f09b581e1208fcbabb60f3b7fd8d955fb74786508b620fba516` | On-chain deployment transaction |
| **Deployment Transaction ID** | `0027de7f5924d8a19254333ea1f7e08500c9e0a5a5983e333641be54f00346de85` | Midnight ledger transaction identifier |
| **Deployment Block Height** | `2648857` | Block Hash: `b0dea1f7571298cb9ebcbfb2b7d8500e8d55d810d87558de1051ee642c14de00` |
| **Deployment Status** | `SucceedEntirely` | Fully confirmed and finalized on consensus ledger |
| **Indexer GraphQL Endpoint** | `https://indexer.preprod.midnight.network/api/v4/graphql` | Live Midnight Preprod GraphQL Indexer |
| **Node RPC Endpoint** | `https://rpc.preprod.midnight.network` | Live Midnight Preprod Substrate Node RPC |
| **Proof Server Endpoint** | `http://127.0.0.1:6300` | Local proof generation server (`midnightntwrk/proof-server:8.1.0`) |

### Verified Live On-Chain Transactions
| Action | Transaction Hash | Block Height | Status | On-Chain Verification Result |
| :--- | :--- | :--- | :--- | :--- |
| `deployContract` | `b6d79b2d8b9d0f09b581e1208fcbabb60f3b7fd8d955fb74786508b620fba516` | `2648857` | `SucceedEntirely` | Contract state indexed and queried on Preprod Indexer |
| `createTender` (#6501) | `83cc8f5200d4553d517bd34f5f5c84db980a4d8d6d0faf18d03fb097b6639df7` | `2648921` | `SucceedEntirely` | Tender #6501 created with status Open; authority bound |
| `registerVendor` (0x4242) | `8dcf2b79134da1f6a26914122be4a23e9c89615469939093308a1f13d2d7cba7` | `2648925` | `SucceedEntirely` | Vendor eligibility commitment recorded for Tender #6501 |
| `submitSealedBid` (850k) | `ff90bdb6f786841eb65ba42a04a0b500fce889c0434c3a5c3391969fa88bdfb9` | `2648930` | `SucceedEntirely` | SHA-256 commitment registered; raw bid amount hidden |

---

## 🔐 Midnight Privacy Model & Public State Separation

Midnight's dual-state architecture enables mathematical privacy guarantees by strictly separating public consensus state from private client-side zero-knowledge witness state.

### Ledger / Public Consensus State
- **Tender Registry**: `Map<TenderId, { authority, deadline, status }>`
- **Vendor Commitments**: `Map<TenderId + VendorPubKey, uint8>`
- **Bid Commitments Map**: `Map<TenderId + VendorPubKey, HashValue>`
- **Total Bids Counter**: `uint64` (Aggregated count without bid values)
- **Disclosed Winner State**: Awarded vendor address + winning bid (post-close only)

### Private Client-Side Witness State
- **`secretBidAmount`**: `uint64` (Raw financial offer known only to vendor)
- **`secretBidNonce`**: `Bytes<32>` (256-bit blinding entropy preventing dictionary attacks)
- **`vendorEligibilitySecret`**: `Bytes<32>` (Confidential corporate qualification proof)
- **Local Bid Vault**: Encrypted browser storage of private preimage tuples

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          PUBLIC CONSENSUS STATE                          │
│                                                                          │
│  • Tender Registry:        Map<TenderId, { authority, deadline, status }>│
│  • Vendor Commitments:     Map<TenderId + VendorPubKey, uint8>           │
│  • Bid Commitments Map:    Map<TenderId + VendorPubKey, HashValue>       │
│  • Total Bids Counter:     uint64 (Aggregated count without values)      │
│  • Disclosed Winner State: Awarded vendor address + winning bid (post-close)
└──────────────────────────────────────────────────────────────────────────┘
                                     ▲
                                     │  Zero-Knowledge Proving (ZKP)
                                     │  (Public State Transition Inputs)
┌──────────────────────────────────────────────────────────────────────────┐
│                       PRIVATE CLIENT-SIDE WITNESS STATE                  │
│                                                                          │
│  • secretBidAmount:        uint64 (Raw financial offer known only to vendor)
│  • secretBidNonce:         Bytes<32> (256-bit blinding entropy)          │
│  • vendorEligibilitySecret: Bytes<32> (Confidential qualification proof) │
│  • Local Bid Vault:        Encrypted browser storage of preimage pairs   │
└──────────────────────────────────────────────────────────────────────────┘
```

### Selective Disclosure & Cryptographic Binding
1. **Commitment Phase (`submitSealedBid`)**: The vendor's client generates a cryptographic commitment `C = SHA-256(tenderId || vendorPubKey || bidAmount || nonce)`. Only `C` is submitted to the blockchain.
2. **Secrecy Guarantee**: Because SHA-256 is collision-resistant and non-invertible, validators and competitors learn only that a valid bid was registered, with zero knowledge of `bidAmount`.
3. **Settlement Phase (`revealWinner`)**: After the tender deadline passes and the tender is `Closed`, the authority submits the winning vendor's parameters. The circuit validates that `SHA-256(...) == C`. If valid, the contract awards the tender.
4. **Perpetual Privacy for Losing Bids**: Preimages for unsuccessful bids are never submitted to the contract, keeping losing commercial strategies permanently private.

---

## ⚡ Compact Contract Circuits

Smart contract source: [`contracts/procurement.compact`](contracts/procurement.compact)
Generated managed artifacts: [`contracts/managed/procurement/`](contracts/managed/procurement/)

| Circuit | Role | Public Inputs / State Changes | Private Witnesses | Security / Invariant Guarantee |
| :--- | :--- | :--- | :--- | :--- |
| `createTender` | Authority | `tenderId`, `deadline`, `authority` -> `tenders` | None | Rejects duplicate tender IDs; enforces valid future deadline duration. |
| `registerVendor` | Vendor | `tenderId`, `vendorPubKey` -> `registeredVendors` | `vendorEligibilitySecret` | Verifies non-empty credential witness; prevents duplicate registrations. |
| `submitSealedBid` | Vendor | `tenderId`, `commitment` -> `bidCommitments` | `secretBidAmount`, `secretBidNonce` | Enforces deadline and registration; binds commitment without exposing bid. |
| `closeTender` | Authority | `tenderId` -> status `Closed` | None | Enforces authority authorization and validates deadline expiration. |
| `revealWinner` | Authority / Winner | `tenderId`, `winner`, `bid`, `commitment` -> status `Awarded` | `secretBidAmount`, `secretBidNonce` | Cryptographically proves correspondence to on-chain commitment. |

---

## 💼 Wallet Connection & Lifecycle

The platform features direct integration with the **Midnight Lace Wallet** Chrome Extension using the standard Midnight DApp Connector API:

1. **Detection & Injection**: Automatically detects `window.midnight.mnLace` in the browser environment.
2. **Access Authorization**: Requests permissions via `mnLace.enable()` to initiate authenticated sessions.
3. **Strict Network Validation**: Enforces connection exclusively to `Midnight Preprod` (`networkId === 'preprod'`). Connections from incompatible or mock networks are rejected.
4. **Genuine Address Resolution**: Retrieves authenticated Midnight Preprod addresses (`mn_addr_preprod1...`) via `getUsedAddresses()` and `getUnusedAddresses()`.
5. **Session Lifecycle Management**: Maintains resilient session state with real-time disconnect detection, account switching handlers, and reconnect capabilities.
6. **Zero Mock Fallback**: Production wallet paths contain zero synthetic wallet fallbacks, zero mock addresses, and zero hardcoded balances.

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js**: `v22.23.1` or higher
- **npm**: `v10.9.8` or higher
- **Docker**: Docker & Docker Compose (for local ZK Proof Server container)
- **Midnight Compact Compiler**: `v0.5.1` (optional if using managed contract artifacts)
- **Midnight Lace Wallet**: Chrome extension configured for Midnight Preprod

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/sayakkkk/tender-platform.git
cd tender-platform
npm install
```

### 2. Start Local Midnight Proof Server
```bash
npm run proof-server:start
# Validates container health on http://127.0.0.1:6300/health
```

### 3. Compile Compact Smart Contract
```bash
npm run compile
# Compiles contracts/procurement.compact -> contracts/managed/procurement/
```

### 4. Execute Test Suite
```bash
npm test
# Executes 21 passing Vitest tests
```

### 5. Launch Local Development DApp
```bash
cd ui
npm install
npm run dev
# Opens DApp on http://localhost:3000
```

### 6. Build Production Bundle
```bash
npm run build
# Builds Compact artifacts and Next.js 14 production bundle
```

---

## 🧪 Functional Testing & Verification

The platform maintains a comprehensive automated testing suite executed via Vitest across 4 dedicated test files (21 passing tests):

```bash
npm test
```

### Expected Output
```
 RUN  v2.1.9 /home/user/midnight-projects/confidential-procurement-tender-platform

 ✓ tests/network.test.ts (4 tests) 291ms
 ✓ tests/contract.test.ts (3 tests) 861ms
   ✓ Confidential Procurement Contract - Circuit Execution & Lifecycle > must execute full sealed-bid procurement lifecycle 576ms
 ✓ tests/privacy.test.ts (4 tests) 1158ms
   ✓ Confidential Procurement - Privacy, Witnesses & Cryptographic Invariants > keeps submitted sealed bid amounts private until legitimate reveal 540ms
   ✓ Confidential Procurement - Privacy, Witnesses & Cryptographic Invariants > cryptographically binds reveal to sealed commitment and rejects tampered amount 334ms
 ✓ tests/invariants.test.ts (10 tests) 1374ms

 Test Files  4 passed (4)
      Tests  21 passed (21)
   Duration  4.34s
```

### Test Coverage Breakdown
1. **`tests/contract.test.ts` (3 tests)**:
   - Validates generated Compact ZK proving keys, verifier keys, and ZKIR bytecode.
   - Executes the complete 5-stage procurement lifecycle in-memory via Compact runtime (`createTender` → `registerVendor` → `submitSealedBid` → `closeTender` → `revealWinner`).
   - Verifies cross-tender state isolation between concurrent tenders.

2. **`tests/privacy.test.ts` (4 tests)**:
   - Verifies that bid amounts and blinding nonces remain private witnesses during circuit execution.
   - Enforces cryptographic commitment binding to prevent winner tampering.
   - Validates that tampered bid amounts or nonces are rejected by the circuit.
   - Proves vendor eligibility credentials are cryptographically validated.

3. **`tests/invariants.test.ts` (10 tests)**:
   - Rejection of duplicate tender creation.
   - Rejection of vendor registration on non-existent tenders.
   - Rejection of duplicate vendor registration on the same tender.
   - Rejection of bid submissions from unregistered vendors.
   - Rejection of duplicate bid submissions from the same vendor.
   - Rejection of bid submissions after deadline expiration.
   - Rejection of zero or invalid bid amounts.
   - Rejection of closing an open tender before deadline expiration.
   - Rejection of revealing a winner while bidding is still open.
   - Rejection of declaring a non-participant as the winning vendor.

4. **`tests/network.test.ts` (4 tests)**:
   - Resolves network configuration flags (`preprod`, `undeployed`).
   - Validates 64-character hex seed format.
   - Verifies local ZK Proof Server health endpoint (`http://127.0.0.1:6300/health`).

---

## 📸 Platform Screenshots

### 1. HOME PAGE
![HOME PAGE](docs/home-page.png)
*The main portal and tender marketplace overview, featuring live procurement opportunities, telemetry metrics, and seamless integration with Midnight Lace Wallet for authentic preprod DApp authorization.*

### 2. SEALED BID SUBMISSION
![SEALED BID SUBMISSION](docs/sealed-bid-submission.png)
*The multi-step zero-knowledge sealed-bid commitment wizard, allowing eligible vendors to specify private commercial proposals and generate cryptographic commitments without exposing bid amounts on-chain.*

---

## 🏗️ System Architecture

### Architectural Components
1. **Midnight Compact Smart Contract**: Enforces domain-specific auction logic, vendor registries, commitment verification, and lifecycle state transitions.
2. **Next.js 14 Web Application**: App Router frontend providing dedicated portals for Procurement Authorities, Bidding Vendors, and Public Verifiers.
3. **Midnight Lace Wallet**: Chrome Extension providing secure private key management and transaction signing for Midnight Preprod.
4. **Local Proof Server (Port 6300)**: Generates client-side zero-knowledge proofs for witness evaluation.
5. **Midnight Preprod Infrastructure & Indexer**: Decentralized Substrate node RPC and GraphQL indexer querying on-chain consensus state.

### System Dataflow & Sequence Diagram
```
┌───────────────────────────────────────────────────────────────────────────┐
│                       1. PRESENTATION LAYER (DAPP)                        │
│             Next.js 14 (App Router) + React 18 + Tailwind CSS             │
│   • Marketplace Portal   • Vendor Sealed-Bid Hub   • Public Verifier UI   │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                     2. WALLET & AUTHENTICATION LAYER                      │
│            Midnight Lace DApp Connector (Preprod Network ID: 1)           │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    3. MIDNIGHT JS / PROOF PROVIDER                        │
│      @midnight-ntwrk/midnight-js-contracts & httpClientProofProvider      │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
┌────────────────────────────┐                 ┌────────────────────────────┐
│   4. PROOF SERVER (6300)   │                 │   5. MIDNIGHT PREPROD      │
│   ZK Proof Generation      │                 │   Node RPC & Indexer API   │
│   (Witness Evaluation)     │                 │   (Consensus State)        │
└────────────────────────────┘                 └────────────────────────────┘
```

---

## 📁 Repository Structure

```
confidential-procurement-tender-platform/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI pipeline
├── contracts/
│   ├── procurement.compact        # Compact smart contract circuits & state
│   └── managed/                   # Compiled ZK contract artifacts & keys
│       └── procurement/
│           ├── contract/          # Generated contract interfaces
│           ├── keys/              # Proving & verification keys
│           └── zkir/              # Zero-knowledge intermediate representation
├── docs/
│   ├── home-page.png              # Live Marketplace & Lace connection screenshot
│   └── sealed-bid-submission.png  # ZK Sealed-Bid Wizard screenshot
├── scripts/
│   ├── e2e-check.ts               # Preprod reconnection & deployment verifier
│   └── smoke-test-preprod.ts      # Live Preprod on-chain smoke test runner
├── src/
│   ├── check-balance.ts           # Account balance verification utility
│   ├── cli.ts                     # Interactive terminal CLI application
│   ├── contract-client.ts         # Contract client & ledger decoders
│   ├── deploy.ts                  # Network deployment orchestrator
│   ├── deployment-store.ts        # Deployment state persistence manager
│   ├── network-resolver.ts        # Network resolution utility
│   ├── network.ts                 # Multi-network configuration (Preprod/Devnet)
│   ├── seed-store.ts              # Wallet seed store manager
│   ├── setup.ts                   # Environment setup runner
│   ├── wallet-utils.ts            # Wallet & provider factory utilities
│   └── wallet.ts                  # Midnight Wallet SDK context setup
├── tests/
│   ├── contract.test.ts           # Contract compilation & lifecycle unit tests
│   ├── invariants.test.ts         # Invariant & access control tests
│   ├── network.test.ts            # Network resolution unit tests
│   └── privacy.test.ts            # ZK privacy invariant unit tests
├── ui/
│   ├── public/                    # Static frontend assets
│   ├── src/
│   │   ├── app/                   # Next.js App Router (layout, page, globals.css)
│   │   ├── components/            # UI components (tenders, wizard, status, layout)
│   │   ├── lib/                   # Configuration, types, and cryptographic utils
│   │   └── services/              # Connector, contract, and indexer services
│   ├── package.json               # Frontend dependencies & Next.js scripts
│   ├── tsconfig.json              # TypeScript configuration
│   └── tailwind.config.js         # Tailwind CSS styling tokens
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git exclusion rules
├── docker-compose.yml             # Local Midnight devnet infrastructure
├── package.json                   # Root package dependencies & scripts
├── PROPOSAL.md                    # Level 3 Architecture & Proposal Document
├── README.md                      # Primary project documentation
├── tsconfig.json                  # Root TypeScript configuration
├── vercel.json                    # Vercel deployment configuration
└── vitest.config.ts               # Vitest test configuration
```

---

## 🔄 CI/CD Pipeline

The project implements automated Continuous Integration via GitHub Actions defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml). Every push and pull request to `main` triggers a complete end-to-end verification pipeline:

1. **Repository Checkout**: Fetches repository code via `actions/checkout@v4`.
2. **Environment Setup**: Configures Node.js `22.x` environment with caching.
3. **Dependency Installation**: Runs `npm ci` across root and UI workspaces.
4. **Compact Circuit Compilation**: Executes `npm run compile` to verify ZK proving keys and contract bytecode.
5. **Test Suite Execution**: Executes `npm test`, validating all 21 unit, privacy, invariant, and network tests.
6. **Next.js Production Build**: Executes `cd ui && npm run build` to ensure static optimization and type safety.

---

## 🛡️ Security & Cryptographic Guarantees

1. **Private Witness Isolation**: Raw commercial pricing proposals and blinding nonces are evaluated exclusively in isolated local witness contexts. *(IMPLEMENTED & TEST-VERIFIED)*
2. **Cryptographic Commitment Binding**: SHA-256 commitments mathematically bind `(tenderId, vendorPubKey, bidAmount, secretNonce)` to prevent tampering. *(IMPLEMENTED & LIVE-VERIFIED)*
3. **Strict Deadline Enforcement**: Contract constraints reject sealed-bid commitments submitted after the recorded timestamp deadline. *(IMPLEMENTED & TEST-VERIFIED)*
4. **Invalid Reveal Rejection**: Mismatched bid preimages or fraudulent claims are deterministically rejected during winner determination. *(IMPLEMENTED & TEST-VERIFIED)*
5. **Multi-Tender State Isolation**: Distinct ledger keys prevent state collision or information leakage across concurrent tenders. *(IMPLEMENTED & LIVE-VERIFIED)*
6. **Losing-Bid Secrecy**: Unsuccessful bidder proposals and pricing models remain private witnesses in perpetuity. *(IMPLEMENTED & TEST-VERIFIED)*

---

## 🗺️ Roadmap

- [x] **Phase 1**: Domain-specific Compact smart contract with dual-state separation
- [x] **Phase 2**: Real Midnight Lace DApp Connector integration with strict Preprod validation
- [x] **Phase 3**: Smart contract deployment and live verification on Midnight Preprod network
- [x] **Phase 4**: Zero-knowledge sealed-bid commitment submission wizard
- [x] **Phase 5**: Post-deadline winner reveal circuit and public verifier dashboard
- [ ] **Phase 6**: Multi-criteria weighted ZK scoring engine (technical qualification + commercial pricing)
- [ ] **Phase 7**: Threshold MPC auditor decryption committee for dispute resolution
- [ ] **Phase 8**: W3C Verifiable Credential integration for automated vendor compliance verification

---

## 📄 License

This project is licensed under the **MIT License**. Engineered for the Midnight Network Community.

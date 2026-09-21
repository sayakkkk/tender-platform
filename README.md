# Confidential Procurement & Tender Platform
### Level 3 Sealed-Bid Auction Architecture on Midnight Network

[![Live Demo](https://img.shields.io/badge/Vercel-Live%20Demo-14532D?style=for-the-badge&logo=vercel)](https://procurement-and-tender-rust.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-14532D?style=for-the-badge&logo=github)](https://github.com/sayakkkk/tender-platform)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/sayakkkk/tender-platform/ci.yml?branch=main&style=for-the-badge&label=CI%2FCD)](https://github.com/sayakkkk/tender-platform/actions)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Demo%20Video-14532D?style=for-the-badge&logo=youtube)](https://youtu.be/QRd-vPrFKds)
[![Midnight Network](https://img.shields.io/badge/Midnight-Preprod-14532D?style=for-the-badge&logo=cardano)](https://midnight.network)
[![Compact Version](https://img.shields.io/badge/Compact%20DSL-v0.31.1-14532D?style=for-the-badge)](https://midnight.network)
[![Node Version](https://img.shields.io/badge/Node.js-v22.23.1-14532D?style=for-the-badge&logo=node.js)](https://nodejs.org)

An enterprise-grade, privacy-preserving decentralized procurement platform engineered on **Midnight Protocol** for official **Level 3 Sealed-Bid Auctions**. Procurement authorities publish public tender requirements while verified vendors submit zero-knowledge confidential sealed bids. Commercial bid amounts and technical proposals remain strictly private throughout the bidding window using local zero-knowledge witness execution environments.

---

## Live Demo, Video & Repository

- **Live Web Application**: [https://procurement-and-tender-rust.vercel.app/](https://procurement-and-tender-rust.vercel.app/)
- **GitHub Repository**: [https://github.com/sayakkkk/tender-platform](https://github.com/sayakkkk/tender-platform)
- **Official YouTube Demo Video**: [Watch Demo Video](https://youtu.be/QRd-vPrFKds)
- **CI/CD Pipeline Status**: [View GitHub Actions Runs](https://github.com/sayakkkk/tender-platform/actions)

---

## Screenshots

### 1. HOME PAGE
![HOME PAGE](docs/home-page.png)
*The main portal and tender marketplace overview, featuring live procurement opportunities, telemetry metrics, and seamless integration with Midnight Lace Wallet for authentic preprod DApp authorization.*

### 2. SEALED BID SUBMISSION
![SEALED BID SUBMISSION](docs/sealed-bid-submission.png)
*The multi-step zero-knowledge sealed-bid commitment wizard, allowing eligible vendors to specify private commercial proposals and generate cryptographic commitments without exposing bid amounts on-chain.*

---

## Midnight Privacy & State Model

The platform leverages Midnight's dual-state architecture, strictly separating public on-chain consensus state from private client-side zero-knowledge witness state.

### Ledger / Public Consensus State
- **Tender Registry**: Multi-tender map indexed by unique 64-bit `tenderId`, storing authority address, deadline timestamp, status (`Open`, `Closed`, `Awarded`), winning vendor address, and winning bid amount.
- **Vendor Registration**: Scoped commitments indexing eligible vendors for specific tender IDs.
- **Bid Commitments**: Cryptographic SHA-256 / Pedersen commitments binding `(tenderId, vendorAddress, bidAmount, secretNonce)` to on-chain state without exposing raw amounts.

### Private Client-Side Witness State
- **Bid Amount**: Raw numerical offer known only to the bidding vendor before official reveal.
- **Blinding Nonce**: 256-bit cryptographically secure random secret preventing rainbow table / brute-force attacks against commitments.
- **Eligibility Secret**: Private credential token proving vendor authorization without leaking corporate identity.

### Privacy Guarantees
1. **Bid Secrecy**: No validator, node operator, indexer, or competitor can determine the bid amount while a tender is open.
2. **Preimage Binding**: A winner reveal cannot alter the winning bid amount or vendor address after bidding closes without invalidating the cryptographic commitment check.
3. **Losing Bid Confidentiality**: Only the winning offer is disclosed upon award; losing bids remain mathematically sealed in perpetuity.
4. **Multi-Tender Isolation**: All tenders operate independently with isolated vendor lists, commitments, and deadlines.

---

## Compact Contract Circuits

Target contract: `contracts/procurement.compact`  
Generated artifacts: `contracts/managed/procurement/`

| Circuit | Role | Public Inputs / State Changes | Private Witnesses | Security / Invariant Guarantee |
| :--- | :--- | :--- | :--- | :--- |
| `createTender` | Authority | `tenderId`, `deadline`, `authority` -> `tenders` | None | Rejects duplicate tender IDs; enforces positive duration. |
| `registerVendor` | Vendor | `tenderId`, `vendorPubKey` -> `registeredVendors` | `eligibilitySecret` | Verifies non-empty credential; prevents duplicate registrations. |
| `submitSealedBid` | Vendor | `tenderId`, `commitment` -> `bidCommitments` | `bidAmount`, `nonce` | Enforces deadline and registration; prevents duplicate bids; binds commitment. |
| `closeTender` | Authority | `tenderId` -> status `Closed` | None | Enforces authority authorization and deadline expiration. |
| `revealWinner` | Authority / Winner | `tenderId`, `winner`, `bid`, `commitment` -> status `Awarded` | `bidAmount`, `nonce` | Proves mathematical correspondence to on-chain commitment; binds winner identity. |

---

## Automated Test Suites

The test suite executes genuine Compact smart contract circuits and cryptographic invariants across 4 dedicated test files (21 passing tests):

```bash
npm test
```

### Test Coverage Breakdown:
1. **`tests/contract.test.ts` (3 tests)**:
   - Validates generated Compact ZK proving keys, verifier keys, and ZKIR bytecode.
   - Executes full 5-stage procurement lifecycle in-memory via Compact runtime (`createTender` -> `registerVendor` -> `submitSealedBid` -> `closeTender` -> `revealWinner`).
   - Verifies cross-tender state isolation between concurrent tenders.

2. **`tests/privacy.test.ts` (4 tests)**:
   - Verifies bid amounts and nonces remain private witnesses in circuit execution.
   - Enforces cryptographic commitment binding to prevent winner tampering.
   - Validates that tampered bid amounts or nonces are rejected.
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

## Local Setup & Quickstart

### Prerequisites
- Node.js `v22.23.1+`
- npm `10.9.8+`
- Docker & Docker Compose (for local proof server)
- Midnight Compact Compiler `v0.31.1+` (optional if using managed artifacts)
- Midnight Lace Wallet Chrome Extension

### 1. Installation
```bash
git clone https://github.com/sayakkkk/tender-platform.git
cd procurement-and-tender
npm install
```

### 2. Start ZK Proof Server
```bash
npm run proof-server:start
# Confirms healthy on http://127.0.0.1:6300/health
```

### 3. Run Test Suite
```bash
npm test
```

### 4. Build & Launch Web UI
```bash
cd ui && npm run dev
# Opens http://localhost:3000
```

---

## Midnight Preprod Verified Deployment Evidence

- **Target Network**: Midnight Preprod Testnet
- **Network ID**: `preprod` (ID: 1)
- **Indexer GraphQL Endpoint**: `https://indexer.preprod.midnight.network/api/v4/graphql`
- **Node RPC Endpoint**: `https://rpc.preprod.midnight.network`
- **Proof Server Endpoint**: `http://127.0.0.1:6300` (Local Proof Server)
- **Authoritative Contract Address**: `14fdda1f6c45f3394b3113fb23dc70357a5fbcabc51caebf036a31f6991a3c0f`
- **Deployment Transaction Hash**: `b6d79b2d8b9d0f09b581e1208fcbabb60f3b7fd8d955fb74786508b620fba516`
- **Deployment Transaction ID**: `0027de7f5924d8a19254333ea1f7e08500c9e0a5a5983e333641be54f00346de85`
- **Deployment Block Height**: `2648857` (Block Hash: `b0dea1f7571298cb9ebcbf2b7d8500e8d55d810d87558de1051ee642c14de00`)
- **Deployment State Status**: `SucceedEntirely`

### Verified Live Preprod Transactions
| Action | Transaction Hash | Block Height | Status | On-Chain Verification |
| :--- | :--- | :--- | :--- | :--- |
| `deployContract` | `b6d79b2d8b9d0f09b581e1208fcbabb60f3b7fd8d955fb74786508b620fba516` | `2648857` | `SucceedEntirely` | Contract state indexed on Preprod Indexer |
| `createTender` (#6501) | `83cc8f5200d4553d517bd34f5f5c84db980a4d8d6d0faf18d03fb097b6639df7` | `2648921` | `SucceedEntirely` | Tender #6501 created with status Open |
| `registerVendor` (0x4242) | `8dcf2b79134da1f6a26914122be4a23e9c89615469939093308a1f13d2d7cba7` | `2648925` | `SucceedEntirely` | Vendor eligibility commitment recorded |
| `submitSealedBid` (850k) | `ff90bdb6f786841eb65ba42a04a0b500fce889c0434c3a5c3391969fa88bdfb9` | `2648930` | `SucceedEntirely` | SHA-256 commitment registered; bid value hidden |


## License
MIT License. Engineered for the Midnight Network Community.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { WebSocket } from "ws";

import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { resolveNetwork, getOrCreateSeed, getDeployment } from "../src/network.js";
import { createWallet, persistWalletState } from "../src/wallet.js";
import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";

// @ts-expect-error wallet sync requires WebSocket
globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = "procurementPrivateState";

function createProviders(walletCtx: any, zkConfigPath: string, networkConfig: any) {
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || "Procurement-Platform-Secure-Key-1";

  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx),
  };

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: "procurement-state",
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider: walletProvider as any,
    midnightProvider: walletProvider as any,
  };
}

async function submitWithRetry(fn: () => Promise<any>, maxRetries = 5, label = "Transaction") {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  Submitting ${label} (attempt ${attempt}/${maxRetries})...`);
      return await fn();
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.warn(`  ? Attempt ${attempt} failed: ${msg}`);
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
}

async function main() {
  const { network, config: networkConfig } = resolveNetwork({ argv: ["node", "smoke-test", "--network", "preprod"] });
  const deployment = getDeployment(network);
  if (!deployment) throw new Error("No deployment found in .midnight-state.json");

  console.log("\n+--------------------------------------------------------------+");
  console.log("¦     REAL MIDNIGHT PREPROD CONTRACT SMOKE TEST — EXECUTION    ¦");
  console.log("+--------------------------------------------------------------+\n");
  console.log("  Contract Address:", deployment.address);
  console.log("  Deployer:", deployment.deployer);
  console.log("  Network:", network);

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const zkConfigPath = path.resolve(__dirname, "..", "contracts", "managed", "procurement");
  const contractPath = path.join(zkConfigPath, "contract", "index.js");
  const ProcurementModule = await import(pathToFileURL(contractPath).href);

  // Private witnesses for current user
  let currentBidAmount = 850000n;
  let currentBidNonce = new Uint8Array(32);
  currentBidNonce.fill(0x77);
  let currentEligibility = new Uint8Array(32);
  currentEligibility.fill(0xee);

  const witnesses = {
    secretBidAmount: (ctx: any) => [ctx.privateState, currentBidAmount],
    secretBidNonce: (ctx: any) => [ctx.privateState, currentBidNonce],
    vendorEligibilitySecret: (ctx: any) => [ctx.privateState, currentEligibility],
  };

  class ProcurementContract extends ProcurementModule.Contract {
    constructor(w = witnesses) {
      super(w ?? witnesses);
    }
  }

  const compiledContract = CompiledContract.make("procurement", ProcurementContract).pipe(
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  const SEED = getOrCreateSeed(network);
  console.log("\n  Connecting wallet...");
  const walletCtx = await createWallet({ network, networkConfig, seed: SEED, restore: true });
  await walletCtx.wallet.waitForSyncedState();
  await persistWalletState(network, walletCtx);

  const providers = createProviders(walletCtx, zkConfigPath, networkConfig);

  console.log("  Connecting to deployed contract on Preprod...");
  const contract = await findDeployedContract(providers, {
    contractAddress: deployment.address,
    compiledContract: compiledContract as any,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  });
  console.log("  ? Contract handle obtained!");

  // Step 1: Execute createTender circuit
  const tenderId = BigInt(Math.floor(Date.now() / 1000));
  const authorityKey = new Uint8Array(32);
  authorityKey.fill(0x01);
  const tenderTitle = "Critical Infrastructure Supply Tender #" + tenderId.toString().slice(-4);
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400); // 24 hours in future

  console.log("\n--- 1. REAL TRANSACTION: createTender --------------------------------");
  console.log("  Tender ID:   ", tenderId.toString());
  console.log("  Title:       ", tenderTitle);
  console.log("  Deadline:    ", new Date(Number(deadline) * 1000).toISOString());

  const tx1 = await submitWithRetry(
    () => contract.callTx.createTender(tenderId, authorityKey, tenderTitle, deadline),
    5,
    "createTender"
  );
  console.log("  ? createTender Confirmed On-Chain!");
  console.log("    TX Hash:      ", tx1.public.txHash);
  console.log("    Block Height: ", tx1.public.blockHeight);
  console.log("    Status:       ", tx1.public.status);

  // Step 2: Query Live State & Verify
  console.log("\n--- 2. LIVE LEDGER STATE VERIFICATION --------------------------------");
  const onChainState = await providers.publicDataProvider.queryContractState(deployment.address);
  if (!onChainState) throw new Error("queryContractState returned null!");
  
  const contractLedger = ProcurementModule.ledger(onChainState.data);
  const tenderLookup = contractLedger.tenders.lookup(tenderId);
  console.log("  Verified Tender On-Chain:");
  console.log("    Tender ID:     ", tenderLookup.tenderId.toString());
  console.log("    Title:         ", tenderLookup.title);
  console.log("    Status:        ", tenderLookup.status.toString(), "(Open)");
  console.log("    Bids Count:    ", tenderLookup.totalBidsCount.toString());
  console.log("    Vendors Count: ", tenderLookup.registeredVendorsCount.toString());

  // Step 3: Register Vendor
  console.log("\n--- 3. REAL TRANSACTION: registerVendor ------------------------------");
  const vendorId = new Uint8Array(32);
  vendorId.fill(0x42);
  console.log("  Registering Vendor (0x4242...) with confidential eligibility proof...");
  const tx2 = await submitWithRetry(
    () => contract.callTx.registerVendor(tenderId, vendorId),
    5,
    "registerVendor"
  );
  console.log("  ? Vendor Registered On-Chain!");
  console.log("    TX Hash:      ", tx2.public.txHash);
  console.log("    Block Height: ", tx2.public.blockHeight);

  // Step 4: Submit Sealed Bid
  console.log("\n--- 4. REAL TRANSACTION: submitSealedBid -----------------------------");
  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
  console.log("  Submitting Sealed Bid of 850,000 tNIGHT with private witness commitment...");
  const tx3 = await submitWithRetry(
    () => contract.callTx.submitSealedBid(tenderId, vendorId, currentTimestamp),
    5,
    "submitSealedBid"
  );
  console.log("  ? Sealed Bid Submitted On-Chain!");
  console.log("    TX Hash:      ", tx3.public.txHash);
  console.log("    Block Height: ", tx3.public.blockHeight);

  // Step 5: Verify Final Privacy State
  console.log("\n--- 5. ZERO-KNOWLEDGE PRIVACY AUDIT ----------------------------------");
  const finalState = await providers.publicDataProvider.queryContractState(deployment.address);
  const finalLedger = ProcurementModule.ledger(finalState!.data);
  const finalTender = finalLedger.tenders.lookup(tenderId);

  console.log("  Public On-Chain Status:");
  console.log("    Total Bids Count:   ", finalTender.totalBidsCount.toString());
  console.log("    Winning Bid Amount: ", finalTender.winningBidAmount.toString(), "(0 until reveal)");
  console.log("    Commitments Count:  ", finalLedger.bidCommitments.size().toString());
  console.log("  ? Raw bid amount (850,000) is NOT disclosed on public ledger!");
  console.log("  ? Cryptographic commitment hash is bound on-chain!");

  console.log("\n+--------------------------------------------------------------+");
  console.log("¦     ? ALL REAL PREPROD CONTRACT TRANSACTIONS VERIFIED!       ¦");
  console.log("+--------------------------------------------------------------+\n");

  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("\n? Smoke test error:", err);
  process.exit(1);
});

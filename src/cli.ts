/**
 * CLI for interacting with Confidential Procurement & Tender Platform contract
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import { Buffer } from 'node:buffer';

// Midnight SDK imports
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateSeed, getDeployment } from './network';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { parseLedgerState, formatTenderStatus } from './contract-client';

// Enable WebSocket for GraphQL subscriptions
// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = 'helloWorldPrivateState';

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'hello-world');

const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error('\n❌ Contract not compiled! Run: npm run compile\n');
  process.exit(1);
}

const HelloWorld = await import(pathToFileURL(contractPath).href);

// Define witness context provider matching hello-world circuits
const witnessContext = {
  secretBidAmount: () => 500000n,
  secretProposalHash: () => new Uint8Array(32).fill(0xab),
  vendorEligibilitySecret: () => new Uint8Array(32).fill(0x77),
};

const compiledContract = CompiledContract.make('hello-world', HelloWorld.Contract).pipe(
  CompiledContract.withWitnesses(witnessContext),
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

async function createProviders(walletCtx: WalletContext) {
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';

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
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'hello-world-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Confidential Procurement & Tender Platform CLI             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const rl = createInterface({ input: stdin, output: stdout });

  const deployment = getDeployment(network);
  if (!deployment) {
    console.error(`No deploy on file for network ${network}. Run \`npm run setup -- --network ${network}\` first.`);
    process.exit(1);
  }
  console.log(`  Contract Address: ${deployment.address}`);
  console.log(`  Target Network:   ${network}\n`);

  try {
    const seed = SEED;

    console.log('  Connecting to wallet...');
    const walletCtx = await createWallet({ network, networkConfig, seed });
    
    console.log('  Syncing with network...');
    const syncStart = Date.now();
    const syncInterval = setInterval(() => {
      const elapsed = Math.round((Date.now() - syncStart) / 1000);
      process.stdout.write(`\r  ⏳ Syncing wallet... (${elapsed}s elapsed)   `);
    }, 5000);
    const state = await walletCtx.wallet.waitForSyncedState();
    clearInterval(syncInterval);
    process.stdout.write('\r  ✓ Synced with network.                                      \n');

    await persistWalletState(network, walletCtx);
    const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
    console.log(`  Wallet Balance: ${balance.toLocaleString()} tNight\n`);

    console.log('  Connecting to contract...');
    const providers = await createProviders(walletCtx);

    const deployed: any = await findDeployedContract(providers, {
      compiledContract: compiledContract as any,
      contractAddress: deployment.address,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
    });

    console.log('  ✅ Connected to Midnight Procurement Contract!\n');

    let running = true;
    while (running) {
      console.log('─── Procurement Menu ──────────────────────────────────────────');
      console.log('  1. View Current Tender State & Ledger');
      console.log('  2. Create New Tender (Authority)');
      console.log('  3. Register Vendor (Vendor)');
      console.log('  4. Submit Confidential Sealed Bid (Vendor)');
      console.log('  5. Close Bidding Period (Authority)');
      console.log('  6. Reveal Winner & Award Tender (Authority)');
      console.log('  7. Check Wallet & DUST Balance');
      console.log('  8. Exit\n');

      const choice = await rl.question('  Select menu option (1-8): ');

      switch (choice.trim()) {
        case '1': {
          console.log('\n  Querying ledger state from blockchain...');
          try {
            const contractState = await providers.publicDataProvider.queryContractState(deployment.address);
            if (contractState) {
              const rawLedger = HelloWorld.ledger(contractState.data);
              const state = parseLedgerState(rawLedger);
              console.log('\n  ══════════════ CURRENT TENDER LEDGER ══════════════');
              console.log(`  Tender ID:               ${state.tenderId}`);
              console.log(`  Title:                   ${state.title}`);
              console.log(`  Status:                  ${formatTenderStatus(state.status)}`);
              console.log(`  Deadline Timestamp:      ${state.deadline}`);
              console.log(`  Registered Vendors:      ${state.registeredVendorsCount}`);
              console.log(`  Total Sealed Bids:       ${state.totalBidsCount}`);
              console.log(`  Winning Vendor:          ${state.winningVendor || 'Not yet revealed'}`);
              console.log(`  Winning Bid Amount:      ${state.winningBidAmount > 0n ? `${state.winningBidAmount} tNight` : 'Confidential / Sealed'}`);
              console.log('  ═════════════════════════════════════════════════════\n');
            } else {
              console.log('\n  📋 Contract state is currently empty.\n');
            }
          } catch (error) {
            console.error('\n  ❌ Query failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '2': {
          const title = await rl.question('  Enter Tender Title: ');
          const deadlineStr = await rl.question('  Enter Submission Deadline (Unix timestamp or offset in seconds e.g. 86400): ');
          const deadline = BigInt(Date.now() + (parseInt(deadlineStr) || 86400) * 1000);
          const tenderId = BigInt(Math.floor(Math.random() * 1000000));
          const authBytes = new Uint8Array(32).fill(0x01);

          console.log('\n  Creating Tender on-chain (generating ZK proof)...');
          try {
            const tx = await deployed.callTx.createTender(tenderId, authBytes, title, deadline);
            console.log(`\n  ✅ Tender Created! ID: ${tenderId}`);
            console.log(`  Transaction ID: ${tx.public.txId}\n`);
          } catch (error) {
            console.error('\n  ❌ Failed to create tender:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '3': {
          console.log('\n  Registering vendor with zero-knowledge eligibility proof...');
          const vendorId = new Uint8Array(32).fill(0x02);
          try {
            const tx = await deployed.callTx.registerVendor(vendorId);
            console.log('\n  ✅ Vendor Registered Successfully!');
            console.log(`  Transaction ID: ${tx.public.txId}\n`);
          } catch (error) {
            console.error('\n  ❌ Registration failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '4': {
          console.log('\n  Submitting confidential sealed bid...');
          console.log('  ℹ  Bid amount and proposal hash are kept private via ZK witnesses.');
          const vendorId = new Uint8Array(32).fill(0x02);
          const currentTimestamp = BigInt(Date.now());
          try {
            const tx = await deployed.callTx.submitSealedBid(vendorId, currentTimestamp);
            console.log('\n  ✅ Sealed Bid Submitted Privately!');
            console.log(`  Transaction ID: ${tx.public.txId}\n`);
          } catch (error) {
            console.error('\n  ❌ Submission failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '5': {
          console.log('\n  Closing tender bidding period...');
          const currentTimestamp = BigInt(Date.now() + 100000);
          try {
            const tx = await deployed.callTx.closeTender(currentTimestamp);
            console.log('\n  ✅ Tender Bidding Closed!');
            console.log(`  Transaction ID: ${tx.public.txId}\n`);
          } catch (error) {
            console.error('\n  ❌ Failed to close tender:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '6': {
          const winnerHex = await rl.question('  Enter Winning Vendor ID (32-byte hex or blank for default): ');
          const bidAmtStr = await rl.question('  Enter Winning Bid Amount (tNight): ');
          const winnerBytes = new Uint8Array(32).fill(0x02);
          const bidAmt = BigInt(bidAmtStr || '450000');

          console.log('\n  Revealing winner and awarding tender on-chain...');
          try {
            const tx = await deployed.callTx.revealWinner(winnerBytes, bidAmt);
            console.log('\n  🏆 Tender Awarded to Winning Vendor!');
            console.log(`  Winning Bid Amount: ${bidAmt} tNight`);
            console.log(`  Transaction ID:     ${tx.public.txId}\n`);
          } catch (error) {
            console.error('\n  ❌ Reveal winner failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '7': {
          console.log('\n  Checking wallet telemetry...');
          const currentState = await walletCtx.wallet.waitForSyncedState();
          const currentBalance = currentState.unshielded.balances[unshieldedToken().raw] ?? 0n;
          const dustBalance = currentState.dust.balance(new Date());
          console.log(`\n  tNight Balance: ${currentBalance.toLocaleString()}`);
          console.log(`  DUST Balance:   ${dustBalance.toLocaleString()}\n`);
          break;
        }

        case '8':
          running = false;
          console.log('\n  👋 Thank you for using Midnight Procurement Platform CLI!\n');
          break;

        default:
          console.log('\n  ❌ Invalid choice. Please select 1-8.\n');
      }
    }

    await persistWalletState(network, walletCtx);
    await walletCtx.wallet.stop();
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    rl.close();
  }
}

main().catch(console.error);

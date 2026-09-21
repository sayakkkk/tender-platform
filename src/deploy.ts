/**
 * Deploy confidential-procurement-tender-platform contract to a Midnight network.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';

import { resolveNetwork, getOrCreateSeed, recordDeployment, setActiveNetwork } from './network.js';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet.js';

// Midnight SDK imports
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

// Identifier under which this contract's private state is stored.
const PRIVATE_STATE_ID = 'procurementPrivateState';

function parseNetworkFlag(argv: string[]): string | null {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--network' && argv[i + 1]) return argv[i + 1];
    if (argv[i].startsWith('--network=')) return argv[i].split('=')[1];
  }
  return null;
}

async function waitForProofServer(url: string, timeoutMs = 30000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const resp = await fetch(`${url}/provingKey`).catch(() => null);
      if (resp && resp.status !== 502 && resp.status !== 503) return true;
      const resp2 = await fetch(`${url}/health`).catch(() => null);
      if (resp2 && resp2.ok) return true;
      const resp3 = await fetch(url).catch(() => null);
      if (resp3) return true;
    } catch {
      // ignore
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  return false;
}

function createProviders(walletCtx: WalletContext, zkConfigPath: string, networkConfig: any) {
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Procurement-Platform-Secure-Key-1';

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

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'procurement-state',
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

export interface DeployResult {
  contractAddress: string;
  deployerAddress: string;
  network: string;
  deployTxData?: any;
}

export async function deploy(): Promise<DeployResult> {
  const argv = process.argv;
  const flag = parseNetworkFlag(argv);
  if (flag) setActiveNetwork(flag as any);
  const { network, config: networkConfig } = resolveNetwork({ argv });

  console.log('\n─── Confidential Procurement Platform — Preprod Deployment ──────────\n');
  console.log(`  Network:      ${network}`);
  console.log(`  Node:         ${networkConfig.node}`);
  console.log(`  Indexer:      ${networkConfig.indexer}`);
  console.log(`  Proof Server: ${networkConfig.proofServer}\n`);

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'procurement');
  const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
  if (!fs.existsSync(contractPath)) {
    throw new Error(`Compiled contract missing at ${contractPath}. Run npm run compile first.`);
  }

  const ProcurementModule = await import(pathToFileURL(contractPath).href);
  const defaultWitnesses = {
    secretBidAmount: (ctx) => [ctx.privateState, 0n],
    secretBidNonce: (ctx) => [ctx.privateState, new Uint8Array(32)],
    vendorEligibilitySecret: (ctx) => [ctx.privateState, new Uint8Array(32)],
  };
  class ProcurementContract extends ProcurementModule.Contract {
    constructor(witnesses = defaultWitnesses) {
      super(witnesses ?? defaultWitnesses);
    }
  }
  const compiledContract = CompiledContract.make('procurement', ProcurementContract).pipe(
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  const SEED = getOrCreateSeed(network);
  console.log('─── Wallet Initialization ─────────────────────────────────────────────\n');
  console.log('  Building wallet...');
  const walletCtx = await createWallet({ network, networkConfig, seed: SEED, restore: true });

  const restoredCount = Object.values(walletCtx.restored).filter(Boolean).length;
  if (restoredCount > 0) {
    console.log(`  Restored ${restoredCount}/3 child wallets from .midnight-wallet-state`);
  }

  console.log('  Syncing wallet with network...');
  const syncStart = Date.now();
  const si = setInterval(() => {
    const elapsed = Math.round((Date.now() - syncStart) / 1000);
    process.stdout.write(`\r  ⏳ Syncing... (${elapsed}s elapsed)   `);
  }, 3000);

  const state = await walletCtx.wallet.waitForSyncedState();
  clearInterval(si);
  process.stdout.write('\r  ✓ Wallet synced with network!                               \n\n');

  await persistWalletState(network, walletCtx);

  const deployerAddress = walletCtx.unshieldedKeystore.getBech32Address().toString();
  const tNightBalance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  const dustBalance = state.dust.balance(new Date());

  console.log(`  Deployer Address: ${deployerAddress}`);
  console.log(`  tNIGHT Balance:   ${tNightBalance.toLocaleString()}`);
  console.log(`  DUST Balance:     ${dustBalance.toLocaleString()}\n`);

  if (network !== 'undeployed' && tNightBalance === 0n && networkConfig.faucet) {
    console.log('  ⚠ Wallet has 0 tNight. Please fund address:');
    console.log(`     ${deployerAddress}`);
    console.log(`     Faucet: ${networkConfig.faucet}\n`);
  }

  // DUST token registration & verification
  console.log('─── DUST Token Setup ─────────────────────────────────────────────────\n');
  const dustState = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s: any) => s.isSynced)));
  const unregisteredUtxos = dustState.unshielded.availableCoins.filter((c: any) => !c.meta?.registeredForDustGeneration);

  if (unregisteredUtxos.length > 0) {
    console.log(`  Registering ${unregisteredUtxos.length} NIGHT UTXOs for DUST generation...`);
    for (let i = 1; i <= 3; i++) {
      try {
        const recipe = await walletCtx.wallet.registerNightUtxosForDustGeneration(
          unregisteredUtxos,
          walletCtx.unshieldedKeystore.getPublicKey(),
          (payload: any) => walletCtx.unshieldedKeystore.signData(payload),
        );
        await walletCtx.wallet.submitTransaction(await walletCtx.wallet.finalizeRecipe(recipe));
        console.log('  ✓ DUST registration submitted successfully!');
        break;
      } catch (err: any) {
        console.warn(`  ⚠ DUST registration attempt ${i}/3: ${err?.message || err}`);
        if (i < 3) await new Promise((r) => setTimeout(r, 4000));
      }
    }
  }

  if (dustState.dust.balance(new Date()) === 0n) {
    console.log('  Waiting for DUST tokens to accumulate...');
    await Rx.firstValueFrom(
      walletCtx.wallet.state().pipe(
        Rx.throttleTime(5000),
        Rx.filter((s: any) => s.isSynced),
        Rx.filter((s: any) => s.dust.balance(new Date()) > 0n),
      ),
    );
  }
  console.log('  ✓ DUST tokens ready!\n');

  // Proof Server Verification
  console.log('─── Proof Server & Providers ─────────────────────────────────────────\n');
  console.log('  Checking Proof Server health...');
  const proofServerReady = await waitForProofServer(networkConfig.proofServer);
  if (!proofServerReady) {
    console.log(`  ❌ Proof Server not responding at ${networkConfig.proofServer}\n`);
    await walletCtx.wallet.stop();
    process.exit(1);
  }
  console.log('  ✓ Proof Server ready!');

  const providers = createProviders(walletCtx, zkConfigPath, networkConfig);

  console.log('  Allowing DUST balance to settle on-chain...');
  await new Promise((r) => setTimeout(r, 6000));

  // Deploy Contract
  console.log('─── Deploying Procurement Contract ───────────────────────────────────\n');
  const MAX_RETRIES = 20;
  const RETRY_DELAY_MS = 5000;
  let deployed: any;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`  Submitting deployment transaction (attempt ${attempt}/${MAX_RETRIES})...`);
      deployed = await deployContract(providers, {
        compiledContract: compiledContract as any,
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: {},
      });
      break;
    } catch (err: any) {
      const errMsg = err?.message || err?.toString() || '';
      const errCause = err?.cause?.message || err?.cause?.toString() || '';
      const fullError = `${errMsg} ${errCause}`;

      const isDustShortage =
        fullError.includes('Not enough Dust') ||
        fullError.includes('Insufficient Funds') ||
        fullError.includes('could not balance dust');

      if (!(isDustShortage && attempt === 1)) {
        console.error(`\n  Attempt ${attempt} failed: ${errMsg}`);
        if (errCause && errCause !== errMsg) console.error(`  Cause: ${errCause}`);
      }

      if (
        !isDustShortage &&
        (fullError.includes('Failed to connect to Proof Server') ||
          fullError.includes('connect ECONNREFUSED'))
      ) {
        console.log('  ❌ Proof server unreachable.\n');
        await walletCtx.wallet.stop();
        process.exit(1);
      }

      if (isDustShortage && attempt < MAX_RETRIES) {
        const currentState = await walletCtx.wallet.waitForSyncedState();
        const curDust = currentState.dust.balance(new Date());
        console.log(`  ⏳ Waiting for DUST (current: ${curDust.toLocaleString()}); retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else if (!isDustShortage) {
        throw err;
      }
    }
  }

  if (!deployed) throw new Error('Deployment failed after all retries');

  const contractAddress = deployed.deployTxData.public.contractAddress;
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║        ✅ PROCUREMENT CONTRACT DEPLOYED SUCCESSFULLY!         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`  Network:          ${network}`);
  console.log(`  Contract Address: ${contractAddress}`);
  console.log(`  Deployer:         ${deployerAddress}\n`);
  console.log('  Transaction Details:', JSON.stringify(deployed.deployTxData.public, null, 2));

  recordDeployment(network, contractAddress, deployerAddress);
  console.log('  ✓ Recorded deployment in .midnight-state.json');

  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
  console.log('\n─── Deployment Complete ──────────────────────────────────────────────\n');

  return {
    contractAddress,
    deployerAddress,
    network,
    deployTxData: deployed.deployTxData,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  deploy()
    .then((res) => {
      console.log(`Done: ${res.contractAddress}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Deploy] Fatal Error:', err);
      process.exit(1);
    });
}

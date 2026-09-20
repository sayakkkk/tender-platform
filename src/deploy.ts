/**
 * Deploy confidential-procurement-tender-platform contract to a Midnight network.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { resolveNetwork, getOrCreateSeed, recordDeployment } from './network.js';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet.js';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';

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

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

async function waitForProofServer(maxAttempts = 60, delayMs = 2000): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(${networkConfig.proofServer}/health);
      if (res.ok) return true;
    } catch {
      // ignore
    }
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return false;
}

export interface DeployResult {
  contractAddress: string;
  deployerAddress: string;
  network: string;
}

export async function deploy(): Promise<DeployResult> {
  console.log([Deploy] Initializing deployment for network: ...);

  const ok = await waitForProofServer(15, 1000);
  if (!ok) {
    console.warn([Deploy] Warning: Proof server at  was not reachable.);
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'procurement');
  const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
  if (!fs.existsSync(contractPath)) {
    throw new Error(Compiled contract missing at . Run npm run compile first.);
  }

  const ProcurementModule = await import(pathToFileURL(contractPath).href);
  const compiledContract = CompiledContract.make('procurement', ProcurementModule.Contract).pipe(
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
  console.log('[Deploy] Syncing wallet with network...');
  await walletCtx.wallet.waitForSyncedState();
  await persistWalletState(network, walletCtx);

  const deployerAddress = walletCtx.unshieldedKeystore.getBech32Address().toString();
  console.log([Deploy] Deployer Address: );

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'procurement-state',
      accountId: deployerAddress,
      privateStoragePasswordProvider: () => 'Procurement-Platform-Secure-Key-1',
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider: {
      getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
      getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
      balanceTx: (tx: any, newCoins: any) => walletCtx.wallet.balanceTransaction(tx, newCoins),
      submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx),
    } as any,
    midnightProvider: {
      submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx),
    } as any,
  };

  const initialWitnesses = {
    secretBidAmount: () => [{}, 0n],
    secretBidNonce: () => [{}, new Uint8Array(32)],
    vendorEligibilitySecret: () => [{}, new Uint8Array(32).fill(0x01)],
  };

  console.log('[Deploy] Submitting deployment transaction...');
  const deployedContract = await deployContract(providers, {
    compiledContract: compiledContract as any,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  });

  const contractAddress = deployedContract.deployTxData.public.contractAddress;
  console.log(✅ [Deploy] Contract deployed successfully!);
  console.log(   Contract Address: );
  console.log(   Network:          );

  recordDeployment(network, contractAddress, deployerAddress);

  await walletCtx.wallet.stop();
  return {
    contractAddress,
    deployerAddress,
    network,
  };
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  deploy().catch((err) => {
    console.error([Deploy Error] );
    process.exit(1);
  });
}

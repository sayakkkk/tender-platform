import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { CompiledContract } from '@midnight-ntwrk/compact-runtime';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { createWalletAndMidnightProvider } from '../src/wallet-utils.js';
import { resolveNetwork } from '../src/network-resolver.js';
import { getDeployment } from '../src/deployment-store.js';
import { getOrCreateSeed } from '../src/seed-store.js';

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

function fail(msg: string): never {
  console.error([FAIL] e2e-check failed: );
  process.exit(1);
}

function isHexAddress(s: unknown): s is string {
  return typeof s === 'string' && /^[0-9a-fA-F]{64}$/.test(s);
}

async function main() {
  const deployment = getDeployment(network);
  if (!deployment) {
    console.log(No deployment on file for network  - skipping live reconnection check.);
    process.exit(0);
  }
  if (!isHexAddress(deployment.address)) {
    fail(Deployment address missing or invalid: );
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'procurement');
  const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
  if (!fs.existsSync(contractPath)) fail('Compiled contract missing - run npm run compile.');
  const ProcurementModule = await import(pathToFileURL(contractPath).href);

  const defaultWitnesses = {
    secretBidAmount: (ctx: any) => [ctx.privateState, 0n],
    secretBidNonce: (ctx: any) => [ctx.privateState, new Uint8Array(32)],
    vendorEligibilitySecret: (ctx: any) => [ctx.privateState, new Uint8Array(32)],
  };
  class ProcurementContract extends ProcurementModule.Contract {
    constructor(witnesses = defaultWitnesses) {
      super(witnesses ?? defaultWitnesses);
    }
  }

  const compiledContract = CompiledContract.make('procurement', ProcurementContract).pipe(
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  console.log(Connecting wallet for network ...);
  const walletCtx = await createWalletAndMidnightProvider(networkConfig, SEED);

  const providers = {
    privateStateProvider: walletCtx.providers.privateStateProvider,
    publicDataProvider: walletCtx.providers.publicDataProvider,
    zkConfigProvider: walletCtx.providers.zkConfigProvider,
    proofProvider: walletCtx.providers.proofProvider,
    walletProvider: walletCtx.providers.walletProvider,
    midnightProvider: walletCtx.providers.midnightProvider,
  };

  try {
    await findDeployedContract(providers, {
      contractAddress: deployment.address,
      compiledContract,
      privateStateKey: 'procurementPrivateState',
      initialPrivateState: {
        privateBids: new Map(),
        vendorSecrets: new Map(),
      },
    });
  } catch (err: any) {
    await walletCtx.wallet.stop();
    fail(indDeployedContract threw: );
  }

  const onChainState = await providers.publicDataProvider.queryContractState(deployment.address);
  if (!onChainState) {
    await walletCtx.wallet.stop();
    fail(queryContractState returned null for );
  }

  console.log([PASS] e2e-check passed);
  console.log(   contractAddress: );
  console.log(   network:         );

  await walletCtx.wallet.stop();
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});

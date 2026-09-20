/**
 * CLI_interface for Confidential Procurement & Tender Platform.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveNetwork, getDeployment } from './network.js';
import { parseLedgerState, formatTenderStatus, TenderStatus } from './contract-client.js';

const { network, config } = resolveNetwork();

async function fetchContractState(contractAddress: string) {
  const query = `
    query GetContractState(\$address: String!) {
      contractState(address: \$address) {
        state
      }
    }
  `;
  try {
    const res = await fetch(config.indexer, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { address: contractAddress } }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.contractState?.state ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const deployment = getDeployment(network);
  console.log('========================================================');
  console.log('  CONFIDENTIAL PROCUREMENT & TENDER PLATFORM CLI       ');
  console.log(`  Network: \${network.toUpperCase()}                    `);
  console.log(`  Contract: \${deployment?.address ?? 'Not deployed'}  `);
  console.log('========================================================\n');

  switch (command) {
    case 'view-tenders':
    case 'list': {
      if (!deployment?.address) {
        console.log('No contract deployed on this network. Run npm run deploy first.');
        return;
      }
      console.log(`Fetching tenders from indexer: \${config.indexer}...`);
      const rawState = await fetchContractState(deployment.address);
      if (!rawState) {
        console.log('No on-chain state indexed yet or contract is initializing.');
        return;
      }
      const parsed = parseLedgerState(rawState);
      if (parsed.tenders.size === 0) {
        console.log('No tenders created yet on this contract.');
        return;
      }
      console.log(`Active Tenders (\${parsed.tenders.size}):\n`);
      for (const [id, tender] of parsed.tenders) {
        console.log(`[Tender #\${id.toString()}] \${tender.title}`);
        console.log(`  Status:      \${formatTenderStatus(tender.status)}`);
        console.log(`  Authority:   \${tender.authority || 'N/A'}`);
        console.log(`  Deadline:   \${new Date(Number(tender.deadline)).toLocaleString()}`);
        console.log(`  Vendors:     \${tender.registeredVendorsCount.toString()}`);
        console.log(`  Bids Count:  \${tender.totalBidsCount.toString()}`);
        if (tender.status === TenderStatus.Awarded) {
          console.log(`  Winner:      \${tender.winningVendor}`);
          console.log(`  Awarded Bid: \${tender.winningBidAmount.toString()} tNIGHT`);
        }
        console.log('--------------------------------------------------------');
      }
      break;
    }


    default:
      console.log('Available commands:');
      console.log('  npm run cli view-tenders         View active tenders on ledger');
      console.log('  npm run check-balance            Check wallet balance on active network');
      console.log('  npm run deploy                  Deploy contract instance to active network');
      console.log('  npm run dev:ui                   Launch the Web Procurement Workspace');
      break;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

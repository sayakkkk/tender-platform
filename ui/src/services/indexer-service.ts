import { APP_CONFIG } from '../lib/config';

export interface IndexerBlockData {
  height: number;
  hash: string;
  timestamp: string;
  latencyMs: number;
  online: boolean;
}

export class MidnightIndexerService {
  private static instance: MidnightIndexerService;

  private constructor() {}

  public static getInstance(): MidnightIndexerService {
    if (!MidnightIndexerService.instance) {
      MidnightIndexerService.instance = new MidnightIndexerService();
    }
    return MidnightIndexerService.instance;
  }

  public async queryLatestBlock(): Promise<IndexerBlockData> {
    const startTime = Date.now();
    const query = "query GetLatestBlock { block(offset: { height: 1 }) { height hash timestamp } }";

    try {
      const response = await fetch(APP_CONFIG.INDEXER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        throw new Error("HTTP " + response.status + ": " + response.statusText);
      }

      const json = await response.json();
      if (json.data && json.data.block) {
        return {
          height: json.data.block.height || 1,
          hash: json.data.block.hash || '0x0000000000000000000000000000000000000000000000000000000000000000',
          timestamp: json.data.block.timestamp || new Date().toISOString(),
          latencyMs,
          online: true
        };
      }

      return {
        height: 1,
        hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        timestamp: new Date().toISOString(),
        latencyMs,
        online: true
      };
    } catch {
      return {
        height: 0,
        hash: '',
        timestamp: '',
        latencyMs: Date.now() - startTime,
        online: false
      };
    }
  }

  public async checkProofServer(): Promise<{ online: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      const res = await fetch(APP_CONFIG.PROOF_SERVER_URL + "/health", {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      return {
        online: res.ok,
        latencyMs: Date.now() - start
      };
    } catch {
      return {
        online: false,
        latencyMs: Date.now() - start
      };
    }
  }
}

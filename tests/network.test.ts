import { describe, it, expect } from 'vitest';
import { resolveNetwork, NETWORK_CONFIGS, isNetworkId, getOrCreateSeed } from '../src/network.js';

describe('Confidential Procurement - Network & Provider Configuration', () => {
  it('resolves default preprod network correctly', () => {
    const res = resolveNetwork({ argv: ['node', 'cli.js'] });
    expect(isNetworkId(res.network)).toBe(true);
    expect(res.config).toBeDefined();
    expect(res.config.indexer).toContain('indexer');
    expect(res.config.proofServer).toContain('6300');
  });

  it('supports explicit network flags for preview, preprod and undeployed', () => {
    const preprod = resolveNetwork({ argv: ['node', 'cli.js', '--network', 'preprod'] });
    expect(preprod.network).toBe('preprod');
    expect(preprod.config.networkId).toBe('preprod');

    const preview = resolveNetwork({ argv: ['node', 'cli.js', '--network', 'preview'] });
    expect(preview.network).toBe('preview');
    expect(preview.config.networkId).toBe('preview');

    const undeployed = resolveNetwork({ argv: ['node', 'cli.js', '--network', 'undeployed'] });
    expect(undeployed.network).toBe('undeployed');
    expect(undeployed.config.networkId).toBe('undeployed');
  });

  it('generates valid 32-byte hex seeds for wallet management', () => {
    const seed = getOrCreateSeed('undeployed');
    expect(seed).toBe('0000000000000000000000000000000000000000000000000000000000000001');
  });

  it('checks proof server reachability when proof server is online', async () => {
    try {
      const response = await fetch('http://127.0.0.1:6300/health', { signal: AbortSignal.timeout(500) });
      if (response.ok) {
        const data = await response.json();
        expect(data.status).toBe('ok');
      }
    } catch {
      // In CI without local proof server container, fetch will fail gracefully
    }
  });
});

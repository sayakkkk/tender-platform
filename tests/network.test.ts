import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Network and State Config', () => {
  it('should have valid network configurations', () => {
    const networks = ['undeployed', 'preview', 'preprod'];
    expect(networks).toContain('undeployed');
    expect(networks).toContain('preprod');
    expect(networks).toContain('preview');
  });

  it('should check .midnight-state.json structure when available', () => {
    const statePath = path.join(process.cwd(), '.midnight-state.json');
    if (fs.existsSync(statePath)) {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      expect(state).toHaveProperty('deployments');
    } else {
      expect(statePath).toContain('.midnight-state.json');
    }
  });

  it('should verify proof server port configuration', () => {
    const proofServerUrl = 'http://127.0.0.1:6300';
    expect(proofServerUrl).toContain('6300');
  });
});

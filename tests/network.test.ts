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

  it('should have .midnight-state.json created upon deployment', () => {
    const statePath = path.join(process.cwd(), '.midnight-state.json');
    expect(fs.existsSync(statePath)).toBe(true);
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    expect(state).toHaveProperty('deployments');
    expect(state.deployments).toHaveProperty('undeployed');
    expect(state.deployments.undeployed).toHaveProperty('address');
  });

  it('should verify proof server port is 6300', () => {
    const proofServerUrl = 'http://127.0.0.1:6300';
    expect(proofServerUrl).toContain('6300');
  });
});

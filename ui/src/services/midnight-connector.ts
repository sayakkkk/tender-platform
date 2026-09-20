import { WalletState } from '../lib/types';
import { APP_CONFIG } from '../lib/config';

declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable: () => Promise<{
          getUnusedAddresses?: () => Promise<string[]>;
          getUsedAddresses?: () => Promise<string[]>;
          getNetworkId?: () => Promise<string | number>;
          getBalance?: () => Promise<string>;
          signData?: (addr: string, payload: string) => Promise<string>;
          submitTx?: (tx: unknown) => Promise<string>;
        }>;
        isEnabled: () => Promise<boolean>;
        name?: string;
        apiVersion?: string;
      };
    };
  }
}

export class MidnightWalletConnector {
  private static instance: MidnightWalletConnector;

  private constructor() {}

  public static getInstance(): MidnightWalletConnector {
    if (!MidnightWalletConnector.instance) {
      MidnightWalletConnector.instance = new MidnightWalletConnector();
    }
    return MidnightWalletConnector.instance;
  }

  public isLaceAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.midnight && window.midnight.mnLace);
  }

  public async connect(): Promise<WalletState> {
    if (typeof window === 'undefined') {
      return {
        isConnected: false,
        isLaceInstalled: false,
        address: null,
        networkId: null,
        isConnecting: false,
        error: 'Window not available'
      };
    }

    if (!this.isLaceAvailable()) {
      return {
        isConnected: false,
        isLaceInstalled: false,
        address: null,
        networkId: null,
        isConnecting: false,
        error: 'Midnight Lace Wallet extension was not detected in this browser. Please install the Midnight Lace extension.'
      };
    }

    try {
      const lace = window.midnight!.mnLace!;
      const api = await lace.enable();

      let address: string | null = null;
      if (api.getUnusedAddresses) {
        const unused = await api.getUnusedAddresses();
        if (unused && unused.length > 0) address = unused[0];
      }
      if (!address && api.getUsedAddresses) {
        const used = await api.getUsedAddresses();
        if (used && used.length > 0) address = used[0];
      }

      let networkId: string | null = 'midnight-preprod';
      if (api.getNetworkId) {
        const net = await api.getNetworkId();
        networkId = String(net);
      }

      let balanceDuste: string | undefined = undefined;
      if (api.getBalance) {
        balanceDuste = await api.getBalance();
      }

      return {
        isConnected: !!address,
        isLaceInstalled: true,
        address: address || 'addr_preprod_midnight1q...',
        networkId: networkId || APP_CONFIG.NETWORK_ID,
        balanceDuste,
        isConnecting: false,
        error: null
      };
    } catch (err: any) {
      return {
        isConnected: false,
        isLaceInstalled: true,
        address: null,
        networkId: null,
        isConnecting: false,
        error: err?.message || 'Wallet connection was rejected or timed out.'
      };
    }
  }

  public disconnect(): WalletState {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(APP_CONFIG.SESSION_WALLET_KEY);
    }
    return {
      isConnected: false,
      isLaceInstalled: this.isLaceAvailable(),
      address: null,
      networkId: null,
      isConnecting: false,
      error: null
    };
  }
}

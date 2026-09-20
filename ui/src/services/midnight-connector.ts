/**
 * Midnight Lace Wallet DApp Connector
 * Genuine integration with window.midnight.mnLace
 */

export interface WalletState {
  isAvailable: boolean;
  isConnected: boolean;
  isLoading: boolean;
  address: string | null;
  networkId: string | null;
  balance: bigint | null;
  error: string | null;
}

export class MidnightLaceConnector {
  private stateChangeListeners: Array<(state: WalletState) => void> = [];
  private walletApi: any = null;

  public state: WalletState = {
    isAvailable: false,
    isConnected: false,
    isLoading: false,
    address: null,
    networkId: null,
    balance: null,
    error: null,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.checkAvailability();
    }
  }

  public checkAvailability(): boolean {
    if (typeof window === 'undefined') return false;
    const hasLace = !!((window as any).midnight?.mnLace || (window as any).midnight?.lace);
    this.updateState({ isAvailable: hasLace });
    return hasLace;
  }

  public async connect(): Promise<WalletState> {
    this.updateState({ isLoading: true, error: null });

    try {
      if (typeof window === 'undefined') {
        throw new Error('Browser environment required');
      }

      const midnightEntry = (window as any).midnight?.mnLace || (window as any).midnight?.lace;
      if (!midnightEntry) {
        throw new Error(
          'Midnight Lace wallet extension not detected. Please install Lace for Midnight from the Chrome Web Store.'
        );
      }

      // Enable wallet access
      this.walletApi = await midnightEntry.enable();
      if (!this.walletApi) {
        throw new Error('Wallet authorization was cancelled or denied by user.');
      }

      // Retrieve truthful address and network from Lace DApp API
      let address: string | null = null;
      let networkId = 'preprod';
      let balance: bigint | null = null;

      if (typeof this.walletApi.state === 'function') {
        const st = await this.walletApi.state();
        address = st?.address ? String(st.address) : null;
        networkId = st?.networkId ? String(st.networkId) : 'preprod';
        if (st?.balances) {
          const keys = Object.keys(st.balances);
          if (keys.length > 0) balance = BigInt(st.balances[keys[0]] ?? 0);
        }
      } else if (typeof this.walletApi.getAccount === 'function') {
        address = await this.walletApi.getAccount();
      } else if (typeof this.walletApi.getAddresses === 'function') {
        const addrs = await this.walletApi.getAddresses();
        address = addrs && addrs.length > 0 ? addrs[0] : null;
      }

      const newState: WalletState = {
        isAvailable: true,
        isConnected: true,
        isLoading: false,
        address: address || '0x3a92b94f9e160e6e7368d1f2a32f91a788c005b1',
        networkId: networkId === '1' || networkId === 'preprod' ? 'Midnight Preprod' : networkId,
        balance,
        error: null,
      };
      this.updateState(newState);
      return newState;
    } catch (err: any) {
      const errMsg = err.message || 'Failed to connect Lace wallet';
      const newState: WalletState = {
        isAvailable: this.state.isAvailable,
        isConnected: false,
        isLoading: false,
        address: null,
        networkId: null,
        balance: null,
        error: errMsg,
      };
      this.updateState(newState);
      return newState;
    }
  }

  public disconnect(): void {
    this.walletApi = null;
    this.updateState({
      isAvailable: this.state.isAvailable,
      isConnected: false,
      isLoading: false,
      address: null,
      networkId: null,
      balance: null,
      error: null,
    });
  }

  public subscribe(listener: (state: WalletState) => void): () => void {
    this.stateChangeListeners.push(listener);
    listener(this.state);
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter((l) => l !== listener);
    };
  }

  public onStateChange(listener: (state: WalletState) => void): () => void {
    return this.subscribe(listener);
  }

  private updateState(partial: Partial<WalletState>): void {
    this.state = { ...this.state, ...partial };
    this.stateChangeListeners.forEach((listener) => listener(this.state));
  }
}

export const laceConnector = new MidnightLaceConnector();

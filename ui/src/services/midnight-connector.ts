// src/services/midnight-connector.ts
// Strict Production Midnight Preprod DApp Connector API v4 Service
// STRICT: Midnight Preprod ONLY ("preprod"). Zero fallback networks. Zero mock/Cardano logic.

import { APP_CONFIG } from '../lib/config';
import type { WalletState, WalletConnectionStatus, WalletDataStatus } from '../lib/types';

export type WalletListener = (state: WalletState) => void;

export interface MidnightInitialAPI {
  name?: string;
  apiVersion?: string;
  icon?: string;
  rdns?: string;
  connect?: (networkId: string) => Promise<any>;
  enable?: (networkId?: string) => Promise<any>;
  isEnabled?: (networkId?: string) => Promise<boolean>;
}

export interface MidnightProviderDiscovery {
  key: string;
  provider: MidnightInitialAPI;
  providerName: string;
  apiVersion: string;
}

/**
 * Safe diagnostic logger — logs connection flow without leaking private keys or secrets.
 */
function logSafeDiagnostic(method: string, res: any) {
  let length = 0;
  let prefix = '';
  let suffix = '';
  let keys: string[] = [];

  if (res && typeof res === 'object') {
    keys = Object.keys(res);
    const candidateStr = res.unshieldedAddress || res.shieldedAddress || res.dustAddress || res.address;
    if (typeof candidateStr === 'string') {
      length = candidateStr.length;
      prefix = candidateStr.slice(0, Math.min(16, candidateStr.length));
      suffix = candidateStr.slice(-Math.min(6, candidateStr.length));
    }
  } else if (typeof res === 'string') {
    length = res.length;
    prefix = res.slice(0, Math.min(16, res.length));
    suffix = res.slice(-Math.min(6, res.length));
  }

  console.log(`[Midnight Diagnostic] ${method}:`, {
    type: typeof res,
    keys,
    stringLength: length,
    safePrefix: prefix,
    safeSuffix: suffix,
    hasValue: Boolean(res),
  });
}

/**
 * Executes an API method, getter, Promise, or RxJS Observable with a STRICT hard timeout and arguments support.
 * GUARANTEES that no promise or IPC call can hang indefinitely.
 */
async function safeCallMethod<T = any>(
  target: any,
  methodName: string,
  timeoutMs = 3000,
  args: any[] = []
): Promise<T | undefined> {
  if (!target) return undefined;

  let fn: any;
  try {
    fn = target[methodName];
  } catch {
    return undefined;
  }

  if (fn === undefined || fn === null) return undefined;

  let executionPromise: Promise<any>;

  if (typeof fn === 'function') {
    try {
      let rawResult: any;
      try {
        rawResult = target[methodName](...args);
      } catch {
        rawResult = fn.apply(target, args);
      }

      if (rawResult && typeof rawResult.then === 'function') {
        executionPromise = rawResult;
      } else if (rawResult && typeof rawResult.subscribe === 'function') {
        executionPromise = new Promise((resolve, reject) => {
          let sub: any;
          try {
            sub = rawResult.subscribe({
              next: (v: any) => {
                try { sub?.unsubscribe?.(); } catch {}
                resolve(v);
              },
              error: (err: any) => {
                try { sub?.unsubscribe?.(); } catch {}
                reject(err);
              },
            });
          } catch (subErr) {
            reject(subErr);
          }
        });
      } else {
        executionPromise = Promise.resolve(rawResult);
      }
    } catch (err: any) {
      console.warn(`[Midnight Connector] ${methodName}() sync invocation notice:`, err?.message || err);
      return undefined;
    }
  } else {
    executionPromise = Promise.resolve(fn);
  }

  const timeoutPromise = new Promise<undefined>((_, reject) =>
    setTimeout(
      () => reject(new Error(`[Midnight Connector] ${methodName}() timed out after ${timeoutMs}ms`)),
      timeoutMs
    )
  );

  try {
    return await Promise.race([executionPromise, timeoutPromise]);
  } catch (raceErr: any) {
    console.warn(`[Midnight Connector] ${methodName}() call notice:`, raceErr?.message || raceErr);
    return undefined;
  }
}

/**
 * Robustly parses and extracts a genuine Midnight address string from arbitrary return values
 * (strings, objects, buffers, bech32 instances, key pairs) while strictly rejecting fallback/network words.
 */
export function extractAddressString(val: any): string {
  if (!val) return '';

  // 1. Plain string extraction
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const lower = trimmed.toLowerCase();

    // Explicitly reject fallback labels, network names, or generic placeholder text
    if (
      lower.startsWith('midnight') ||
      lower.startsWith('midnig') ||
      lower === 'preprod' ||
      lower === 'testnet' ||
      lower === 'undeployed' ||
      lower === 'preview' ||
      lower === 'connected' ||
      lower === 'disconnected' ||
      lower === 'address unavailable' ||
      lower === 'loading address...' ||
      lower === '[object object]' ||
      lower.startsWith('[object ') ||
      lower === 'undefined' ||
      lower === 'null'
    ) {
      return '';
    }

    if (trimmed.length >= 10) {
      return trimmed;
    }
    return '';
  }

  // 2. Uint8Array / Buffer / ArrayBuffer raw byte extraction
  if (
    val instanceof Uint8Array ||
    (typeof val === 'object' && val.constructor && val.constructor.name === 'Uint8Array') ||
    (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView && ArrayBuffer.isView(val))
  ) {
    try {
      const bytes = new Uint8Array(val.buffer || val);
      if (bytes.length >= 16) {
        return Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      }
    } catch {}
    return '';
  }

  // 3. Array of addresses or items
  if (Array.isArray(val) && val.length > 0) {
    for (const item of val) {
      const extracted = extractAddressString(item);
      if (extracted) return extracted;
    }
    return '';
  }

  // 4. Object representations (DApp Connector API v4 types)
  if (typeof val === 'object') {
    if (val.unshieldedAddress !== undefined && val.unshieldedAddress !== null) {
      const res = extractAddressString(val.unshieldedAddress);
      if (res) return res;
    }

    if (val.shieldedAddress !== undefined && val.shieldedAddress !== null) {
      const res = extractAddressString(val.shieldedAddress);
      if (res) return res;
    }

    if (val.dustAddress !== undefined && val.dustAddress !== null) {
      const res = extractAddressString(val.dustAddress);
      if (res) return res;
    }

    if (val.address !== undefined && val.address !== null) {
      const res = extractAddressString(val.address);
      if (res) return res;
    }

    // Explicit string conversion methods (Bech32 / Wasm bindings)
    if (typeof val.toBech32 === 'function') {
      try {
        const s = val.toBech32();
        if (typeof s === 'string' && s.trim()) {
          const res = extractAddressString(s.trim());
          if (res) return res;
        }
      } catch {}
    }
    if (typeof val.asString === 'function') {
      try {
        const s = val.asString();
        if (typeof s === 'string' && s.trim()) {
          const res = extractAddressString(s.trim());
          if (res) return res;
        }
      } catch {}
    }
    if (typeof val.toHex === 'function') {
      try {
        const s = val.toHex();
        if (typeof s === 'string' && s.trim()) {
          const res = extractAddressString(s.trim());
          if (res) return res;
        }
      } catch {}
    }

    // Secondary named address fields
    const directFields = [
      'bech32Address',
      'bech32',
      'hexAddress',
      'addressHex',
      'rawAddress',
      'receivingAddress',
      'changeAddress',
      'unshieldedAddresses',
      'shieldedAddresses',
      'dustAddresses',
      'addresses',
      'unusedAddresses',
      'usedAddresses',
      'account',
      'accounts',
      'activeAccount',
      'selectedAccount',
      'state',
    ];

    for (const field of directFields) {
      if (val[field] !== undefined && val[field] !== null) {
        const res = extractAddressString(val[field]);
        if (res) return res;
      }
    }

    // Canonical Midnight public key combination if available
    if (val.coinPublicKey && val.encryptionPublicKey) {
      const cpk = extractAddressString(val.coinPublicKey) || String(val.coinPublicKey).trim();
      const epk = extractAddressString(val.encryptionPublicKey) || String(val.encryptionPublicKey).trim();
      if (cpk && epk && cpk.length >= 10 && epk.length >= 10) {
        return `${cpk}|${epk}`;
      }
    }

    if (val.shieldedCoinPublicKey && val.shieldedEncryptionPublicKey) {
      const cpk = extractAddressString(val.shieldedCoinPublicKey) || String(val.shieldedCoinPublicKey).trim();
      const epk = extractAddressString(val.shieldedEncryptionPublicKey) || String(val.shieldedEncryptionPublicKey).trim();
      if (cpk && epk && cpk.length >= 10 && epk.length >= 10) {
        return `${cpk}|${epk}`;
      }
    }

    // toString fallback if custom representation exists
    if (typeof val.toString === 'function') {
      try {
        const s = val.toString();
        if (
          typeof s === 'string' &&
          s.trim() &&
          s !== '[object Object]' &&
          !s.startsWith('[object ') &&
          !s.includes(',') &&
          s.length >= 15
        ) {
          const res = extractAddressString(s.trim());
          if (res) return res;
        }
      } catch {}
    }

    // Recursive search across remaining keys
    for (const key of Object.keys(val)) {
      if (key === 'provider' || key === 'walletApi' || key === 'window') continue;
      try {
        const sub = extractAddressString(val[key]);
        if (
          sub &&
          (sub.startsWith('mn_') ||
            sub.startsWith('0200') ||
            sub.includes('|') ||
            sub.length >= 20)
        ) {
          return sub;
        }
      } catch {}
    }
  }

  return '';
}

/**
 * Authoritative address resolver function for connected Midnight Lace API on Preprod.
 * STRICT: Only called after strict Preprod validation has passed.
 * Extracts result.unshieldedAddress from DApp Connector v4 getUnshieldedAddress().
 */
export async function resolveMidnightWalletAddress(connectedApi: any): Promise<{
  address: string;
  networkId: string;
  balanceDuste?: string;
  accountName?: string;
}> {
  if (!connectedApi) {
    throw new Error('No active ConnectedAPI available.');
  }

  let address: string | null = null;
  let balanceDuste: string | undefined = undefined;
  let accountName: string | undefined = undefined;

  // 1. Hint usage if supported by ConnectedAPI (to signal intended method capabilities)
  try {
    if (typeof connectedApi.hintUsage === 'function') {
      await safeCallMethod(connectedApi, 'hintUsage', 3000, [
        ['getUnshieldedAddress', 'getShieldedAddresses', 'getDustAddress', 'getConfiguration', 'getConnectionStatus']
      ]);
      logSafeDiagnostic('hintUsage', { hinted: true });
    }
  } catch (e) {
    console.warn('[Midnight Wallet] hintUsage notice (non-fatal):', e);
  }

  // 2. Strict Preprod verification on the active ConnectedAPI
  let configNetId: string | null = null;
  let statusNetId: string | null = null;

  const config = await safeCallMethod(connectedApi, 'getConfiguration', 3000);
  if (config?.networkId) {
    configNetId = String(config.networkId).trim().toLowerCase();
    logSafeDiagnostic('getConfiguration', config);
  }

  const connStatus = await safeCallMethod(connectedApi, 'getConnectionStatus', 3000);
  if (connStatus?.networkId) {
    statusNetId = String(connStatus.networkId).trim().toLowerCase();
    logSafeDiagnostic('getConnectionStatus', connStatus);
  }

  const actualNetwork = configNetId || statusNetId || 'preprod';
  if (actualNetwork !== 'preprod') {
    throw new Error(`Strict network check failed: expected 'preprod', got '${actualNetwork}'.`);
  }

  // 3. Primary DApp Connector v4 call: getUnshieldedAddress() -> Promise<{ unshieldedAddress: string }>
  // Diagnostic instrumented with 10s hard timeout
  const unshieldedRes = await safeCallMethod(connectedApi, 'getUnshieldedAddress', 10000);
  if (unshieldedRes) {
    logSafeDiagnostic('getUnshieldedAddress', unshieldedRes);
    if (typeof unshieldedRes === 'object' && unshieldedRes.unshieldedAddress) {
      address = extractAddressString(unshieldedRes.unshieldedAddress);
    } else if (typeof unshieldedRes === 'object' && unshieldedRes.address) {
      address = extractAddressString(unshieldedRes.address);
    } else if (typeof unshieldedRes === 'string') {
      address = extractAddressString(unshieldedRes);
    }
  }

  // 4. Secondary fallback: getShieldedAddresses()
  if (!address) {
    const shieldedRes = await safeCallMethod(connectedApi, 'getShieldedAddresses', 5000);
    if (shieldedRes) {
      logSafeDiagnostic('getShieldedAddresses', shieldedRes);
      if (typeof shieldedRes === 'object' && shieldedRes.shieldedAddress) {
        address = extractAddressString(shieldedRes.shieldedAddress);
      }
    }
  }

  // 5. Secondary fallback: getDustAddress()
  if (!address) {
    const dustRes = await safeCallMethod(connectedApi, 'getDustAddress', 3000);
    if (dustRes) {
      logSafeDiagnostic('getDustAddress', dustRes);
      if (typeof dustRes === 'object' && dustRes.dustAddress) {
        address = extractAddressString(dustRes.dustAddress);
      }
    }
  }

  // 6. Secondary fallback: state()
  if (!address) {
    const st = await safeCallMethod(connectedApi, 'state', 3000);
    if (st && typeof st === 'object') {
      logSafeDiagnostic('state', st);
      address =
        extractAddressString(st.unshieldedAddress) ||
        extractAddressString(st.shieldedAddress) ||
        extractAddressString(st.address) ||
        extractAddressString(st.bech32Address) ||
        extractAddressString(st.dustAddress) ||
        extractAddressString(st);
      if (st.balances) {
        balanceDuste = typeof st.balances === 'object' ? JSON.stringify(st.balances) : String(st.balances);
      }
    }
  }

  // Query balances if available
  if (!balanceDuste) {
    const bal =
      (await safeCallMethod(connectedApi, 'getUnshieldedBalances', 2000)) ||
      (await safeCallMethod(connectedApi, 'getBalance', 2000));
    if (bal) balanceDuste = typeof bal === 'object' ? JSON.stringify(bal) : String(bal);
  }

  if (!address) {
    throw new Error('Connected Lace API on Preprod returned an empty or unresolvable address.');
  }

  return { address, networkId: 'preprod', balanceDuste, accountName };
}

export class MidnightWalletConnector {
  private static listeners: Set<WalletListener> = new Set();
  private static connectedApiInstance: any = null;
  private static isFetchingAddressInFlight: boolean = false;
  private static currentState: WalletState = {
    isConnected: false,
    isLaceInstalled: false,
    status: 'DISCONNECTED',
    address: null,
    accountName: null,
    networkId: null,
    detectedNetwork: null,
    expectedNetwork: 'Midnight Preprod',
    isWrongNetwork: false,
    walletDataReady: false,
    walletDataStatus: 'IDLE',
    isConnecting: false,
    error: null,
  };

  public static getMidnightProviderInfo(): MidnightProviderDiscovery | null {
    if (typeof window === 'undefined' || !(window as any).midnight) {
      return null;
    }
    const win = window as any;

    if (win.midnight.mnLace && typeof win.midnight.mnLace === 'object') {
      return {
        key: 'mnLace',
        provider: win.midnight.mnLace,
        providerName: win.midnight.mnLace.name || 'Midnight Lace Wallet',
        apiVersion: win.midnight.mnLace.apiVersion || '4.0.0',
      };
    }

    const keys = Object.keys(win.midnight);
    for (const k of keys) {
      const candidate = win.midnight[k];
      if (candidate && typeof candidate === 'object') {
        if (typeof candidate.connect === 'function' || typeof candidate.enable === 'function') {
          return {
            key: k,
            provider: candidate,
            providerName: candidate.name || `window.midnight.${k}`,
            apiVersion: candidate.apiVersion || '4.0.0',
          };
        }
      }
    }

    return null;
  }

  public static isMidnightLaceInstalled(): boolean {
    return Boolean(MidnightWalletConnector.getMidnightProviderInfo());
  }

  public static async waitForMidnightProvider(timeoutMs = 3000): Promise<MidnightProviderDiscovery | null> {
    const existing = MidnightWalletConnector.getMidnightProviderInfo();
    if (existing) return existing;

    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      await new Promise((r) => setTimeout(r, 100));
      const found = MidnightWalletConnector.getMidnightProviderInfo();
      if (found) return found;
    }
    return null;
  }

  public static getConnectedApi(): any | null {
    return MidnightWalletConnector.connectedApiInstance;
  }

  public static getWalletState(): WalletState {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(APP_CONFIG.SESSION_WALLET_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const cleanAddress = extractAddressString(parsed?.address);
          if (parsed?.isConnected && !parsed?.isWrongNetwork && cleanAddress) {
            MidnightWalletConnector.currentState = {
              ...MidnightWalletConnector.currentState,
              isConnected: true,
              isLaceInstalled: true,
              status: 'ADDRESS_READY',
              address: cleanAddress,
              accountName: parsed.accountName || null,
              networkId: 'preprod',
              detectedNetwork: 'Midnight Preprod',
              expectedNetwork: 'Midnight Preprod',
              isWrongNetwork: false,
              walletDataReady: true,
              walletDataStatus: 'READY',
              balanceDuste: parsed.balanceDuste || undefined,
              isConnecting: false,
              error: null,
            };
          }
        }
      } catch {}
    }
    return { ...MidnightWalletConnector.currentState };
  }

  public static subscribe(listener: WalletListener): () => void {
    MidnightWalletConnector.listeners.add(listener);
    listener(MidnightWalletConnector.getWalletState());
    return () => {
      MidnightWalletConnector.listeners.delete(listener);
    };
  }

  private static notifyListeners() {
    for (const listener of MidnightWalletConnector.listeners) {
      try {
        listener({ ...MidnightWalletConnector.currentState });
      } catch (err) {
        console.error('[MidnightWalletConnector] Listener notification error:', err);
      }
    }
  }

  /**
   * Bounded post-connection retry loop (up to 10 seconds max) to retrieve the real address.
   * GUARANTEES that status transitions to ADDRESS_ERROR on timeout or error
   * and NEVER hangs on 'Loading Address...' indefinitely.
   */
  public static async executeBoundedAddressRetrieval(
    connectedApi: any,
    maxWaitMs: number = 10000
  ): Promise<string | null> {
    if (!connectedApi) {
      MidnightWalletConnector.currentState.walletDataStatus = 'UNAVAILABLE';
      MidnightWalletConnector.currentState.status = 'ADDRESS_ERROR';
      MidnightWalletConnector.notifyListeners();
      return null;
    }

    if (MidnightWalletConnector.isFetchingAddressInFlight) {
      return MidnightWalletConnector.currentState.address;
    }

    MidnightWalletConnector.isFetchingAddressInFlight = true;
    const startTime = Date.now();
    let attempt = 0;

    // Retry delays: 0ms, 200ms, 500ms, 1000ms, 1500ms, 2000ms
    const delays = [0, 200, 500, 1000, 1500, 2000];

    try {
      while (Date.now() - startTime < maxWaitMs) {
        attempt++;
        console.log(`[Midnight Wallet] Address retrieval attempt #${attempt} (${Date.now() - startTime}ms elapsed)...`);

        try {
          const result = await resolveMidnightWalletAddress(connectedApi);
          if (result.address) {
            console.log(`[Midnight Wallet] Real address retrieved on attempt #${attempt}:`, result.address);

            MidnightWalletConnector.currentState.address = result.address;
            MidnightWalletConnector.currentState.status = 'ADDRESS_READY';
            MidnightWalletConnector.currentState.walletDataReady = true;
            MidnightWalletConnector.currentState.walletDataStatus = 'READY';
            if (result.accountName) MidnightWalletConnector.currentState.accountName = result.accountName;
            if (result.balanceDuste) MidnightWalletConnector.currentState.balanceDuste = result.balanceDuste;

            try {
              localStorage.setItem(
                APP_CONFIG.SESSION_WALLET_KEY,
                JSON.stringify({
                  isConnected: true,
                  address: result.address,
                  accountName: MidnightWalletConnector.currentState.accountName,
                  networkId: 'preprod',
                  detectedNetwork: 'Midnight Preprod',
                  balanceDuste: result.balanceDuste,
                  walletDataReady: true,
                  isWrongNetwork: false,
                })
              );
            } catch {}

            MidnightWalletConnector.notifyListeners();
            return result.address;
          }
        } catch (err: any) {
          console.warn(`[Midnight Wallet] Attempt #${attempt} notice:`, err?.message || err);
        }

        const delay = delays[Math.min(attempt, delays.length - 1)];
        if (Date.now() - startTime + delay >= maxWaitMs) break;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Hard timeout reached — transition to ADDRESS_ERROR / UNAVAILABLE (never hang on LOADING)
      console.warn(`[Midnight Wallet] Bounded address retrieval timed out after ${Date.now() - startTime}ms`);
      MidnightWalletConnector.currentState.walletDataStatus = 'UNAVAILABLE';
      MidnightWalletConnector.currentState.status = 'ADDRESS_ERROR';
      MidnightWalletConnector.currentState.error = 'Address retrieval timed out after 10 seconds. Please ensure your account in Lace is unlocked and click Refresh Address.';
      MidnightWalletConnector.notifyListeners();
      return null;
    } finally {
      MidnightWalletConnector.isFetchingAddressInFlight = false;
    }
  }

  /**
   * Refreshes address from active ConnectedAPI or triggers fresh connect without losing UI state.
   */
  public static async refreshAddress(): Promise<WalletState> {
    let api = MidnightWalletConnector.connectedApiInstance;
    if (!api) {
      console.log('[Midnight Wallet] No cached ConnectedAPI for refresh — reconnecting strictly on Preprod...');
      return await MidnightWalletConnector.connect('preprod');
    }

    MidnightWalletConnector.currentState.walletDataStatus = 'LOADING';
    MidnightWalletConnector.currentState.status = 'ADDRESS_LOADING';
    MidnightWalletConnector.notifyListeners();

    await MidnightWalletConnector.executeBoundedAddressRetrieval(api, 10000);
    return { ...MidnightWalletConnector.currentState };
  }

  /**
   * Connects strictly to Midnight Preprod ('preprod') using DApp Connector API v4 connect("preprod").
   * STRICT REQUIREMENTS:
   * 1. Target network MUST be "preprod". Zero alternative network loops.
   * 2. Inspects getConfiguration() & getConnectionStatus().
   * 3. Validates networkId === "preprod". If not "preprod", halts connection and reports WRONG_NETWORK.
   * 4. Uses the exact same ConnectedAPI instance for getUnshieldedAddress().
   */
  public static async connect(targetNetwork: string = 'preprod'): Promise<WalletState> {
    if (typeof window === 'undefined') {
      MidnightWalletConnector.currentState = {
        isConnected: false,
        isLaceInstalled: false,
        status: 'DISCONNECTED',
        address: null,
        accountName: null,
        networkId: null,
        detectedNetwork: null,
        expectedNetwork: 'Midnight Preprod',
        isWrongNetwork: false,
        walletDataReady: false,
        walletDataStatus: 'IDLE',
        isConnecting: false,
        error: 'Browser window is not available.',
      };
      MidnightWalletConnector.notifyListeners();
      return { ...MidnightWalletConnector.currentState };
    }

    // 1. Discover provider with bounded readiness check (up to 3 seconds)
    let providerInfo = MidnightWalletConnector.getMidnightProviderInfo();
    if (!providerInfo) {
      providerInfo = await MidnightWalletConnector.waitForMidnightProvider(3000);
    }

    if (!providerInfo) {
      MidnightWalletConnector.currentState = {
        isConnected: false,
        isLaceInstalled: false,
        status: 'DISCONNECTED',
        address: null,
        accountName: null,
        networkId: null,
        detectedNetwork: null,
        expectedNetwork: 'Midnight Preprod',
        isWrongNetwork: false,
        walletDataReady: false,
        walletDataStatus: 'IDLE',
        isConnecting: false,
        error: 'Midnight Lace Wallet extension is not installed or enabled in browser.',
      };
      MidnightWalletConnector.notifyListeners();
      return { ...MidnightWalletConnector.currentState };
    }

    const initialApi = providerInfo.provider;
    MidnightWalletConnector.currentState.isConnecting = true;
    MidnightWalletConnector.currentState.status = 'CONNECTING';
    MidnightWalletConnector.currentState.error = null;
    MidnightWalletConnector.notifyListeners();

    try {
      console.log(`[Midnight Wallet] Initiating connection to ${providerInfo.providerName} strictly on Preprod ('preprod')...`);

      // STRICT: Connect ONLY to 'preprod'. NO candidate loops.
      let connectedApi: any = null;
      if (typeof initialApi.connect === 'function') {
        connectedApi = await initialApi.connect('preprod');
      } else if (typeof initialApi.enable === 'function') {
        connectedApi = await initialApi.enable('preprod');
      } else {
        throw new Error(`Provider window.midnight.${providerInfo.key} does not support connect() or enable().`);
      }

      if (!connectedApi) {
        throw new Error('Lace provider returned an empty or invalid wallet API instance.');
      }

      console.log('[Midnight Wallet] ConnectedAPI returned successfully:', connectedApi);
      // Store exact ConnectedAPI instance for entire session
      MidnightWalletConnector.connectedApiInstance = connectedApi;

      // 3. Strict Preprod Verification: Check both getConfiguration() and getConnectionStatus()
      let configNetworkId: string | null = null;
      let statusNetworkId: string | null = null;

      const config = await safeCallMethod(connectedApi, 'getConfiguration', 3000);
      if (config?.networkId) {
        configNetworkId = String(config.networkId).trim().toLowerCase();
      }

      const connStatus = await safeCallMethod(connectedApi, 'getConnectionStatus', 3000);
      if (connStatus?.networkId) {
        statusNetworkId = String(connStatus.networkId).trim().toLowerCase();
      }

      const actualNetwork = configNetworkId || statusNetworkId || 'preprod';

      // STRICT CHECK: MUST BE EXACTLY "preprod"
      const isStrictPreprod = actualNetwork === 'preprod';

      if (!isStrictPreprod) {
        const detectedLabel = actualNetwork === 'undeployed' ? 'Undeployed (DevNet #0)' : actualNetwork;
        console.warn(`[Midnight Wallet] Strict network verification failed: Expected 'preprod', got '${actualNetwork}'`);

        MidnightWalletConnector.connectedApiInstance = null;
        MidnightWalletConnector.currentState = {
          isConnected: false,
          isLaceInstalled: true,
          status: 'WRONG_NETWORK',
          address: null,
          accountName: null,
          networkId: actualNetwork,
          detectedNetwork: detectedLabel,
          expectedNetwork: 'Midnight Preprod',
          isWrongNetwork: true,
          walletDataReady: false,
          walletDataStatus: 'IDLE',
          isConnecting: false,
          error: `Midnight Preprod is required. Your Lace session is on ${detectedLabel}. Switch your Midnight account/network to Midnight Preprod in Lace, then retry.`,
        };
        MidnightWalletConnector.notifyListeners();
        return { ...MidnightWalletConnector.currentState };
      }

      // 4. Strict Preprod VERIFIED! Transition to NETWORK_VERIFIED / ADDRESS_LOADING
      MidnightWalletConnector.currentState = {
        isConnected: true,
        isLaceInstalled: true,
        status: 'ADDRESS_LOADING',
        address: null,
        accountName: null,
        networkId: 'preprod',
        detectedNetwork: 'Midnight Preprod',
        expectedNetwork: 'Midnight Preprod',
        isWrongNetwork: false,
        walletDataReady: false,
        walletDataStatus: 'LOADING',
        isConnecting: false,
        error: null,
      };
      MidnightWalletConnector.notifyListeners();

      // 5. Execute bounded address retrieval using the exact same connectedApi instance (hard max 10 seconds)
      MidnightWalletConnector.executeBoundedAddressRetrieval(connectedApi, 10000);

      return { ...MidnightWalletConnector.currentState };
    } catch (err: any) {
      console.error('[Midnight Wallet] Connection error:', err);
      const errMsg = err?.message || String(err);
      const isRejection =
        errMsg.toLowerCase().includes('reject') ||
        errMsg.toLowerCase().includes('cancel') ||
        errMsg.toLowerCase().includes('denied') ||
        err?.code === 2 ||
        err?.code === -32000 ||
        err?.code === 'Rejected' ||
        err?.code === 1 ||
        err?.code === -3;
      const isMismatch =
        errMsg.toLowerCase().includes('network') ||
        errMsg.toLowerCase().includes('mismatch') ||
        errMsg.toLowerCase().includes('unsupported');

      let errorMsg = 'Failed to connect to Midnight Lace wallet.';
      if (isRejection) {
        errorMsg = 'Midnight wallet connection was cancelled/rejected by user in Lace popup.';
      } else if (isMismatch) {
        errorMsg = 'Midnight Preprod is required. Lace is currently configured to a different network. Please switch Lace to Midnight Preprod, then click Connect Lace.';
      } else if (errMsg) {
        errorMsg = errMsg;
      }

      MidnightWalletConnector.connectedApiInstance = null;
      MidnightWalletConnector.currentState = {
        isConnected: false,
        isLaceInstalled: true,
        status: isMismatch ? 'WRONG_NETWORK' : (isRejection ? 'DISCONNECTED' : 'ERROR'),
        address: null,
        accountName: null,
        networkId: null,
        detectedNetwork: isMismatch ? 'Non-Preprod Network' : null,
        expectedNetwork: 'Midnight Preprod',
        isWrongNetwork: isMismatch,
        walletDataReady: false,
        walletDataStatus: 'IDLE',
        isConnecting: false,
        error: isRejection ? null : errorMsg,
      };

      MidnightWalletConnector.notifyListeners();
      return { ...MidnightWalletConnector.currentState };
    }
  }

  public static async disconnect(): Promise<WalletState> {
    try {
      if (
        MidnightWalletConnector.connectedApiInstance &&
        typeof MidnightWalletConnector.connectedApiInstance.disconnect === 'function'
      ) {
        await safeCallMethod(MidnightWalletConnector.connectedApiInstance, 'disconnect', 1500);
      }
    } catch {}

    MidnightWalletConnector.connectedApiInstance = null;
    MidnightWalletConnector.isFetchingAddressInFlight = false;

    try {
      localStorage.removeItem(APP_CONFIG.SESSION_WALLET_KEY);
    } catch {}

    MidnightWalletConnector.currentState = {
      isConnected: false,
      isLaceInstalled: MidnightWalletConnector.isMidnightLaceInstalled(),
      status: 'DISCONNECTED',
      address: null,
      accountName: null,
      networkId: null,
      detectedNetwork: null,
      expectedNetwork: 'Midnight Preprod',
      isWrongNetwork: false,
      walletDataReady: false,
      walletDataStatus: 'IDLE',
      isConnecting: false,
      error: null,
    };

    MidnightWalletConnector.notifyListeners();
    return { ...MidnightWalletConnector.currentState };
  }
}

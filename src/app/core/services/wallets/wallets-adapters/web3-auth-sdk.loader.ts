import { RubicWindow } from '@shared/utils/rubic-window';

/** Matches @web3auth/modal version in package.json — loaded from CDN, not webpack. */
const WEB3AUTH_MODAL_CDN =
  'https://cdn.jsdelivr.net/npm/@web3auth/modal@10.16.0/dist/modal.umd.min.js';

export type Web3AuthProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export type Web3AuthChainConfig = {
  chainNamespace: string;
  chainId: string;
  rpcTarget: string;
  displayName: string;
  blockExplorerUrl: string;
  ticker: string;
  tickerName: string;
  logo: string;
};

export type Web3AuthInstance = {
  init(): Promise<void>;
  connect(): Promise<Web3AuthProvider | null>;
  logout(): Promise<void>;
  switchChain(params: { chainId: string }): Promise<void>;
  readonly currentChain?: { chainNamespace: string; chainId: string };
};

export type Web3AuthModalSdk = {
  Web3Auth: new (options: {
    clientId: string;
    web3AuthNetwork: string;
    defaultChainId?: string;
    chains?: Web3AuthChainConfig[];
  }) => Web3AuthInstance;
  WEB3AUTH_NETWORK: { SAPPHIRE_DEVNET: string };
  CHAIN_NAMESPACES: { EIP155: string; SOLANA: string };
  SolanaWallet: new (provider: Web3AuthProvider) => {
    getAccounts(): Promise<string[]>;
  };
};

type WindowWithModal = RubicWindow & { Modal?: Web3AuthModalSdk };

let sdkLoadPromise: Promise<Web3AuthModalSdk> | null = null;

export function loadWeb3AuthModalSdk(): Promise<Web3AuthModalSdk> {
  if (!sdkLoadPromise) {
    sdkLoadPromise = new Promise((resolve, reject) => {
      const windowRef = window as WindowWithModal;

      if (windowRef.Modal?.Web3Auth) {
        resolve(windowRef.Modal);
        return;
      }

      const existing = document.querySelector(`script[src="${WEB3AUTH_MODAL_CDN}"]`);
      if (existing) {
        existing.addEventListener('load', () => {
          if (windowRef.Modal?.Web3Auth) {
            resolve(windowRef.Modal);
          } else {
            reject(new Error('Web3Auth SDK loaded but Modal global is missing'));
          }
        });
        existing.addEventListener('error', () => reject(new Error('Web3Auth SDK script failed')));
        return;
      }

      const script = document.createElement('script');
      script.src = WEB3AUTH_MODAL_CDN;
      script.async = true;
      script.onload = () => {
        if (windowRef.Modal?.Web3Auth) {
          resolve(windowRef.Modal);
        } else {
          reject(new Error('Web3Auth SDK loaded but Modal global is missing'));
        }
      };
      script.onerror = () => reject(new Error('Web3Auth SDK script failed to load'));
      document.head.appendChild(script);
    });
  }

  return sdkLoadPromise;
}

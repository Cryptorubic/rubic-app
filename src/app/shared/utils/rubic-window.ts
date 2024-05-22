import Process = NodeJS.Process;
import { WalletLinkProvider } from 'walletlink';
import { PhantomWallet } from '@core/services/wallets/wallets-adapters/solana/models/solana-wallet-types';

// Included with Angular CLI.

/**
 * APPLICATION IMPORTS
 */
export interface RubicWindow extends Window {
  global?: unknown;
  process?: Process;
  Buffer?: Buffer;
  dataLayer?: unknown[];
  ga?: Function | { create: Function; loaded: boolean };
  chrome?: boolean;
  tronLink?: {
    tronWeb: unknown;
  };
  bitkeep?: { ethereum?: WalletLinkProvider };
  tokenpocket?: { ethereum?: WalletLinkProvider & { isTokenPocket?: boolean } };
  phantom?: { ethereum?: WalletLinkProvider; solana: PhantomWallet };
}

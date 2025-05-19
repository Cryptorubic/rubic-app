import Process = NodeJS.Process;
import { WalletLinkProvider } from 'walletlink';
import { PhantomWallet } from '@core/services/wallets/wallets-adapters/solana/models/solana-wallet-types';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { BtcWallet } from '@core/services/wallets/wallets-adapters/solana/models/btc-wallet';

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
    isBitKeepChrome: boolean;
  };
  bitkeep?: { ethereum?: WalletLinkProvider };
  tokenpocket?: { ethereum?: WalletLinkProvider & { isTokenPocket?: boolean } };
  phantom?: { ethereum?: WalletLinkProvider; solana: PhantomWallet };
  ethereum?: WalletLinkProvider & { providers?: RubicAny[] };
  xfi?: {
    bitcoin?: BtcWallet;
    ethereum?: {
      isMetaMask: boolean;
      isXDEFI: boolean;
      connected: boolean;
      isCtrl: boolean;
    };
    solana?: RubicAny;
    info: { installed: boolean; isCtrl: boolean };
  };
}

import Process = NodeJS.Process;
import { WalletLinkProvider } from 'walletlink';
import { PhantomWallet } from '@core/services/wallets/wallets-adapters/solana/models/solana-wallet-types';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { Turnstile } from '@core/services/turnstile/turnstile.models';

// Included with Angular CLI.

/**
 * APPLICATION IMPORTS
 */
export interface RubicWindow extends Window {
  global?: unknown;
  process?: Process;
  Buffer?: Buffer;
  ga?: Function | { create: Function; loaded: boolean };
  chrome?: boolean;
  turnstile?: Turnstile;
  tronLink?: {
    tronWeb: unknown;
    isBitKeepChrome: boolean;
  };
  phantom?: { ethereum?: WalletLinkProvider; solana: PhantomWallet };
  ethereum?: WalletLinkProvider & { providers?: RubicAny[] };
}

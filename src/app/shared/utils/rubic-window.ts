import { WalletLinkProvider } from 'walletlink';
import Process = NodeJS.Process; // Included with Angular CLI.

/**
 * APPLICATION IMPORTS
 */
export interface RubicWindow extends Window {
  global?: unknown;
  process?: Process;
  Buffer?: Buffer;
  dataLayer?: unknown[];
  ga?: Function | { create: Function; loaded: boolean };
  bitkeep?: { ethereum?: WalletLinkProvider };
}

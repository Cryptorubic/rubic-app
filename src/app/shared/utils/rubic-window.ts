import { WalletLinkProvider } from 'walletlink';
import Process = NodeJS.Process;

/**
 * APPLICATION IMPORTS
 */
export interface RubicWindow extends Window {
  global?: unknown;
  process?: Process;
  Buffer?: Buffer;
  dataLayer?: unknown[];
  ethereum?: WalletLinkProvider & { isCoinbaseWallet?: boolean };
}

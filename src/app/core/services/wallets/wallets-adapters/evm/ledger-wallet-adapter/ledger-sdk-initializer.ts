import { initializeLedgerProvider } from '@ledgerhq/ledger-wallet-provider';
import { evmBlockchainProviderFactory } from '@ledgerhq/ledger-wallet-provider-evm';

export class LedgerSdkInitalizer {
  private static isInitialized: boolean = false;

  public static init(): () => void {
    if (this.isInitialized) return;

    this.isInitialized = true;

    initializeLedgerProvider({
      dAppIdentifier: 'ledger',
      environment: 'production',
      apiKey: 'ba1d03cf-e227-427c-9d03-cfe227627c4a',
      blockchainProviderFactories: [evmBlockchainProviderFactory]
    });
  }
}

import { AbstractSuiWalletAdapter } from '@core/services/wallets/wallets-adapters/sui/abstract-sui-wallet-adapter';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';

export class SuietWalletAdapter extends AbstractSuiWalletAdapter {
  public readonly walletName = WALLET_NAME.SUIET_WALLET;

  public readonly extensionName = 'Suiet';
}

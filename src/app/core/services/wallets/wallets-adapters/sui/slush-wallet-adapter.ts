import { AbstractSuiWalletAdapter } from '@core/services/wallets/wallets-adapters/sui/abstract-sui-wallet-adapter';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';

export class SlushWalletAdapter extends AbstractSuiWalletAdapter {
  public readonly walletName = WALLET_NAME.SLUSH;

  public readonly extensionName = 'Slush';
}

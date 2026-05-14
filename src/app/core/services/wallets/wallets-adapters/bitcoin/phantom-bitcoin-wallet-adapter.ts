import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BitcoinStandardWalletAdapter } from '../standard-adapter/bitcoin/bitcoin-standard-wallet-adapter';

export class PhantomBitcoinWalletAdapter extends BitcoinStandardWalletAdapter {
  public readonly walletName = WALLET_NAME.PHANTOM_BITCOIN;

  protected readonly name = 'Phantom';
}

import { FREIGHTER_ID, FreighterModule } from '@creit.tech/stellar-wallets-kit';
import { CommonStellarWalletAdapter } from './common/common-stellar-wallet-adapter';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';

export class FreighterWalletAdapter extends CommonStellarWalletAdapter {
  protected readonly walletId = FREIGHTER_ID;

  protected readonly walletModule = new FreighterModule();

  public walletName = WALLET_NAME.FREIGHTER;
}

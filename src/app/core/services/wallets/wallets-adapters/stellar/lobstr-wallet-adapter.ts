import { LOBSTR_ID, LobstrModule } from '@creit.tech/stellar-wallets-kit';
import { CommonStellarWalletAdapter } from './common/common-stellar-wallet-adapter';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';

export class LobstrWalletAdapter extends CommonStellarWalletAdapter {
  protected readonly walletId = LOBSTR_ID;

  protected readonly walletModule = new LobstrModule();

  public walletName = WALLET_NAME.LOBSTR;
}

import { CommonXrplWalletAdapter } from './common/common-xrpl-wallet-adapter';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';

export class XamanWalletAdapter extends CommonXrplWalletAdapter {
  public walletName = WALLET_NAME.XAMAN;
}

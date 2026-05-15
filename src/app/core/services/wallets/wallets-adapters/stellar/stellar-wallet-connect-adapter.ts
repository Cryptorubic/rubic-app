import {
  WalletConnectModule,
  WALLET_CONNECT_ID
} from '@creit.tech/stellar-wallets-kit/modules/walletconnect.module';
import { CommonStellarWalletAdapter } from './common/common-stellar-wallet-adapter';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { WALLET_CONNECT_CONFIG } from '@app/features/trade/services/trustline-service/constants/wallet-connect-config';

export class StellarWalletConnectAdapter extends CommonStellarWalletAdapter {
  protected readonly walletId = WALLET_CONNECT_ID;

  protected readonly walletModule = new WalletConnectModule(WALLET_CONNECT_CONFIG);

  public walletName = WALLET_NAME.STELLAR_WALLET_CONNECT;

  protected override needDelayAfterModuleInit: boolean = true;
}

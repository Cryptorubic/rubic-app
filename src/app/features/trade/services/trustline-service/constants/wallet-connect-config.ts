import { WalletNetwork } from '@creit.tech/stellar-wallets-kit';
import {
  IWalletConnectConstructorParams,
  WalletConnectAllowedMethods
} from '@creit.tech/stellar-wallets-kit/modules/walletconnect.module';

export const WALLET_CONNECT_CONFIG: IWalletConnectConstructorParams = {
  projectId: 'cc80c3ad93f66e7708a8bdd66e85167e',
  network: WalletNetwork.PUBLIC,
  name: 'Rubic',
  url: 'https://app.rubic.exchange/',
  icons: ['https://app.rubic.exchange/assets/images/rubic-logo.png'],
  description:
    'Swap crypto effortlessly on Rubic, aggregating 70+ blockchains, 220+ DEXs, and cross-chain bridges to get you the best rates possible. Exchange now!',
  method: WalletConnectAllowedMethods.SIGN
};

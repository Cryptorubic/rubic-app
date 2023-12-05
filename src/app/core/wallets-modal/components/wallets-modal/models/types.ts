import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';

export interface WalletProvider {
  name: string;
  value: WALLET_NAME;
  img: string;
  desktopOnly: boolean;
  mobileOnly: boolean;
  display: boolean;
  disabled: boolean;
}

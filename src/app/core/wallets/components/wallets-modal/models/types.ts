import { WalletName } from '@core/wallets/components/wallets-modal/models/wallet-name';

export interface WalletProvider {
  name: string;
  value: WalletName;
  img: string;
  desktopOnly: boolean;
  mobileOnly: boolean;
  display: boolean;
  supportsInHorizontalIframe: boolean;
  supportsInVerticalIframe: boolean;
  supportsInVerticalMobileIframe: boolean;
}

export interface UnreadTrades {
  [userAddress: string]: number;
}

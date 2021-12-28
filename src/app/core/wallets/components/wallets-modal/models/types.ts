import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';

export interface WalletProvider {
  name: string;
  value: WALLET_NAME;
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

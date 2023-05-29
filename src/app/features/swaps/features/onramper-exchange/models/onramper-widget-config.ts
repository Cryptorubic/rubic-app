export interface OnramperWidgetConfig {
  apiKey: string;

  primaryColor: string;
  themeName?: 'dark' | 'light' | 'bluey';
  supportSell?: boolean;
  supportSwap?: boolean;

  defaultCrypto?: string;
  defaultFiat?: string;
  defaultAmount?: string;
  wallets?: string;
  onlyCryptos?: string;
  isAddressEditable?: boolean;

  partnerContext: {
    walletAddress?: string;
    id: string;
    isDirect: boolean;
  };
}

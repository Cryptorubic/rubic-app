export interface OnramperWidgetConfig {
  apiKey: string;

  color: string;
  darkMode?: boolean;
  supportSell?: boolean;
  supportSwap?: boolean;

  defaultCrypto?: string;
  defaultFiat?: string;
  defaultAmount?: string;
  wallets?: string;
  onlyCryptos?: string;
  isAddressEditable?: boolean;

  partnerContext: {
    walletAddress: string;
  };
}

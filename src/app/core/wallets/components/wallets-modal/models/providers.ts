export enum WALLET_NAME {
  METAMASK = 'metamask',
  WALLET_LINK = 'walletlink',
  WALLET_CONNECT = 'walletconnect',
  PHANTOM = 'phantom',
  SOLFLARE = 'solflare'
}

export interface WalletProvider {
  name: string;
  value: WALLET_NAME;
  img: string;
  desktopOnly: boolean;
  display: boolean;
  supportsInHorizontalIframe: boolean;
  supportsInVerticalIframe: boolean;
  supportsInVerticalMobileIframe: boolean;
}

export interface UnreadTrades {
  [userAddress: string]: number;
}

export enum WALLET_NAME {
  METAMASK = 'metamask',
  WALLET_LINK = 'walletlink',
  WALLET_CONNECT = 'walletconnect'
}

export interface WalletProvider {
  name: string;
  value: WALLET_NAME;
  img: string;
  desktopOnly: boolean;
  display: boolean;
}

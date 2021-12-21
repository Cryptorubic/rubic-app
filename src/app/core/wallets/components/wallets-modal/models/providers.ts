export enum WALLET_NAME {
  METAMASK = 'metamask',
  WALLET_LINK = 'walletlink',
  WALLET_CONNECT = 'walletconnect',
  TRUST_WALLET = 'trustwallet',
  PHANTOM = 'phantom',
  SOLFLARE = 'solflare'
}

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

export const PROVIDERS_LIST: ReadonlyArray<WalletProvider> = [
  {
    name: 'MetaMask',
    value: WALLET_NAME.METAMASK,
    img: './assets/images/icons/wallets/metamask.svg',
    desktopOnly: false,
    mobileOnly: false,
    display: true,
    supportsInHorizontalIframe: true,
    supportsInVerticalIframe: true,
    supportsInVerticalMobileIframe: false
  },
  {
    name: 'Trust wallet',
    value: WALLET_NAME.TRUST_WALLET,
    img: './assets/images/icons/wallets/trust.svg',
    desktopOnly: false,
    mobileOnly: true,
    display: true,
    supportsInHorizontalIframe: false,
    supportsInVerticalIframe: false,
    supportsInVerticalMobileIframe: true
  },
  {
    name: 'Coinbase wallet',
    value: WALLET_NAME.WALLET_LINK,
    img: './assets/images/icons/wallets/coinbase.png',
    desktopOnly: false,
    mobileOnly: false,
    display: true,
    supportsInHorizontalIframe: false,
    supportsInVerticalIframe: false,
    supportsInVerticalMobileIframe: true
  },
  {
    name: 'WalletConnect',
    value: WALLET_NAME.WALLET_CONNECT,
    img: './assets/images/icons/wallets/walletconnect.svg',
    desktopOnly: false,
    mobileOnly: false,
    display: true,
    supportsInHorizontalIframe: false,
    supportsInVerticalIframe: true,
    supportsInVerticalMobileIframe: true
  },
  {
    name: 'Phantom',
    value: WALLET_NAME.PHANTOM,
    img: './assets/images/icons/wallets/phantom.svg',
    desktopOnly: false,
    mobileOnly: false,
    display: true,
    supportsInHorizontalIframe: true,
    supportsInVerticalIframe: true,
    supportsInVerticalMobileIframe: false
  },
  {
    name: 'Solflare',
    value: WALLET_NAME.SOLFLARE,
    img: './assets/images/icons/wallets/solflare.svg',
    desktopOnly: false,
    mobileOnly: false,
    display: true,
    supportsInHorizontalIframe: true,
    supportsInVerticalIframe: true,
    supportsInVerticalMobileIframe: false
  }
];

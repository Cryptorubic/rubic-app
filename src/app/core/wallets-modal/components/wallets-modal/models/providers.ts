import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { WalletProvider } from '@core/wallets-modal/components/wallets-modal/models/types';

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
    supportsInVerticalMobileIframe: false,
    disabled: false
  },
  {
    name: 'TronLink',
    value: WALLET_NAME.TRON_LINK,
    img: './assets/images/icons/wallets/tronlink.webp',
    desktopOnly: true,
    mobileOnly: false,
    display: true,
    supportsInHorizontalIframe: true,
    supportsInVerticalIframe: true,
    supportsInVerticalMobileIframe: false,
    disabled: false
  },
  {
    name: 'BitKeep',
    value: WALLET_NAME.BITKEEP,
    img: './assets/images/icons/wallets/bitkeep.svg',
    desktopOnly: false,
    mobileOnly: false,
    display: true,
    supportsInHorizontalIframe: true,
    supportsInVerticalIframe: true,
    supportsInVerticalMobileIframe: false,
    disabled: true
  },
  {
    name: 'Trust Wallet',
    value: WALLET_NAME.TRUST_WALLET,
    img: './assets/images/icons/wallets/trust.svg',
    desktopOnly: false,
    mobileOnly: true,
    display: true,
    supportsInHorizontalIframe: false,
    supportsInVerticalIframe: false,
    supportsInVerticalMobileIframe: true,
    disabled: false
  },
  {
    name: 'Coinbase Wallet',
    value: WALLET_NAME.WALLET_LINK,
    img: './assets/images/icons/wallets/coinbase.png',
    desktopOnly: false,
    mobileOnly: false,
    display: true,
    supportsInHorizontalIframe: false,
    supportsInVerticalIframe: false,
    supportsInVerticalMobileIframe: true,
    disabled: false
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
    supportsInVerticalMobileIframe: true,
    disabled: false
  }
];

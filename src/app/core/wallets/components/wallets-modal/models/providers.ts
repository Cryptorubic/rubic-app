import { WalletName } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { WalletProvider } from '@core/wallets/components/wallets-modal/models/types';

export const PROVIDERS_LIST: ReadonlyArray<WalletProvider> = [
  {
    name: 'MetaMask',
    value: WalletName.METAMASK,
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
    value: WalletName.TRUST_WALLET,
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
    value: WalletName.WALLET_LINK,
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
    value: WalletName.WALLET_CONNECT,
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
    value: WalletName.PHANTOM,
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
    value: WalletName.SOLFLARE,
    img: './assets/images/icons/wallets/solflare.svg',
    desktopOnly: false,
    mobileOnly: false,
    display: true,
    supportsInHorizontalIframe: true,
    supportsInVerticalIframe: true,
    supportsInVerticalMobileIframe: false
  }
];

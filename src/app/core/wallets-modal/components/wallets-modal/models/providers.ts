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
    disabled: false
  },
  {
    name: 'TronLink',
    value: WALLET_NAME.TRON_LINK,
    img: './assets/images/icons/wallets/tronlink.webp',
    desktopOnly: true,
    mobileOnly: false,
    display: true,
    disabled: false
  },
  {
    name: 'Trust Wallet',
    value: WALLET_NAME.TRUST_WALLET,
    img: './assets/images/icons/wallets/trust.svg',
    desktopOnly: false,
    mobileOnly: true,
    display: true,
    disabled: false
  },
  {
    name: 'Coinbase Wallet',
    value: WALLET_NAME.WALLET_LINK,
    img: './assets/images/icons/wallets/coinbase.png',
    desktopOnly: false,
    mobileOnly: false,
    display: true,
    disabled: false
  },
  {
    name: 'WalletConnect',
    value: WALLET_NAME.WALLET_CONNECT,
    img: './assets/images/icons/wallets/walletconnect.svg',
    desktopOnly: false,
    mobileOnly: false,
    display: true,
    disabled: false
  },
  {
    name: 'Argent',
    value: WALLET_NAME.ARGENT,
    img: './assets/images/icons/wallets/argent.svg',
    desktopOnly: false,
    mobileOnly: false,
    display: true,
    disabled: false
  },
  {
    name: 'BitKeep',
    value: WALLET_NAME.BITKEEP,
    img: './assets/images/icons/wallets/bitkeep.svg',
    desktopOnly: false,
    mobileOnly: false,
    display: true,
    disabled: false
  },
  {
    name: 'Phantom',
    value: WALLET_NAME.PHANTOM,
    img: './assets/images/icons/wallets/phantom.svg',
    desktopOnly: true,
    mobileOnly: false,
    display: true,
    disabled: false
  },
  {
    name: 'Solflare',
    value: WALLET_NAME.SOLFLARE,
    img: './assets/images/icons/wallets/solflare.svg',
    desktopOnly: true,
    mobileOnly: false,
    display: true,
    disabled: false
  }
];

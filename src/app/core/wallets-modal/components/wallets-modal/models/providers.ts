import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { WalletProvider } from '@core/wallets-modal/components/wallets-modal/models/types';

export const PROVIDERS_LIST: ReadonlyArray<WalletProvider> = [
  {
    name: 'MetaMask',
    value: WALLET_NAME.METAMASK,
    img: './assets/images/icons/wallets/metamask.svg',
    supportsDesktop: true,
    supportsMobile: true,
    display: true,
    disabled: false
  },
  {
    name: 'TronLink',
    value: WALLET_NAME.TRON_LINK,
    img: './assets/images/icons/wallets/tronlink.webp',
    supportsDesktop: true,
    supportsMobile: false,
    display: true,
    disabled: false
  },
  {
    name: 'Trust Wallet',
    value: WALLET_NAME.TRUST_WALLET,
    img: './assets/images/icons/wallets/trust.svg',
    supportsDesktop: false,
    supportsMobile: false,
    display: true,
    disabled: false
  },
  {
    name: 'Coinbase Wallet',
    value: WALLET_NAME.WALLET_LINK,
    img: './assets/images/icons/wallets/coinbase.png',
    supportsDesktop: true,
    supportsMobile: false,
    display: true,
    disabled: false
  },
  {
    name: 'WalletConnect',
    value: WALLET_NAME.WALLET_CONNECT,
    img: './assets/images/icons/wallets/walletconnect.svg',
    supportsDesktop: true,
    supportsMobile: true,
    display: true,
    disabled: false
  },
  {
    name: 'Argent',
    value: WALLET_NAME.ARGENT,
    img: './assets/images/icons/wallets/argent.svg',
    supportsDesktop: true,
    supportsMobile: false,
    display: true,
    disabled: false
  },
  {
    name: 'BitKeep',
    value: WALLET_NAME.BITKEEP,
    img: './assets/images/icons/wallets/bitkeep.svg',
    supportsDesktop: true,
    supportsMobile: false,
    display: true,
    disabled: false
  },
  {
    name: 'Phantom',
    value: WALLET_NAME.PHANTOM,
    img: './assets/images/icons/wallets/phantom.svg',
    supportsDesktop: true,
    supportsMobile: false,
    display: true,
    disabled: false
  },
  {
    name: 'Solflare',
    value: WALLET_NAME.SOLFLARE,
    img: './assets/images/icons/wallets/solflare.svg',
    supportsDesktop: true,
    supportsMobile: false,
    display: true,
    disabled: false
  },
  {
    name: 'Safe',
    value: WALLET_NAME.SAFE,
    img: './assets/images/icons/wallets/solflare.svg',
    supportsDesktop: true,
    supportsMobile: true,
    display: false,
    disabled: false
  },
  {
    name: 'TokenPocket',
    value: WALLET_NAME.TOKEN_POCKET,
    img: './assets/images/icons/wallets/tokenpocket.png',
    supportsDesktop: true,
    supportsMobile: false,
    display: true,
    disabled: false
  },
  {
    name: 'HoldStation',
    value: WALLET_NAME.HOLD_STATION,
    img: './assets/images/icons/wallets/holdstation.png',
    supportsDesktop: true,
    supportsMobile: true,
    display: true,
    disabled: false
  }
];

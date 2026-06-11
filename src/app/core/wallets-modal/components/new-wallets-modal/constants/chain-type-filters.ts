import { CHAIN_TYPE } from '@cryptorubic/core';
import { WalletFilterConfig } from '../models/models';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { WALLET_ADAPTER_STATIC_CONFIGS } from '@app/core/services/wallets/constants/wallet-adapter-static-config';
import { CommonWalletAdapter } from '@app/core/services/wallets/wallets-adapters/common-wallet-adapter';

const WALLET_FILTER_KEYS = [
  'ALL',
  CHAIN_TYPE.EVM,
  CHAIN_TYPE.SOLANA,
  CHAIN_TYPE.TRON,
  CHAIN_TYPE.BITCOIN,
  CHAIN_TYPE.TON,
  CHAIN_TYPE.SUI,
  CHAIN_TYPE.STELLAR
] as const;

export type WalletFilterKey = (typeof WALLET_FILTER_KEYS)[number];

const basePath = 'assets/images/wallets/chain-types';

export const CHAIN_TYPES_FILTERS: Record<WalletFilterKey, WalletFilterConfig> = {
  ALL: {
    filterFunc: () => true,
    connectedFunc: () => false,
    img: `${basePath}/all-wallets.png`,
    label: 'All Wallets'
  },
  [CHAIN_TYPE.EVM]: {
    filterFunc: (walletName: WALLET_NAME) => {
      return WALLET_ADAPTER_STATIC_CONFIGS[walletName].chainTypes.includes('EVM');
    },
    connectedFunc: (activeWallets: CommonWalletAdapter[]) => {
      return activeWallets.some(w => w.chainType === 'EVM');
    },
    img: `${basePath}/evm.png`,
    label: 'EVM'
  },
  [CHAIN_TYPE.SOLANA]: {
    filterFunc: (walletName: WALLET_NAME) => {
      return WALLET_ADAPTER_STATIC_CONFIGS[walletName].chainTypes.includes('SOLANA');
    },
    connectedFunc: (activeWallets: CommonWalletAdapter[]) => {
      return activeWallets.some(w => w.chainType === 'SOLANA');
    },
    img: `${basePath}/solana.png`,
    label: 'Solana'
  },
  [CHAIN_TYPE.TRON]: {
    filterFunc: (walletName: WALLET_NAME) => {
      return WALLET_ADAPTER_STATIC_CONFIGS[walletName].chainTypes.includes('TRON');
    },
    connectedFunc: (activeWallets: CommonWalletAdapter[]) => {
      return activeWallets.some(w => w.chainType === 'TRON');
    },
    img: `${basePath}/tron.png`,
    label: 'Tron'
  },
  [CHAIN_TYPE.BITCOIN]: {
    filterFunc: (walletName: WALLET_NAME) => {
      return WALLET_ADAPTER_STATIC_CONFIGS[walletName].chainTypes.includes('BITCOIN');
    },
    connectedFunc: (activeWallets: CommonWalletAdapter[]) => {
      return activeWallets.some(w => w.chainType === 'BITCOIN');
    },
    img: `${basePath}/bitcoin.svg`,
    label: 'Bitcoin'
  },
  [CHAIN_TYPE.TON]: {
    filterFunc: (walletName: WALLET_NAME) => {
      return WALLET_ADAPTER_STATIC_CONFIGS[walletName].chainTypes.includes('TON');
    },
    connectedFunc: (activeWallets: CommonWalletAdapter[]) => {
      return activeWallets.some(w => w.chainType === 'TON');
    },
    img: `${basePath}/ton.png`,
    label: 'Ton'
  },
  [CHAIN_TYPE.SUI]: {
    filterFunc: (walletName: WALLET_NAME) => {
      return WALLET_ADAPTER_STATIC_CONFIGS[walletName].chainTypes.includes('SUI');
    },
    connectedFunc: (activeWallets: CommonWalletAdapter[]) => {
      return activeWallets.some(w => w.chainType === 'SUI');
    },
    img: `${basePath}/sui.png`,
    label: 'Sui'
  },
  [CHAIN_TYPE.STELLAR]: {
    filterFunc: (walletName: WALLET_NAME) => {
      return WALLET_ADAPTER_STATIC_CONFIGS[walletName].chainTypes.includes('STELLAR');
    },
    connectedFunc: (activeWallets: CommonWalletAdapter[]) => {
      return activeWallets.some(w => w.chainType === 'STELLAR');
    },
    img: `${basePath}/stellar.png`,
    label: 'Stellar'
  }
};

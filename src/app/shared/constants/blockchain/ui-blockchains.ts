import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';

export interface Blockchain {
  key: BlockchainName;
  name: string;
  img: string;
}

const imageBaseSrc = 'assets/images/icons/coins/';

export const BLOCKCHAINS: Record<BlockchainName, Blockchain> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    key: BLOCKCHAIN_NAME.ETHEREUM,
    name: 'Ethereum',
    img: `${imageBaseSrc}eth.png`
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    key: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    name: 'BNB',
    img: `${imageBaseSrc}bnb.svg`
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    key: BLOCKCHAIN_NAME.POLYGON,
    name: 'Polygon',
    img: `${imageBaseSrc}polygon.svg`
  },
  [BLOCKCHAIN_NAME.HARMONY]: {
    key: BLOCKCHAIN_NAME.HARMONY,
    name: 'Harmony',
    img: `${imageBaseSrc}harmony.svg`
  },
  [BLOCKCHAIN_NAME.MOONRIVER]: {
    key: BLOCKCHAIN_NAME.MOONRIVER,
    name: 'Moonriver',
    img: `${imageBaseSrc}moonriver.webp`
  },
  [BLOCKCHAIN_NAME.AVALANCHE]: {
    key: BLOCKCHAIN_NAME.AVALANCHE,
    name: 'Avalanche',
    img: `${imageBaseSrc}avalanche.svg`
  },
  [BLOCKCHAIN_NAME.FANTOM]: {
    key: BLOCKCHAIN_NAME.FANTOM,
    name: 'Fantom',
    img: `${imageBaseSrc}fantom.svg`
  },
  [BLOCKCHAIN_NAME.ARBITRUM]: {
    key: BLOCKCHAIN_NAME.ARBITRUM,
    name: 'Arbitrum',
    img: `${imageBaseSrc}arbitrum.svg`
  },
  [BLOCKCHAIN_NAME.AURORA]: {
    key: BLOCKCHAIN_NAME.AURORA,
    name: 'Aurora',
    img: `${imageBaseSrc}aurora.svg`
  },
  [BLOCKCHAIN_NAME.SOLANA]: {
    key: BLOCKCHAIN_NAME.SOLANA,
    name: 'Solana',
    img: `${imageBaseSrc}solana.svg`
  },
  [BLOCKCHAIN_NAME.NEAR]: {
    key: BLOCKCHAIN_NAME.NEAR,
    name: 'Near',
    img: `${imageBaseSrc}near.svg`
  },
  [BLOCKCHAIN_NAME.TELOS]: {
    key: BLOCKCHAIN_NAME.TELOS,
    name: 'Telos EVM',
    img: `${imageBaseSrc}telos.svg`
  },
  [BLOCKCHAIN_NAME.OPTIMISM]: {
    key: BLOCKCHAIN_NAME.OPTIMISM,
    name: 'Optimism',
    img: `${imageBaseSrc}telos.svg`
  },
  [BLOCKCHAIN_NAME.CRONOS]: {
    key: BLOCKCHAIN_NAME.CRONOS,
    name: 'Cronos',
    img: `${imageBaseSrc}telos.svg`
  },
  [BLOCKCHAIN_NAME.OKE_X_CHAIN]: {
    key: BLOCKCHAIN_NAME.OKE_X_CHAIN,
    name: 'OKExChain',
    img: `${imageBaseSrc}telos.svg`
  },
  [BLOCKCHAIN_NAME.GNOSIS]: {
    key: BLOCKCHAIN_NAME.GNOSIS,
    name: 'Telos EVM',
    img: `${imageBaseSrc}telos.svg`
  },
  [BLOCKCHAIN_NAME.FUSE]: {
    key: BLOCKCHAIN_NAME.TELOS,
    name: 'Gnosis',
    img: `${imageBaseSrc}telos.svg`
  },
  [BLOCKCHAIN_NAME.MOONBEAM]: {
    key: BLOCKCHAIN_NAME.MOONBEAM,
    name: 'Moonbeam',
    img: `${imageBaseSrc}telos.svg`
  },
  [BLOCKCHAIN_NAME.CELO]: {
    key: BLOCKCHAIN_NAME.CELO,
    name: 'Celo',
    img: `${imageBaseSrc}telos.svg`
  }
};

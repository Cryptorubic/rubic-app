import { BLOCKCHAIN_NAME, BlockchainName } from '@shared/models/blockchain/blockchain-name';

export interface Blockchain {
  key: BlockchainName;
  name: string;
  img: string;
}

type Blockchains = {
  [BLOCKCHAIN_NAME.ETHEREUM]: Blockchain;
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: Blockchain;
  [BLOCKCHAIN_NAME.POLYGON]: Blockchain;
  [BLOCKCHAIN_NAME.HARMONY]: Blockchain;
  [BLOCKCHAIN_NAME.AVALANCHE]: Blockchain;
  [BLOCKCHAIN_NAME.MOONRIVER]: Blockchain;
  [BLOCKCHAIN_NAME.FANTOM]: Blockchain;
  [BLOCKCHAIN_NAME.ARBITRUM]: Blockchain;
  [BLOCKCHAIN_NAME.AURORA]: Blockchain;
  [BLOCKCHAIN_NAME.SOLANA]: Blockchain;
  [BLOCKCHAIN_NAME.NEAR]: Blockchain;
  [BLOCKCHAIN_NAME.TELOS]: Blockchain;
};

const imageBaseSrc = 'assets/images/icons/coins/';

export const BLOCKCHAINS: Blockchains = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    key: BLOCKCHAIN_NAME.ETHEREUM,
    name: 'Ethereum',
    img: `${imageBaseSrc}eth.png`
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    key: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    name: 'Binance Smart Chain',
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
  }
};

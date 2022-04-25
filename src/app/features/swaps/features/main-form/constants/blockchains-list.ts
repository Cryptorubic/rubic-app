import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { BlockchainItem } from '@features/swaps/features/main-form/models/blockchain-item';

const imageBaseSrc = 'assets/images/icons/coins/';

export const BLOCKCHAINS_LIST: BlockchainItem[] = [
  {
    symbol: BLOCKCHAIN_NAME.ETHEREUM,
    visibleName: 'Ethereum',
    image: `${imageBaseSrc}eth.svg`,
    id: 1
  },
  {
    symbol: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    visibleName: 'BSC',
    image: `${imageBaseSrc}bnb.svg`,
    id: 56
  },
  {
    symbol: BLOCKCHAIN_NAME.POLYGON,
    visibleName: 'Polygon',
    image: `${imageBaseSrc}polygon.svg`,
    id: 137
  },
  {
    symbol: BLOCKCHAIN_NAME.HARMONY,
    visibleName: 'Harmony',
    image: `${imageBaseSrc}harmony.svg`,
    id: 1666600000
  },
  {
    symbol: BLOCKCHAIN_NAME.AVALANCHE,
    visibleName: 'Avalanche',
    image: `${imageBaseSrc}avalanche.svg`,
    id: 43114
  },
  {
    symbol: BLOCKCHAIN_NAME.MOONRIVER,
    visibleName: 'Moonriver',
    image: `${imageBaseSrc}moonriver.webp`,
    id: 1285
  },
  {
    symbol: BLOCKCHAIN_NAME.FANTOM,
    visibleName: 'Fantom',
    image: `${imageBaseSrc}fantom.svg`,
    id: 250
  },
  {
    symbol: BLOCKCHAIN_NAME.ARBITRUM,
    visibleName: 'Arbitrum',
    image: `${imageBaseSrc}arbitrum.svg`,
    id: 42161
  },
  {
    symbol: BLOCKCHAIN_NAME.AURORA,
    visibleName: 'Aurora',
    image: `${imageBaseSrc}aurora.svg`,
    id: 1313161554
  },
  {
    symbol: BLOCKCHAIN_NAME.SOLANA,
    visibleName: 'Solana',
    image: `${imageBaseSrc}solana.svg`,
    id: 999999
  },
  {
    symbol: BLOCKCHAIN_NAME.NEAR,
    visibleName: 'Near',
    image: `${imageBaseSrc}near.svg`,
    id: NaN
  }
];

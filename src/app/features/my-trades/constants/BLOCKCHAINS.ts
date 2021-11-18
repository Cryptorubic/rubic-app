import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

interface Blockchain {
  key: BLOCKCHAIN_NAME;
  name: string;
  img: string;
}

type Blockchains = {
  [BLOCKCHAIN_NAME.ETHEREUM]: Blockchain;
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: Blockchain;
  [BLOCKCHAIN_NAME.POLYGON]: Blockchain;
  [BLOCKCHAIN_NAME.HARMONY]: Blockchain;
  [BLOCKCHAIN_NAME.TRON]: Blockchain;
  [BLOCKCHAIN_NAME.XDAI]: Blockchain;
  [BLOCKCHAIN_NAME.AVALANCHE]: Blockchain;
  [BLOCKCHAIN_NAME.MOONRIVER]: Blockchain;
  [BLOCKCHAIN_NAME.FANTOM]: Blockchain;
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: Blockchain;
  [BLOCKCHAIN_NAME.AVALANCHE_TESTNET]: Blockchain;
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
  [BLOCKCHAIN_NAME.TRON]: {
    key: BLOCKCHAIN_NAME.TRON,
    name: 'TRON',
    img: `${imageBaseSrc}tron.svg`
  },
  [BLOCKCHAIN_NAME.XDAI]: {
    key: BLOCKCHAIN_NAME.XDAI,
    name: 'XDAI',
    img: `${imageBaseSrc}xdai.svg`
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
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: {
    key: BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
    name: 'Kovan',
    img: `${imageBaseSrc}kovan.png`
  },
  [BLOCKCHAIN_NAME.AVALANCHE_TESTNET]: {
    key: BLOCKCHAIN_NAME.AVALANCHE_TESTNET,
    name: 'Avalanche',
    img: `${imageBaseSrc}avalanche-testnet.svg`
  }
};

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
  [BLOCKCHAIN_NAME.TRON]: Blockchain;
  [BLOCKCHAIN_NAME.XDAI]: Blockchain;
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: Blockchain;
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
  [BLOCKCHAIN_NAME.POLYGON]: {
    key: BLOCKCHAIN_NAME.POLYGON,
    name: 'Harmony',
    img: `${imageBaseSrc}harmony.svg`
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
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: {
    key: BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
    name: 'Kovan',
    img: `${imageBaseSrc}kovan.png`
  }
};

import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

interface Blockchain {
  key: BLOCKCHAIN_NAME;
  label: string;
  name: string;
  img: string;
}

type Blockchains = {
  [BLOCKCHAIN_NAME.ETHEREUM]: Blockchain;
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: Blockchain;
  [BLOCKCHAIN_NAME.POLYGON]: Blockchain;
  [BLOCKCHAIN_NAME.TRON]: Blockchain;
  [BLOCKCHAIN_NAME.XDAI]: Blockchain;
};

const imageBaseSrc = 'assets/images/icons/coins/';

export const BLOCKCHAINS: Blockchains = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    key: BLOCKCHAIN_NAME.ETHEREUM,
    label: 'ETH',
    name: 'Ethereum',
    img: `${imageBaseSrc}eth.png`
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    key: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    label: 'BSC',
    name: 'Binance Smart Chain',
    img: `${imageBaseSrc}bnb.svg`
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    key: BLOCKCHAIN_NAME.POLYGON,
    label: 'POLYGON',
    name: 'Polygon',
    img: `${imageBaseSrc}polygon.svg`
  },
  [BLOCKCHAIN_NAME.TRON]: {
    key: BLOCKCHAIN_NAME.TRON,
    label: 'TRON',
    name: 'TRON',
    img: `${imageBaseSrc}tron.svg`
  },
  [BLOCKCHAIN_NAME.XDAI]: {
    key: BLOCKCHAIN_NAME.XDAI,
    label: 'XDAI',
    name: 'XDAI',
    img: `${imageBaseSrc}xdai.svg`
  }
};

import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeBlockchain } from '../../../models/BridgeBlockchain';

type Blockchains = {
  [BLOCKCHAIN_NAME.ETHEREUM]: BridgeBlockchain;
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: BridgeBlockchain;
  [BLOCKCHAIN_NAME.POLYGON]: BridgeBlockchain;
  [BLOCKCHAIN_NAME.TRON]: BridgeBlockchain;
};

export const BLOCKCHAINS: Blockchains = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    key: BLOCKCHAIN_NAME.ETHEREUM,
    label: 'ETH',
    name: 'Ethereum',
    img: 'eth.png',
    baseUrl: 'https://etherscan.io',
    addressBaseUrl: 'https://etherscan.io/address/',
    scanner: {
      label: 'Etherscan',
      baseUrl: 'https://etherscan.io/token/'
    }
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    key: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    label: 'BSC',
    name: 'Binance Smart Chain',
    img: 'bnb.svg',
    baseUrl: 'https://bscscan.com',
    addressBaseUrl: 'https://bscscan.com/address/',
    scanner: {
      label: 'BSCscan',
      baseUrl: 'https://bscscan.com/token/'
    }
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    key: BLOCKCHAIN_NAME.POLYGON,
    label: 'POLYGON',
    name: 'Polygon',
    img: 'polygon.svg',
    baseUrl: 'https://explorer-mainnet.maticvigil.com/',
    addressBaseUrl: 'https://explorer-mainnet.maticvigil.com/address/',
    scanner: {
      label: 'Matic explorer',
      baseUrl: 'https://explorer-mainnet.maticvigil.com/address/'
    }
  },
  [BLOCKCHAIN_NAME.TRON]: {
    key: BLOCKCHAIN_NAME.TRON,
    label: 'TRON',
    name: 'TRON',
    img: 'tron.svg',
    baseUrl: 'https://tronscan.org/#/',
    addressBaseUrl: 'https://tronscan.org/#/address/',
    scanner: {
      label: 'Tron explorer',
      baseUrl: 'https://tronscan.org/#/token20/'
    }
  }
};

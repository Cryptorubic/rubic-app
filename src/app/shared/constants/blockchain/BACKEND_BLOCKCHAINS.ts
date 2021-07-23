import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';

export const FROM_BACKEND_BLOCKCHAINS = {
  ethereum: BLOCKCHAIN_NAME.ETHEREUM,
  'binance-smart-chain': BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  polygon: BLOCKCHAIN_NAME.POLYGON,
  'tron-mainnet': BLOCKCHAIN_NAME.TRON,
  xdai: BLOCKCHAIN_NAME.XDAI,
  'ethereum-test': BLOCKCHAIN_NAME.ETHEREUM_TESTNET
};

export const TO_BACKEND_BLOCKCHAINS = {
  [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binance-smart-chain',
  [BLOCKCHAIN_NAME.POLYGON]: 'polygon'
};

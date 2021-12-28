import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export const ShouldCalculateGasBlockchain = {
  [BLOCKCHAIN_NAME.ETHEREUM]: true,
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: false,
  [BLOCKCHAIN_NAME.POLYGON]: false,
  [BLOCKCHAIN_NAME.HARMONY]: false,
  [BLOCKCHAIN_NAME.AVALANCHE]: true,
  [BLOCKCHAIN_NAME.FANTOM]: false
};

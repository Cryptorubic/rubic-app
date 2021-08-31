import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export const shouldCalculateGasInBlockchain = {
  [BLOCKCHAIN_NAME.ETHEREUM]: true,
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: false,
  [BLOCKCHAIN_NAME.POLYGON]: false,
  [BLOCKCHAIN_NAME.HARMONY]: false
};

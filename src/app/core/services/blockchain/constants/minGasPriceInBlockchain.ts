import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';

// in Wei
export const minGasPriceInBlockchain = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: new BigNumber(5_000_000_000),
  [BLOCKCHAIN_NAME.POLYGON]: new BigNumber(100_000_000_000)
};

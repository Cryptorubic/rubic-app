import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';

// in Wei
export const minGasPriceInBlockchain = {
  [BLOCKCHAIN_NAME.POLYGON]: new BigNumber(5000000000)
};

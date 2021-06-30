import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';

export interface CryptoTapFullPriceFeeInfo {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: BigNumber;
  [BLOCKCHAIN_NAME.POLYGON]: BigNumber;
}

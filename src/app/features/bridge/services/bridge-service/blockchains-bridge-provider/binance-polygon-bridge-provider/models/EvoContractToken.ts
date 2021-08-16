import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export interface EvoContractTokenInBlockchains {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: EvoContractToken;
  [BLOCKCHAIN_NAME.POLYGON]: EvoContractToken;
}

export interface EvoContractToken {
  symbol: string;
  address: string;
  defaultFee: BigNumber;
  defaultFeeBase: BigNumber;
  feeTarget: string;
  defaultMinAmount: BigNumber;
  defaultMaxAmount: BigNumber;
  bonus: number;
  index: number;
}

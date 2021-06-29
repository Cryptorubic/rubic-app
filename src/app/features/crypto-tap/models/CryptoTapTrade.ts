import BigNumber from 'bignumber.js';

export interface CryptoTapTrade {
  fromAmount: BigNumber;
  toAmount: BigNumber;
  fee: BigNumber;
}

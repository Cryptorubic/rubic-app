import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';

export interface TradeData {
  /**
   * Blockchain name.
   */
  blockchain: BLOCKCHAIN_NAME;

  /**
   * Amount of output without slippage in absolute token units (WITHOUT decimals).
   */
  amount: BigNumber;

  /**
   * Amount of predicted gas limit in absolute gas units.
   */
  gasLimit: string;

  /**
   * Amount of predicted gas fee in usd$.
   */
  gasFeeInUsd: BigNumber;

  /**
   * Amount of predicted gas fee in Ether.
   */
  gasFeeInEth: BigNumber;
}

import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

interface InstantTrade {
  blockchain: BLOCKCHAIN_NAME;

  from: {
    token: InstantTradeToken;
    /**
     * Amount of input (WITH decimals)
     */
    amount: BigNumber;
  };
  to: {
    token: InstantTradeToken;
    /**
     * Amount of output without slippage (WITH decimals)
     */
    amount: BigNumber;
  };

  /**
   * Amount of predicted gas limit in absolute gas units
   */
  estimatedGas: string | BigNumber;

  /**
   * Amount of predicted gas fee in usd$
   */
  gasFeeInUsd: BigNumber;

  /**
   * Amount of predicted gas fee in Ether
   */
  gasFeeInEth: BigNumber;

  /**
   * Gas price in Wei
   */
  gasPrice?: string;

  /**
   * Additional options
   */
  options?: any;
}

export default InstantTrade;

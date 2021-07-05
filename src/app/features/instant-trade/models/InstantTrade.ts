import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';

interface InstantTrade {
  from: {
    token: InstantTradeToken;
    /**
     * Amount of input in absolute token units (WITHOUT decimals)
     */
    amount: BigNumber;
  };
  to: {
    token: InstantTradeToken;
    /**
     * Amount of output without slippage in absolute token units (WITHOUT decimals)
     */
    amount: BigNumber;
  };

  /**
   * Amount of predicted gas limit in absolute gas units
   */
  estimatedGas: BigNumber;

  /**
   * Amount of predicted gas fee in usd$
   */
  gasFeeInUsd: BigNumber;

  /**
   * Amount of predicted gas fee in Ether
   */
  gasFeeInEth: BigNumber;

  /**
   * Additional options
   */
  options?: any;
}

export default InstantTrade;

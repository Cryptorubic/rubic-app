import BigNumber from 'bignumber.js';
import InstantTradeToken from '@features/swaps/features/instant-trade/models/instant-trade-token';
import { BlockchainName } from 'rubic-sdk';

interface WrapTrade {
  blockchain: BlockchainName;

  from: {
    token: InstantTradeToken;

    /**
     * Amount of input (WITH decimals).
     */
    amount: BigNumber;
  };

  to: {
    token: InstantTradeToken;

    /**
     * Amount of output without slippage (WITH decimals).
     */
    amount: BigNumber;
  };
}

export default WrapTrade;

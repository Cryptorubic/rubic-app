import BigNumber from 'bignumber.js';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { SymbolToken } from '@shared/models/tokens/symbol-token';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';

interface InstantTrade {
  blockchain: BLOCKCHAIN_NAME;

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

  /**
   * Tokens in a swap route.
   */
  path?: SymbolToken[];

  /**
   * Amount of predicted gas limit in absolute gas units.
   */
  gasLimit?: string;

  /**
   * Gas price in Wei.
   */
  gasPrice?: string;

  /**
   * Amount of predicted gas fee in usd$.
   */
  gasFeeInUsd?: BigNumber;

  /**
   * Amount of predicted gas fee in Ether.
   */
  gasFeeInEth?: BigNumber;

  /**
   * Error.
   */
  error?: RubicError<ERROR_TYPE>;
}

export default InstantTrade;

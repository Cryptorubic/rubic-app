import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import InstantTradeToken from '../models/InstantTradeToken';
import InstantTrade from '../models/InstantTrade';

abstract class InstantTradeService {
  /**
   * @description calculate instant trade parameters
   * @param fromAmount input amount in absolute value (no pre-multiplied by decimals)
   * @param fromToken input token or blockchain native coin
   * @param toToken output token or blockchain native coin
   * @return parameters of possible trade
   */
  public abstract calculateTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<InstantTrade>;

  /**
   * @description create real trade with calculated parameters and resolve the promise when the trade transaction is included in the block
   * @param trade instant trade parameters
   * @param [options] additional options
   * @param [options.onConfirm] callback to execute when trade transaction enters the mempool
   * @param [options.onApprove] callback to execute when approve transaction enters the mempool. i
   *  If the account already has the required allowance, then this callback will be called with a hash equal to null
   */
  public abstract createTrade(
    trade: InstantTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string | null) => void;
    }
  ): Promise<TransactionReceipt>;
}

export default InstantTradeService;

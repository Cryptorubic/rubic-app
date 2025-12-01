import { ErrorInterface } from '@cryptorubic/core';
import { EIP1559Gas, SingleGasPrice } from '@cryptorubic/web3';

export interface SwapTransactionOptions {
  /**
   * Callback to be called, when user confirm swap transaction.
   * @param hash Transaction hash.
   */
  onConfirm?: (hash: string) => void;

  /**
   * Callback to be called, when user confirm approve transaction.
   * @param hash Transaction hash.
   */
  onApprove?: (hash: string | null) => void;

  /**
   * Callback to be called, when swap warning occurs.
   * @param warnings
   */
  onWarning?: (warnings: ErrorInterface[]) => void;

  /**
   * Tokens receiver address.
   */
  receiverAddress?: string;

  /**
   * Transaction gas price options.
   */
  gasPriceOptions?: EIP1559Gas | SingleGasPrice;

  /**
   * Evm-transaction gas limit.
   */
  gasLimit?: string;

  /**
   * gasLimit multiplier (to change ratio for specific chain)
   */
  gasLimitRatio?: number;

  /**
   * Approve evm-transaction gas limit.
   * Will be used for approve transaction, if it is called before swap.
   */
  approveGasLimit?: string;

  /**
   * Tron-transaction fee limit.
   */
  feeLimit?: number;

  /**
   * Approve tron-transaction fee limit.
   * Will be used for approve transaction, if it is called before swap.
   */
  approveFeeLimit?: number;

  testMode?: boolean;

  useCacheData?: boolean;

  skipAmountCheck?: boolean;

  referrer?: string;

  /**
   * Use in case of eip-155
   */
  useEip155?: boolean;

  /**
   * Address for refund assets if error occurs
   */
  refundAddress?: string;

  solanaSponsorParams?: {
    tradeId: string;
    feePayer: string; // Public key of the fee payer
  };
}

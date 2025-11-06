/**
 * Transaction request params.
 */
export interface SquidrouterTransactionRequest {
  readonly fromAddress: string;
  readonly fromChain: string;
  readonly fromToken: string;
  readonly fromAmount: string;
  readonly toChain: string;
  readonly toToken: string;
  readonly toAddress: string;
  readonly slippage: number;
  readonly enableForecall?: true;
}

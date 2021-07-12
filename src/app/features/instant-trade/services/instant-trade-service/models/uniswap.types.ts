import BigNumber from 'bignumber.js';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { AbiItem } from 'web3-utils';

interface UniSwapTrade {
  amountIn: string;
  amountOutMin: string;
  path: string[];
  to: string;
  deadline: number;
}

interface UniswapRoute {
  path: string[];
  outputAbsoluteAmount: BigNumber;
}

interface Gas {
  estimatedGas;
  gasFeeInUsd;
  gasFeeInEth;
}

enum SWAP_METHOD {
  TOKENS_TO_TOKENS = 'swapExactTokensForTokens',
  ETH_TO_TOKENS = 'swapExactETHForTokens',
  TOKENS_TO_ETH = 'swapExactTokensForETH',
  TOKENS_TO_TOKENS_SUPPORTING_FEE = 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
  ETH_TO_TOKENS_SUPPORTING_FEE = 'swapExactETHForTokensSupportingFeeOnTransferTokens',
  TOKENS_TO_ETH_SUPPORTING_FEE = 'swapExactTokensForETHSupportingFeeOnTransferTokens'
}

export type GasCalculationMethod = (
  amountIn: string,
  amountOutMin: string,
  path: string[],
  walletAddress: string,
  deadline: number,
  contractAddress: string,
  web3Public: Web3Public,
  tokensToEthEstimatedGas: BigNumber[],
  abi: AbiItem[]
) => Promise<BigNumber>;

export { UniswapRoute, SWAP_METHOD, Gas, UniSwapTrade };

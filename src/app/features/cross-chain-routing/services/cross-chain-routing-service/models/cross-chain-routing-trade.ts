import BigNumber from 'bignumber.js';
import { SupportedCrossChainSwapBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-swap-blockchain';
import { TokenAmount } from '@shared/models/tokens/token-amount';

export interface CrossChainRoutingTrade {
  // from blockchain data
  fromBlockchain: SupportedCrossChainSwapBlockchain;
  fromContractIndex: number;
  tokenIn: TokenAmount;
  tokenInAmount: BigNumber;
  firstTransitTokenAmount: BigNumber;
  firstPath: string[];

  // to blockchain data
  toBlockchain: SupportedCrossChainSwapBlockchain;
  toContractIndex: number;
  secondTransitTokenAmount: BigNumber;
  tokenOut: TokenAmount;
  tokenOutAmount: BigNumber;
  secondPath: string[];

  // fee data
  transitTokenFee: number; // in percents
  cryptoFee: number; // in Eth units

  // gas data
  gasLimit?: BigNumber;
  gasPrice?: string; // in Wei
}

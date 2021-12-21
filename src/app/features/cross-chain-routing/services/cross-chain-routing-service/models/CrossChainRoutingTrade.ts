import BigNumber from 'bignumber.js';
import { SupportedCrossChainSwapBlockchain } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';
import { TokenAmount } from '@shared/models/tokens/TokenAmount';

export interface CrossChainRoutingTrade {
  // from blockchain data
  fromBlockchain: SupportedCrossChainSwapBlockchain;
  fromProviderIndex: number;
  tokenIn: TokenAmount;
  tokenInAmount: BigNumber;
  firstTransitTokenAmount: BigNumber;
  firstPath: string[];
  fromSlippage: number;

  // to blockchain data
  toBlockchain: SupportedCrossChainSwapBlockchain;
  toProviderIndex: number;
  secondTransitTokenAmount: BigNumber;
  tokenOut: TokenAmount;
  tokenOutAmount: BigNumber;
  secondPath: string[];
  toSlippage: number;

  // fee data
  transitTokenFee: number; // in percents
  cryptoFee: number; // in Eth units

  // gas data
  gasLimit?: BigNumber;
  gasPrice?: string; // in Wei
}

import BigNumber from 'bignumber.js';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { TokenAmount } from '@shared/models/tokens/TokenAmount';

export interface CrossChainTrade {
  // from blockchain data
  fromBlockchain: SupportedCrossChainBlockchain;
  fromProviderIndex: number;
  tokenIn: TokenAmount;
  tokenInAmount: BigNumber;
  firstTransitTokenAmount: BigNumber;
  firstPath: string[];
  fromSlippage: number;

  // to blockchain data
  toBlockchain: SupportedCrossChainBlockchain;
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

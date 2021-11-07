import BigNumber from 'bignumber.js';
import { SupportedCrossChainSwapBlockchain } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';
import { SymbolToken } from '@shared/models/tokens/SymbolToken';
import { TokenAmount } from '@shared/models/tokens/TokenAmount';

export interface CrossChainRoutingTrade {
  // from blockchain data
  fromBlockchain: SupportedCrossChainSwapBlockchain;
  fromContractIndex: number;
  tokenIn: TokenAmount;
  tokenInAmount: BigNumber;
  firstTransitTokenAmount: BigNumber;
  firstPath: SymbolToken[];

  // to blockchain data
  toBlockchain: SupportedCrossChainSwapBlockchain;
  toContractIndex: number;
  secondTransitTokenAmount: BigNumber;
  tokenOut: TokenAmount;
  tokenOutAmount: BigNumber;
  secondPath: SymbolToken[];

  // fee data
  transitTokenFee: number; // in percents
  cryptoFee: number; // in Eth units

  // gas data
  gasLimit?: BigNumber;
  gasPrice?: string; // in Wei
}

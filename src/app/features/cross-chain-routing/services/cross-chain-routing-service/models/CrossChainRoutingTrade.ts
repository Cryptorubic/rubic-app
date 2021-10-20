import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import BigNumber from 'bignumber.js';
import { SupportedCrossChainSwapBlockchain } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';

export interface CrossChainRoutingTrade {
  fromBlockchain: SupportedCrossChainSwapBlockchain;
  toBlockchain: SupportedCrossChainSwapBlockchain;
  tokenIn: BlockchainToken;
  firstPath: string[];
  tokenInAmount: BigNumber;
  firstTransitTokenAmount: BigNumber;
  rbcTokenOutAmountAbsolute: string;
  secondTransitTokenAmount: BigNumber;
  tokenOut: BlockchainToken;
  secondPath: string[];
  tokenOutAmount: BigNumber;
}

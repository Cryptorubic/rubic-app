import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import BigNumber from 'bignumber.js';
import { SupportedCrossChainSwapBlockchain } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';

export interface CrossChainRoutingTrade {
  // from blockchain data
  fromBlockchain: SupportedCrossChainSwapBlockchain;
  fromContractIndex: number;
  tokenIn: BlockchainToken;
  tokenInAmount: BigNumber;
  firstTransitTokenAmount: BigNumber;
  rbcTokenOutAmountAbsolute: string;
  firstPath: string[];

  // to blockchain data
  toBlockchain: SupportedCrossChainSwapBlockchain;
  toContractIndex: number;
  secondTransitTokenAmount: BigNumber;
  tokenOut: BlockchainToken;
  tokenOutAmount: BigNumber;
  secondPath: string[];
}

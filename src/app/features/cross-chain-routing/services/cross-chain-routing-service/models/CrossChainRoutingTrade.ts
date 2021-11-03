import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import BigNumber from 'bignumber.js';
import { SupportedCrossChainSwapBlockchain } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';
import { SymbolToken } from '@shared/models/tokens/SymbolToken';

export interface CrossChainRoutingTrade {
  // from blockchain data
  fromBlockchain: SupportedCrossChainSwapBlockchain;
  fromContractIndex: number;
  tokenIn: BlockchainToken;
  tokenInAmount: BigNumber;
  firstTransitTokenAmount: BigNumber;
  rbcTokenOutAmountAbsolute: string;
  firstPath: SymbolToken[];

  // to blockchain data
  toBlockchain: SupportedCrossChainSwapBlockchain;
  toContractIndex: number;
  secondTransitTokenAmount: BigNumber;
  tokenOut: BlockchainToken;
  tokenOutAmount: BigNumber;
  secondPath: SymbolToken[];
}

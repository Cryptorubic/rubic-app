import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import BigNumber from 'bignumber.js';

export interface CrossChainRoutingTrade {
  fromBlockchain: BLOCKCHAIN_NAME;
  toBlockchain: BLOCKCHAIN_NAME;
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

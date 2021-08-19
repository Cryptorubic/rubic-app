import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import BigNumber from 'bignumber.js';

export interface CrossChainRoutingTrade {
  fromBlockchain: BLOCKCHAIN_NAME;
  toBlockchain: BLOCKCHAIN_NAME;
  tokenIn: BlockchainToken;
  tokenInAmount: BigNumber;
  rbcTokenOutAmountAbsolute: string;
  firstPath: string[];
  tokenOut: BlockchainToken;
  tokenOutAmount: BigNumber;
  secondPath: string[];
}

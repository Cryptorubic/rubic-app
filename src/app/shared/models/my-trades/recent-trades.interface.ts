import { BlockchainName } from '../blockchain/blockchain-name';
import { CrossChainProviderType } from '../swaps/cross-chain-provider-type.enum';
import { TokenAmount } from '../tokens/token-amount';
import { RecentTradeStatus } from './recent-trade-status.enum';

export interface RecentTrade {
  srcTxHash: string;
  dstTxHash?: string;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  fromToken: TokenAmount;
  toToken: TokenAmount;
  amountIn: number;
  crossChainProviderType: CrossChainProviderType;
  timestamp: number;
  status?: RecentTradeStatus;
}

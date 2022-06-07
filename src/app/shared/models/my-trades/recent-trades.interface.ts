import { CROSS_CHAIN_PROVIDER } from '@app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { BlockchainName } from '../blockchain/blockchain-name';
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
  crossChainProviderType: CROSS_CHAIN_PROVIDER;
  timestamp: number;
  status?: RecentTradeStatus;
}

import { CROSS_CHAIN_PROVIDER } from '@app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { BlockchainName } from '../blockchain/blockchain-name';
import { Token } from '../tokens/token';

export interface RecentTrade {
  srcTxHash: string;
  dstTxHash?: string;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  fromToken: Token;
  toToken: Token;
  crossChainProviderType: CROSS_CHAIN_PROVIDER;
  timestamp: number;
  _parsed?: boolean;
  _revertable?: boolean;
  _symbiosisSuccess?: boolean;
}

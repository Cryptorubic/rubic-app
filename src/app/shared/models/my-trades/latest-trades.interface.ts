import { BlockchainName } from '../blockchain/blockchain-name';
import { CrossChainProviderType } from '../swaps/cross-chain-provider-type.enum';
import { TokenAmount } from '../tokens/token-amount';

export interface LatestTrade {
  srcTxHash: string;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  fromToken: TokenAmount;
  toToken: TokenAmount;
  amountIn: number;
  crossChainProviderType: CrossChainProviderType;
  timestamp: number;
  status?: unknown;
}

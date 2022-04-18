import { EthLikeBlockchainName } from '@shared/models/blockchain/blockchain-name';
import { SymbolToken } from '@shared/models/tokens/symbol-token';

export interface UniswapV2Constants {
  blockchain: EthLikeBlockchainName;
  contractAddress: string;
  wethAddress: string;
  routingProviders: SymbolToken[];
  maxTransitTokens: number;
}

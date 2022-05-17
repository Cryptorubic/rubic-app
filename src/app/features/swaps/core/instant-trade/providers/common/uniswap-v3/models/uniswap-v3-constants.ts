import { EthLikeBlockchainName } from '@shared/models/blockchain/blockchain-name';
import { SymbolToken } from '@shared/models/tokens/symbol-token';
import { LiquidityPool } from '@features/swaps/core/instant-trade/providers/common/uniswap-v3/utils/quoter-controller/models/liquidity-pool';

export interface UniswapV3Constants {
  blockchain: EthLikeBlockchainName;
  wethAddress: string;
  routerTokens: Record<string, SymbolToken>;
  routerLiquidityPools: LiquidityPool[];
}

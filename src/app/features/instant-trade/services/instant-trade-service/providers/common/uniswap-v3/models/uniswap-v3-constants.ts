import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { ContractAddressNetMode, NetMode } from '@shared/models/blockchain/net-mode';
import { SymbolToken } from '@shared/models/tokens/symbol-token';
import { LiquidityPool } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/utils/quoter-controller/models/liquidity-pool';

export interface UniswapV3Constants {
  blockchain: BLOCKCHAIN_NAME;
  wethAddressNetMode: ContractAddressNetMode;
  routerTokensNetMode: Record<NetMode, Record<string, SymbolToken>>;
  routerLiquidityPoolsNetMode: Record<NetMode, LiquidityPool[]>;
}

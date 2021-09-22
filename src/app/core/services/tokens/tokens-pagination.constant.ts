import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokensNetworkState } from 'src/app/shared/models/tokens/paginated-tokens';

export const TOKENS_PAGINATION = {
  [BLOCKCHAIN_NAME.ETHEREUM]: { count: undefined, page: 2, maxPage: 3 },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: { count: undefined, page: 2, maxPage: 3 },
  [BLOCKCHAIN_NAME.POLYGON]: { count: undefined, page: 2, maxPage: 3 },
  [BLOCKCHAIN_NAME.HARMONY]: { count: undefined, page: 2, maxPage: 3 }
} as TokensNetworkState;

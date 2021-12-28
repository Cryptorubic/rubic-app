import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { TokensNetworkState } from 'src/app/shared/models/tokens/paginated-tokens';

export const TokensPagination: TokensNetworkState = {
  [BLOCKCHAIN_NAME.ETHEREUM]: { page: 2, maxPage: 3 },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: { page: 2, maxPage: 3 },
  [BLOCKCHAIN_NAME.POLYGON]: { page: 2, maxPage: 3 },
  [BLOCKCHAIN_NAME.HARMONY]: { page: 2, maxPage: 2 },
  [BLOCKCHAIN_NAME.AVALANCHE]: { page: 1, maxPage: 1 },
  [BLOCKCHAIN_NAME.MOONRIVER]: { page: 1, maxPage: 1 },
  [BLOCKCHAIN_NAME.FANTOM]: { page: 1, maxPage: 1 },
  [BLOCKCHAIN_NAME.SOLANA]: { page: 1, maxPage: 2 }
};

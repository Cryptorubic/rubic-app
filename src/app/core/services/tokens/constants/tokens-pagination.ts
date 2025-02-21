import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { PaginatedPage, TokensNetworkState } from '@shared/models/tokens/paginated-tokens';

const defaultState: PaginatedPage = { page: 1, maxPage: 1 };

export const TOKENS_PAGINATION: TokensNetworkState = {
  [BLOCKCHAIN_NAME.ETHEREUM]: { ...defaultState },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: { ...defaultState },
  [BLOCKCHAIN_NAME.POLYGON]: { ...defaultState },
  [BLOCKCHAIN_NAME.HARMONY]: { ...defaultState },
  [BLOCKCHAIN_NAME.AVALANCHE]: { ...defaultState },
  [BLOCKCHAIN_NAME.FANTOM]: { ...defaultState },
  [BLOCKCHAIN_NAME.MOONRIVER]: { ...defaultState },
  [BLOCKCHAIN_NAME.ARBITRUM]: { ...defaultState },
  [BLOCKCHAIN_NAME.AURORA]: { ...defaultState },
  [BLOCKCHAIN_NAME.SOLANA]: { ...defaultState },
  [BLOCKCHAIN_NAME.NEAR]: { ...defaultState },
  [BLOCKCHAIN_NAME.TELOS]: { ...defaultState }
};

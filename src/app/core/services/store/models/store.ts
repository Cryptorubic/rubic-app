import { WALLET_NAME } from 'src/app/core/wallets/components/wallets-modal/models/providers';
import { LocalToken } from 'src/app/shared/models/tokens/local-token';

export interface Store {
  /**
   * Count of unread trades by user.
   */
  unreadTrades: number;

  /**
   * Current wallet provider selected by user.
   */
  provider: WALLET_NAME;

  /**
   * User application settings (It, Bridge, Cross-chain).
   */
  settings: unknown;

  /**
   * Current user theme.
   */
  theme: 'dark' | 'light';

  /**
   * Current wallet chain id.
   */
  chainId: number;

  /**
   * User favorite tokens.
   */
  favoriteTokens: LocalToken[];
}

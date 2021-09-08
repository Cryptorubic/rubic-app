import { WALLET_NAME } from 'src/app/core/wallets/components/wallets-modal/models/providers';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';

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
   * User tokens that define as favorite for display first.
   */
  favoriteTokens: AvailableTokenAmount | AvailableTokenAmount[];
}

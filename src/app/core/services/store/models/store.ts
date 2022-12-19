import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { LocalToken } from 'src/app/shared/models/tokens/local-token';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { FormSteps } from '@core/services/google-tag-manager/models/google-tag-manager';
import { RecentTrade } from '@shared/models/recent-trades/recent-trade';

export interface Store {
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

  /**
   * Wallet target address.
   */
  targetAddress: string;

  /**
   * Passed form steps for instant-trade swap.
   */
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: FormSteps;

  /**
   * Passed form steps for cross-chain swap.
   */
  [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: FormSteps;

  /**
   * Latest cross-chain trades by address.
   */
  recentTrades: {
    [address: string]: RecentTrade[];
  };

  /**
   * Count of unread trades by address.
   */
  unreadTrades: {
    [address: string]: number;
  };
}

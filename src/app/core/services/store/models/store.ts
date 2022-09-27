import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { LocalToken } from 'src/app/shared/models/tokens/local-token';
import { BlockchainName } from 'rubic-sdk';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { FormSteps } from '@core/services/google-tag-manager/models/google-tag-manager';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';
import { ProvidersSort } from '@features/swaps/features/cross-chain-routing/components/providers-list-sorting/models/providers-sort';

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
   * Wallet target address for cross-chain trade.
   */
  targetAddress: {
    address: string;
    blockchain: BlockchainName;
  };

  /**
   * Passed form steps for bridge swap.
   */
  [SWAP_PROVIDER_TYPE.BRIDGE]: FormSteps;

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

  /**
   * Providers sorting type.
   */
  sortingType: ProvidersSort;
}

import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { LocalToken } from 'src/app/shared/models/tokens/local-token';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { FormSteps } from '@core/services/google-tag-manager/models/google-tag-manager';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';

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

  /**
   * Wallet target address for cross-chain trade.
   */
  targetAddress: {
    address: string;
    blockchain: BlockchainName;
  };

  [SWAP_PROVIDER_TYPE.BRIDGE]: FormSteps;

  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: FormSteps;

  [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: FormSteps;

  recentTrades: {
    [address: string]: RecentTrade[];
  };
}

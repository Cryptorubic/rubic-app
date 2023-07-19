import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { LocalToken } from 'src/app/shared/models/tokens/local-token';
import { RecentTrade } from '@shared/models/recent-trades/recent-trade';
import { StorageToken } from '@core/services/tokens/models/storage-token';
import { ChangenowPostTrade } from '@features/swaps/core/services/changenow-post-trade-service/models/changenow-post-trade';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import {
  CcrSettingsForm,
  ItSettingsForm
} from '@features/swaps/core/services/settings-service/models/settings-form-controls';
import { FormSteps } from '@core/services/google-tag-manager/models/google-tag-manager';

export type Store = {
  [key in `RUBIC_SETTINGS_${SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING}`]: CcrSettingsForm;
} & {
  [key in `RUBIC_SETTINGS_${SWAP_PROVIDER_TYPE.INSTANT_TRADE}`]: ItSettingsForm;
} & {
  [key in `RUBIC_TRADES_${SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING}`]: FormSteps;
} & {
  [key in `RUBIC_TRADES_${SWAP_PROVIDER_TYPE.INSTANT_TRADE}`]: FormSteps;
} & {
  /**
   * Current wallet provider selected by user.
   */
  RUBIC_PROVIDER: WALLET_NAME;

  /**
   * Current user theme.
   */
  RUBIC_THEME: 'dark' | 'light';

  /**
   * Current wallet chain id.
   */
  RUBIC_CHAIN_ID: number;

  /**
   * User favorite tokens.
   */
  RUBIC_FAVORITE_TOKENS: LocalToken[];

  /**
   * Wallet target address.
   */
  RUBIC_TARGET_ADDRESS: string;

  /**
   * Latest cross-chain trades by address.
   */
  RUBIC_RECENT_TRADES: {
    [address: string]: RecentTrade[];
  };

  /**
   * Count of unread trades by address.
   */
  RUBIC_UNREAD_TRADES: {
    [address: string]: number;
  };

  RUBIC_TOKENS: StorageToken[];

  RUBIC_CHANGENOW_POST_TRADE: ChangenowPostTrade;

  RUBIC_CHANGENOW_RECENT_TRADE: ChangenowPostTrade[];
};

export const storeRecord: Record<keyof Store, null> = {
  RUBIC_PROVIDER: null,
  RUBIC_THEME: null,
  RUBIC_CHAIN_ID: null,
  RUBIC_FAVORITE_TOKENS: null,
  RUBIC_TARGET_ADDRESS: null,
  RUBIC_RECENT_TRADES: null,
  RUBIC_UNREAD_TRADES: null,
  RUBIC_TOKENS: null,
  RUBIC_CHANGENOW_POST_TRADE: null,
  RUBIC_CHANGENOW_RECENT_TRADE: null,
  RUBIC_SETTINGS_CROSS_CHAIN_ROUTING: null,
  RUBIC_SETTINGS_INSTANT_TRADE: null,
  RUBIC_TRADES_CROSS_CHAIN_ROUTING: null,
  RUBIC_TRADES_INSTANT_TRADE: null
};

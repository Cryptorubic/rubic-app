import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { LocalToken } from 'src/app/shared/models/tokens/local-token';
import { RecentTrade } from '@shared/models/recent-trades/recent-trade';
import { StorageToken } from '@core/services/tokens/models/storage-token';

import { FormSteps } from '@core/services/google-tag-manager/models/google-tag-manager';
import {
  CcrSettingsForm,
  ItSettingsForm
} from '@features/trade/services/settings-service/models/settings-form-controls';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { CrossChainTransferTrade } from '@features/trade/models/cn-trade';
import BigNumber from 'bignumber.js';

export type Store = {
  [key in `RUBIC_OPTIONS_${SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING}`]: CcrSettingsForm;
} & {
  [key in `RUBIC_OPTIONS_${SWAP_PROVIDER_TYPE.INSTANT_TRADE}`]: ItSettingsForm;
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
   * User agreement to the Terms of Use and Privacy Policy.
   */
  RUBIC_AGREEMENT_WITH_RULES_V1: boolean;

  /**
   * Trade volumes.
   */
  RUBIC_TOTAL_VALUES: { instantTrades: BigNumber; bridges: BigNumber };

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

  RUBIC_CHANGENOW_POST_TRADE: CrossChainTransferTrade;

  RUBIC_DEPOSIT_RECENT_TRADE: CrossChainTransferTrade[];

  IS_RUSSIAN_IP: boolean;

  LOBSTR_WALLET_ADDRESS: string;

  RAILGUN_ENCRYPTION_CREDS_V1: string;
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
  RUBIC_DEPOSIT_RECENT_TRADE: null,
  RUBIC_OPTIONS_CROSS_CHAIN_ROUTING: null,
  RUBIC_OPTIONS_INSTANT_TRADE: null,
  RUBIC_TRADES_CROSS_CHAIN_ROUTING: null,
  RUBIC_TRADES_INSTANT_TRADE: null,
  RUBIC_AGREEMENT_WITH_RULES_V1: null,
  RUBIC_TOTAL_VALUES: null,
  IS_RUSSIAN_IP: null,
  LOBSTR_WALLET_ADDRESS: null,
  RAILGUN_ENCRYPTION_CREDS_V1: null
};

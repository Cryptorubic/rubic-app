import InstantTrade from '@features/instant-trade/models/instant-trade';
import { INSTANT_TRADES_STATUS } from '@features/instant-trade/models/instant-trades-trade-status';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export interface ProviderControllerData {
  trade: InstantTrade;
  tradeState: INSTANT_TRADES_STATUS;
  tradeProviderInfo: {
    label: string;
    value: INSTANT_TRADES_PROVIDERS;
  };
  isSelected: boolean;
  needApprove: boolean;
  error?: RubicError<ERROR_TYPE>;
}

import InstantTrade from '@features/instant-trade/models/Instant-trade';
import { INSTANT_TRADES_STATUS } from '@features/instant-trade/models/instant-trades-trade-status';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export interface ProviderControllerData {
  trade: InstantTrade;
  tradeState: INSTANT_TRADES_STATUS;
  tradeProviderInfo: {
    label: string;
    value: INSTANT_TRADE_PROVIDER;
  };
  isSelected: boolean;
  needApprove: boolean;
  error?: RubicError<ERROR_TYPE>;
}

import InstantTrade from '@features/instant-trade/models/instant-trade';
import { INSTANT_TRADE_STATUS } from '@features/instant-trade/models/instant-trades-trade-status';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export interface InstantTradeProviderData {
  trade: InstantTrade;
  tradeState: INSTANT_TRADE_STATUS;
  providerInfo: {
    label: string;
    name: INSTANT_TRADE_PROVIDER;
  };
  isSelected: boolean;
  needApprove: boolean;
  error?: RubicError<ERROR_TYPE>;
}

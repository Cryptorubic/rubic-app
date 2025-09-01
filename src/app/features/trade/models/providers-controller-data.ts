import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { OnChainTrade, OnChainTradeType } from '@cryptorubic/sdk';
import { INSTANT_TRADE_STATUS } from '@features/trade/models/instant-trades-trade-status';

export interface InstantTradeProviderData {
  readonly name: OnChainTradeType;
  trade: OnChainTrade | null;
  tradeStatus: INSTANT_TRADE_STATUS;
  needApprove: boolean;
  error?: RubicError<ERROR_TYPE>;

  // UI data
  readonly label: string;
  isSelected: boolean;
  fullSize?: boolean;
}

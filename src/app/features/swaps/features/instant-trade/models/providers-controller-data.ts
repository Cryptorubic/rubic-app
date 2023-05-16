import { INSTANT_TRADE_STATUS } from '@features/swaps/features/instant-trade/models/instant-trades-trade-status';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { OnChainTrade, OnChainTradeType } from 'rubic-sdk';

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

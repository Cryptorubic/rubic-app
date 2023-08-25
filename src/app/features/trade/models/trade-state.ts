import { WrappedCrossChainTrade, WrappedOnChainTradeOrNull } from 'rubic-sdk';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';

interface TradefullState {
  trade: WrappedCrossChainTrade | Exclude<WrappedOnChainTradeOrNull, null>;
  status: TRADE_STATUS;
  error: null;
  selectedByUser: boolean;
  needApprove: boolean;
}

interface TradelessState {
  trade: null;
  status: TRADE_STATUS;
  error: RubicError<ERROR_TYPE>;
  selectedByUser: false;
  needApprove: false;
}

export type TradeState = TradefullState | TradelessState;

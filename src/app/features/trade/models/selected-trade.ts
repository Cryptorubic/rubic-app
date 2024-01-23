import { TradeState } from '@features/trade/models/trade-state';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';

export type SelectedTrade = TradeState & {
  selectedByUser: boolean;
  status: TRADE_STATUS;
};

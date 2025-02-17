import { SelectedTrade } from '@features/trade/models/selected-trade';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';

export const defaultTradeState: SelectedTrade = {
  trade: null,
  error: null,
  needApprove: false,
  tradeType: undefined,
  tags: {
    isBest: false,
    cheap: false
  },
  routes: [],
  selectedByUser: false,
  status: TRADE_STATUS.NOT_INITIATED,
  centralizationStatus: null,
  badges: []
};

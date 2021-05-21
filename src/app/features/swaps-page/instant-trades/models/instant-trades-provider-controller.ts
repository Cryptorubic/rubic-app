import InstantTrade from './InstantTrade';
import { INSTANT_TRADES_STATUS } from './instant-trades-trade-status';

export interface InstantTradeProviderController {
  trade: InstantTrade;
  tradeState: INSTANT_TRADES_STATUS;
  tradeProviderInfo: {
    label: string;
  };
  isBestRate: boolean;
}

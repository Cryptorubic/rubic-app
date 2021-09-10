import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { INSTANT_TRADES_STATUS } from 'src/app/features/instant-trade/models/instant-trades-trade-status';
import { INSTANT_TRADES_PROVIDER } from 'src/app/shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

export interface InstantTradeProviderController {
  trade: InstantTrade;
  tradeState: INSTANT_TRADES_STATUS;
  tradeProviderInfo: {
    label: string;
    value: INSTANT_TRADES_PROVIDER;
  };
  isBestRate: boolean;
  isSelected: boolean;
  isCollapsed: boolean;
  needApprove: boolean;
}

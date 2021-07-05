import { PROVIDERS } from 'src/app/features/instant-trade/models/providers.enum';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { INSTANT_TRADES_STATUS } from 'src/app/features/instant-trade/models/instant-trades-trade-status';

export interface InstantTradeProviderController {
  trade: InstantTrade;
  tradeState: INSTANT_TRADES_STATUS;
  tradeProviderInfo: {
    label: string;
    value: PROVIDERS;
  };
  isBestRate: boolean;
}

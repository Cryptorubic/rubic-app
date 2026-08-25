import { TradeState } from '@app/features/trade/models/trade-state';

export function isPrivateTrade(tradeState: TradeState): boolean {
  return Boolean(tradeState.private);
}

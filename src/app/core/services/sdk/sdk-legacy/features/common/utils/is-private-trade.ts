import { TradeState } from '@app/features/trade/models/trade-state';

export function isPrivateTrade(tradeState: TradeState | null): boolean {
  return Boolean(tradeState?.private);
}

import { isPrivateTrade } from '@app/core/services/sdk/sdk-legacy/features/common/utils/is-private-trade';
import { CalculationProgress } from '@features/trade/models/calculationProgress';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { TradeState } from '@features/trade/models/trade-state';

export function isPrivateCalculationDone(
  progress: CalculationProgress | null | undefined
): boolean {
  if (!progress) {
    return false;
  }

  return progress.privateTotal > 0 && progress.privateCurrent === progress.privateTotal;
}

export function getVisibleProviderStates(
  states: TradeState[],
  privateOnly: boolean,
  progress: CalculationProgress | null | undefined,
  lastBestPrivateTradeType: TradeProvider | null | undefined
): TradeState[] {
  const privateStates = states.filter(state => isPrivateTrade(state));
  const lastBestPrivate = lastBestPrivateTradeType
    ? privateStates.find(state => state.tradeType === lastBestPrivateTradeType)
    : undefined;

  if (privateOnly) {
    if (privateStates.length) {
      return privateStates;
    }
    return lastBestPrivate ? [lastBestPrivate] : [];
  }

  const nonPrivateStates = states.filter(state => !isPrivateTrade(state));
  if (!isPrivateCalculationDone(progress)) {
    return lastBestPrivate ? [lastBestPrivate, ...nonPrivateStates] : nonPrivateStates;
  }

  const bestPrivate = privateStates[0];
  return bestPrivate ? [bestPrivate, ...nonPrivateStates] : nonPrivateStates;
}

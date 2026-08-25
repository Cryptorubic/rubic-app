import { isPrivateTrade } from '@app/core/services/sdk/sdk-legacy/features/common/utils/is-private-trade';
import { CalculationProgress } from '@features/trade/models/calculationProgress';
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
  isPrivateOnly: boolean,
  progress: CalculationProgress | null | undefined
): TradeState[] {
  const privateStates = states.filter(state => isPrivateTrade(state));
  if (isPrivateOnly) {
    return privateStates;
  }

  const nonPrivateStates = states.filter(state => !isPrivateTrade(state));
  if (!isPrivateCalculationDone(progress)) {
    return nonPrivateStates;
  }

  const bestPrivate = privateStates[0];
  return bestPrivate ? [bestPrivate, ...nonPrivateStates] : nonPrivateStates;
}

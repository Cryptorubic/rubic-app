import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';

type RoundMode = 'toClosestValue' | 'fixedValue';

@Pipe({
  name: 'withRound'
})
export class WithRoundPipe implements PipeTransform {
  public readonly DEFAULT_DECIMAL_LENGTH = 18;

  transform(
    value: string,
    roundMode: RoundMode,
    decimals = this.DEFAULT_DECIMAL_LENGTH,
    minRound = 5,
    maxRound = 6
  ) {
    if (value?.includes('.')) {
      const startIndex = value.indexOf('.') + 1;

      if (startIndex === value.length) {
        return value.slice(0, value.length - 1);
      }

      let decimalSymbols: number;
      if (roundMode === 'toClosestValue') {
        if (new BigNumber(value).isGreaterThanOrEqualTo(1)) {
          decimalSymbols = minRound;
        } else {
          let startZeroesAmount = 0;
          for (let i = startIndex; i < value.length; ++i) {
            if (value[i] === '0') {
              startZeroesAmount++;
            } else {
              break;
            }
          }
          decimalSymbols = startZeroesAmount + maxRound;
        }
        decimalSymbols = Math.min(decimalSymbols, decimals);
      } else {
        decimalSymbols = decimals;
      }

      let endZeroesAmount = 0;
      for (let i = startIndex + decimalSymbols - 1; i >= startIndex; i--) {
        if (value[i] === '0') {
          endZeroesAmount++;
        } else {
          break;
        }
      }
      decimalSymbols -= endZeroesAmount;

      value = value.slice(0, startIndex + decimalSymbols);

      if (value.endsWith('.')) {
        value = value.slice(0, value.length - 1);
      }
    }

    return value;
  }
}

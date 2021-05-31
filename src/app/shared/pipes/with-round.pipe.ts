import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';
import SwapToken from '../models/tokens/SwapToken';
import InputToken from '../models/tokens/InputToken';

type RoundMode = 'toClosestValue' | 'fixedValue';

@Pipe({
  name: 'withRound'
})
export class WithRoundPipe implements PipeTransform {
  public readonly DEFAULT_DECIMAL_LENGTH = 8;

  transform(
    value: string,
    minRound: number,
    maxRound: number,
    token: SwapToken | InputToken,
    roundMode: RoundMode
  ) {
    if (value?.includes('.')) {
      const startIndex = value.indexOf('.') + 1;

      if (startIndex === value.length) {
        return value;
      }

      let decimalSymbols: number;
      if (roundMode === 'toClosestValue') {
        if (new BigNumber(value).isGreaterThanOrEqualTo(1)) {
          decimalSymbols = minRound;
        } else {
          let zerosAmount = 0;
          for (let i = startIndex; i < value.length; ++i) {
            if (value[i] === '0') {
              zerosAmount++;
            } else {
              break;
            }
          }
          decimalSymbols = zerosAmount + maxRound;
        }
        if (token?.decimals) {
          decimalSymbols = Math.min(decimalSymbols, token.decimals);
        }
      } else {
        decimalSymbols = token?.decimals ? token.decimals : this.DEFAULT_DECIMAL_LENGTH;
      }

      value = value.slice(0, startIndex + decimalSymbols);
    }

    return value;
  }
}

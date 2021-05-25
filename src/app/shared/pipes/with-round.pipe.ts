import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';
import SwapToken from '../models/tokens/SwapToken';
import InputToken from '../models/tokens/InputToken';

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
    roundMode: boolean
  ) {
    if (value?.includes('.')) {
      const startIndex = value.indexOf('.') + 1;

      let decimalSymbols: number;
      if (roundMode) {
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
        decimalSymbols = Math.min(decimalSymbols, token.decimals);
      } else {
        decimalSymbols = token?.decimals ? token.decimals : this.DEFAULT_DECIMAL_LENGTH;
      }

      value = value.slice(0, startIndex + decimalSymbols);
      if (roundMode && new BigNumber(value).isEqualTo(0)) {
        value = '0';
      }
    }

    return value;
  }
}

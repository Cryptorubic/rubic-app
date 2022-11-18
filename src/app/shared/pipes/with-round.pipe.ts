import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BIG_NUMBER_FORMAT } from '@shared/constants/formats/big-number-format';

type RoundMode = 'toClosestValue' | 'fixedValue';

@Pipe({
  name: 'withRound'
})
export class WithRoundPipe implements PipeTransform {
  public readonly DEFAULT_DECIMAL_LENGTH = 18;

  transform(
    value: string,
    roundMode: RoundMode,
    additionalArgs?: {
      decimals?: number;
      minRound?: number;
      maxRound?: number;
      roundingMode?: BigNumber.RoundingMode;
    }
  ): string {
    const decimals = additionalArgs?.decimals ?? this.DEFAULT_DECIMAL_LENGTH;
    const minRound = additionalArgs?.minRound ?? 5;
    const maxRound = additionalArgs?.maxRound ?? 6;

    if (value?.includes('.')) {
      const startIndex = value.indexOf('.') + 1;

      if (startIndex === value.length) {
        return value.slice(0, value.length - 1);
      }

      const bnValue = new BigNumber(value.split(',').join(''));
      let decimalSymbols: number;
      let startZeroesAmount = 0;
      if (roundMode === 'toClosestValue') {
        if (bnValue.isGreaterThanOrEqualTo(1)) {
          decimalSymbols = minRound;
        } else {
          for (let i = startIndex; i < value.length; ++i) {
            if (value[i] === '0') {
              startZeroesAmount++;
            } else {
              break;
            }
          }
          decimalSymbols = startZeroesAmount + maxRound;
        }
        decimalSymbols =
          startZeroesAmount > 6
            ? Math.max(decimalSymbols, decimals)
            : Math.min(decimalSymbols, decimals);

        value = bnValue
          .dp(decimalSymbols, additionalArgs?.roundingMode)
          .toFormat(BIG_NUMBER_FORMAT);
      } else {
        decimalSymbols = decimals;
      }

      value = value.slice(0, startIndex + decimalSymbols).replace(/(\.\d*?)0*$/, '$1');

      if (value.endsWith('.')) {
        value = value.slice(0, value.length - 1);
      }
    }

    return value;
  }
}

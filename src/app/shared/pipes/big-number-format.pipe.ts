import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BIG_NUMBER_FORMAT } from 'src/app/shared/constants/formats/big-number-format';

@Pipe({ name: 'bigNumberFormat' })
export class BigNumberFormatPipe implements PipeTransform {
  /**
   * Converts number to {@link BIG_NUMBER_FORMAT}.
   * @param value number to convert
   * @param dp decimal places
   * @param toFixed true if decimals in converted number must be strictly equal to {@param dp},
   * false if decimal places can be less than or equal to {@param dp}
   */
  transform(value: BigNumber | string | number, dp = -1, toFixed = false): string {
    if (typeof value === 'number') {
      value = value.toString();
    }

    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      value = new BigNumber(value.split(',').join(''));
    }

    if (dp !== -1) {
      return !toFixed
        ? value.dp(dp).toFormat(BIG_NUMBER_FORMAT)
        : value.toFormat(dp, BIG_NUMBER_FORMAT);
    }

    return value.toFormat(BIG_NUMBER_FORMAT);
  }
}

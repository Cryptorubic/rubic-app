import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';
import { formatBigNumber } from '@shared/utils/format-big-number';

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
    return formatBigNumber(value, dp, toFixed);
  }
}

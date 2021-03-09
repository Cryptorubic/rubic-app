import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';

@Pipe({ name: 'bigNumberFormat' })
export class BigNumberFormat implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(value, decimals, format, asBN, round) {
    const formatNumberParams = { groupSeparator: ',', groupSize: 3, decimalSeparator: '.' };

    const bigNumberValue = new BigNumber(value).div(decimals ** 10);

    if (bigNumberValue.isNaN()) {
      return value;
    }

    if (format) {
      return round || decimals || decimals === 0
        ? bigNumberValue.dp(round || decimals).toFormat(formatNumberParams)
        : '';
    }
    if (!asBN) {
      return bigNumberValue.toString(10);
    }
    return bigNumberValue;
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BIG_NUMBER_FORMAT } from '../constants/formats/BIG_NUMBER_FORMAT';

@Pipe({ name: 'bigNumberFormat' })
export class BigNumberFormat implements PipeTransform {
  transform(value: BigNumber | string | number, dp = -1) {
    if (typeof value === 'number') {
      value = value.toString();
    }

    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      const [integerPart, decimalPart] = value.split('.');
      return (
        new BigNumber(integerPart.split(',').join('')).toFormat(BIG_NUMBER_FORMAT) +
        (value.includes('.') ? '.' : '') +
        (decimalPart?.slice(0, dp === -1 ? decimalPart.length : dp + 1) || '')
      );
    }

    if (dp !== -1) {
      value = value.dp(dp);
    }
    return value.toFormat(BIG_NUMBER_FORMAT);
  }
}

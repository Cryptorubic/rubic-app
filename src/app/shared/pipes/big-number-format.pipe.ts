import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BIG_NUMBER_FORMAT } from '../constants/formats/BIG_NUMBER_FORMAT';

@Pipe({ name: 'bigNumberFormat' })
export class BigNumberFormat implements PipeTransform {
  transform(value: BigNumber | string) {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      const [integerPart, decimalPart] = value.split('.');
      return (
        new BigNumber(integerPart).toFormat(BIG_NUMBER_FORMAT) +
        (value.includes('.') ? '.' : '') +
        (decimalPart || '')
      );
    }

    return value.toFormat(BIG_NUMBER_FORMAT);
  }
}

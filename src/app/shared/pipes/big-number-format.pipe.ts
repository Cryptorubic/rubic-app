import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BIG_NUMBER_FORMAT } from '../constants/formats/BIG_NUMBER_FORMAT';

@Pipe({ name: 'bigNumberFormat' })
export class BigNumberFormat implements PipeTransform {
  transform(value: BigNumber | string | number) {
    if (!value) {
      return '';
    }

    if (typeof value === 'number') {
      return new BigNumber(value).toFormat(BIG_NUMBER_FORMAT);
    }

    if (typeof value === 'string') {
      const [integerPart, decimalPart] = value.split('.');
      return (
        new BigNumber(integerPart.split(',').join('')).toFormat(BIG_NUMBER_FORMAT) +
        (value.includes('.') ? '.' : '') +
        (decimalPart || '')
      );
    }

    return value.toFormat(BIG_NUMBER_FORMAT);
  }
}

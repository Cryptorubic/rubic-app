import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BIG_NUMBER_FORMAT } from '../constants/formats/BIG_NUMBER_FORMAT';

@Pipe({ name: 'bigNumberFormat' })
export class BigNumberFormat implements PipeTransform {
  transform(value: BigNumber) {
    if (value === undefined) {
      return '';
    }
    return value.toFormat(BIG_NUMBER_FORMAT);
  }
}

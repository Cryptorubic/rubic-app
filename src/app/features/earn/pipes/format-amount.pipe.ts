import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';

@Pipe({ name: 'formatAmount' })
export class FormatAmountPipe implements PipeTransform {
  transform(value: string): string {
    // console.log('v', value);
    // console.log('bn to n', new BigNumber(value).toNumber());
    return new BigNumber(value).isFinite() ? value : '0';
  }
}

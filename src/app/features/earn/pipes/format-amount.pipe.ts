import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';

@Pipe({ name: 'formatAmount' })
export class FormatAmountPipe implements PipeTransform {
  transform(value: string): string {
    return new BigNumber(value).isFinite() ? value : '0';
  }
}

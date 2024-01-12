import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';

@Pipe({
  name: 'slippageFormat'
})
export class SlippageFormatPipe implements PipeTransform {
  transform(value: number | BigNumber | string | null, precision: number = 2): string {
    const slippageValue = new BigNumber(value);
    if (slippageValue.isFinite()) {
      return String(Number(slippageValue.toFixed(precision)));
    }
    return 'Unknown';
  }
}

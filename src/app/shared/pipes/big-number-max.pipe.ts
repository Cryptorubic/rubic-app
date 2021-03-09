import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';

@Pipe({ name: 'bigNumberMax' })
export class BigNumberMax implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(values) {
    return BigNumber.max.apply(null, values);
  }
}

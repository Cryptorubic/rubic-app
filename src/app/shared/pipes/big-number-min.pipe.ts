import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';

@Pipe({ name: 'bigNumberMin' })
export class BigNumberMin implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(values) {
    return BigNumber.min.apply(null, values);
  }
}

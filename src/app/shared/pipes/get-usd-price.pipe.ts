import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';

@Pipe({
  name: 'getUsdPrice'
})
export class GetUsdPricePipe implements PipeTransform {
  /**
   *
   * @param amount Token amount
   * @param usdPrice Usd price in bignumber format per 1 token
   * @param decimals Significant digits count after comma
   * @param allowOnlyPositives If amount <= 0, then returns '0'
   */
  transform(
    amount: BigNumber,
    usdPrice: BigNumber,
    decimals: number = 2,
    allowOnlyPositives: boolean = false
  ): string {
    if (allowOnlyPositives && amount.isLessThanOrEqualTo(0)) {
      return '0';
    }

    return amount.multipliedBy(usdPrice).toFixed(decimals);
  }
}

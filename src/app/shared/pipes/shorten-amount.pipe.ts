import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';

@Pipe({
  name: 'shortenAmount'
})
export class ShortenAmountPipe implements PipeTransform {
  /**
   * @param value comma separated formatted value, e.g. 1,234,567.89
   * @param maxDigits max numerical digits in written value. Periods and commas are not counted
   * @param maxDecimals max numerical digits after dot
   */
  transform(value: string, maxDigits: number = 9, maxDecimals: number = 4): string {
    const integerPart = value.split('.')[0];
    const decimalPart = value.split('.')[1]?.slice(0, maxDecimals);

    const newValue = integerPart + (decimalPart ? `.${decimalPart}` : '');
    if (new BigNumber(newValue).eq(0)) {
      return new BigNumber(value).toExponential(maxDecimals - 2);
    }

    const currentDigits = newValue.replaceAll(',', '').replaceAll('.', '').length;
    let lengthToShorten = currentDigits - maxDigits;
    if (lengthToShorten <= 0) {
      return newValue;
    }

    if (decimalPart?.length > lengthToShorten) {
      return `${integerPart}.${decimalPart.slice(0, -lengthToShorten)}`;
    }
    if (decimalPart?.length === lengthToShorten) {
      return integerPart;
    }

    if (decimalPart) {
      lengthToShorten -= decimalPart.length;
    }

    if (lengthToShorten <= 3) {
      return `${integerPart.slice(0, -4)}k`;
    }

    if (lengthToShorten <= 6) {
      return `${integerPart.slice(0, -7)}m`;
    }

    return `${integerPart.slice(0, -10)}b`;
  }
}

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
   * @param allowNull If true, transforms '0' otherwise transforms to '...'.
   */
  transform(
    value: string,
    maxDigits: number = 9,
    maxDecimals: number = 4,
    allowNull: boolean = false
  ): string {
    const integerPart = value.split('.')[0];
    const decimalPart = value.split('.')[1]?.slice(0, maxDecimals);

    const newValue = integerPart + (decimalPart ? `.${decimalPart}` : '');

    if (new BigNumber(newValue).lte(0)) {
      return allowNull ? '0' : `${newValue.slice(0, newValue.length - 1)}...`;
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

    let slicedAmount = `${integerPart.slice(0, -10)}b`;

    if (lengthToShorten <= 3) {
      slicedAmount = `${integerPart.slice(0, -4)}k`;
    }

    if (lengthToShorten <= 6) {
      slicedAmount = `${integerPart.slice(0, -7)}m`;
    }

    if (
      slicedAmount[slicedAmount.length - 2] === ',' ||
      slicedAmount[slicedAmount.length - 2] === '.'
    ) {
      const suffix = slicedAmount[slicedAmount.length - 1];
      slicedAmount = slicedAmount.slice(0, slicedAmount.length - 2) + suffix;
    }

    return slicedAmount;
  }
}

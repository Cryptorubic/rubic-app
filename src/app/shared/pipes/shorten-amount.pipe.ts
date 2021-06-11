import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortenAmount'
})
export class ShortenAmountPipe implements PipeTransform {
  /**
   * @param value comma separated formatted value, e.g. 1,234,567.89
   * @param maxDigits max numerical digits in written value. Periods and commas are not counted
   */
  transform(value: string, maxDigits: number = 9): string {
    let currentDigits = value.replaceAll(',', '').replaceAll('.', '').length;
    let lengthToShorten = currentDigits - maxDigits;
    if (lengthToShorten <= 0) {
      return value;
    }

    const [integerPart, decimalPart] = value.split('.');
    if (decimalPart.length > lengthToShorten) {
      return `${integerPart}.${decimalPart.slice(0, -lengthToShorten)}`;
    }
    if (decimalPart.length === lengthToShorten) {
      return integerPart;
    }

    lengthToShorten -= decimalPart.length;
    currentDigits -= decimalPart.length;

    if (lengthToShorten <= 3) {
      return `${integerPart.slice(0, -4)}k`;
    }

    if (lengthToShorten <= 6) {
      return `${integerPart.slice(0, -7)}m`;
    }

    return `${integerPart.slice(0, -10)}b`;
  }
}

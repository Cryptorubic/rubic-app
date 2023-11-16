import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceImpactFormat'
})
export class PriceImpactFormatPipe implements PipeTransform {
  transform(value: number | null): string {
    const isUnknown = isNaN(value) || value === undefined || value === null;
    if (isUnknown) return 'unknown';
    else if (value < 0.01) return '<0.01%';
    else return `${value}%`;
  }
}

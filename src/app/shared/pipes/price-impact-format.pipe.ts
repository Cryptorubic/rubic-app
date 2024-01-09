import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from '@app/shared/utils/utils';

@Pipe({
  name: 'priceImpactFormat'
})
export class PriceImpactFormatPipe implements PipeTransform {
  transform(value: number | null): string {
    const isUnknown = isNaN(value) || isNil(value);
    if (isUnknown) {
      return 'unknown';
    } else if (value < 0.01) {
      return '<0.01%';
    } else {
      return `${value}%`;
    }
  }
}

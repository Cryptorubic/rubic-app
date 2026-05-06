import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mathAbs',
  standalone: false
})
export class MathAbsPipe implements PipeTransform {
  transform(value: number | string): string {
    if (typeof value === 'string') {
      const withoutMinus = value.replaceAll('-', '');
      return withoutMinus;
    }

    return Math.abs(value).toString();
  }
}

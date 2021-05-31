import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'round'
})
export class RoundPipe implements PipeTransform {
  transform(value: number, ...args: unknown[]): number {
    const exponent = 10 ** Number(args[0]);
    const mode = args[1];

    switch (mode) {
      case 'floor':
        return Math.floor(value * exponent) / exponent;
      case 'ceil':
        return Math.ceil(value * exponent) / exponent;
      case 'round':
      default:
        return Math.round(value * exponent) / exponent;
    }
  }
}

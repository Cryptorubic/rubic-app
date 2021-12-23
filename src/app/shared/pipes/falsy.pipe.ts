import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'falsy'
})
export class FalsyPipe implements PipeTransform {
  transform(value: unknown): boolean {
    return !!value;
  }
}

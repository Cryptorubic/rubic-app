import { Pipe, PipeTransform } from '@angular/core';

// @TODO TEST UNIT 1
@Pipe({
  name: 'shortAddress'
})
export class ShortAddressPipe implements PipeTransform {
  transform(address: string, beforeSymbols: number = 8, afterSymbols: number = 5): unknown {
    return address
      ? `${address.substring(0, beforeSymbols)}...${address.substring(
          address.length - afterSymbols
        )}`
      : '';
  }
}

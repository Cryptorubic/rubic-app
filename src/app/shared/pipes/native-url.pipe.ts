import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'nativeCoinUrl' })
export class NativeUrlPipe implements PipeTransform {
  // eslint-disable-next-line consistent-return
  transform(network) {
    switch (network) {
      case 1:
        return 'https://etherscan.io/stat/supply';
      case 22:
        return 'https://bscscan.com/stat/supply';
      case 24:
        return '';
      default:
        break;
    }
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { ETHERSCAN_URLS, IS_PRODUCTION } from 'src/app/core/services/web3/web3.service';

@Pipe({ name: 'etherscanUrl' })
export class EtherscanUrlPipe implements PipeTransform {
  transform(address, network, type) {
    let url;
    switch (network) {
      case 1:
        url = IS_PRODUCTION
          ? ETHERSCAN_URLS.ETHERSCAN_ADDRESS
          : ETHERSCAN_URLS.KOVAN_ETHERSCAN_ADDRESS;
        break;
      default:
        break;
      case 22:
        url = IS_PRODUCTION
          ? ETHERSCAN_URLS.BNB_ETHERSCAN_ADDRESS
          : ETHERSCAN_URLS.KOVAN_BNB_ETHERSCAN_ADDRESS;
        break;
      case 24:
        url = IS_PRODUCTION
          ? ETHERSCAN_URLS.MATIC_ETHERSCAN_ADDRESS
          : ETHERSCAN_URLS.KOVAN_MATIC_ETHERSCAN_ADDRESS;
        break;
    }
    return `${url + type}/${address}`;
  }
}

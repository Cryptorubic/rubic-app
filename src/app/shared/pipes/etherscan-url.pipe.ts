import { Pipe, PipeTransform } from '@angular/core';

const ETHERSCAN_URLS = {
  ETHERSCAN_ADDRESS: '',
  KOVAN_ETHERSCAN_ADDRESS: '',
  BNB_ETHERSCAN_ADDRESS: '',
  KOVAN_BNB_ETHERSCAN_ADDRESS: '',
  MATIC_ETHERSCAN_ADDRESS: '',
  KOVAN_MATIC_ETHERSCAN_ADDRESS: ''
}; // TODO: сделать нормальный пайп
const IS_PRODUCTION = false;

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

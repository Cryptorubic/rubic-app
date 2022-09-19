import { Pipe, PipeTransform } from '@angular/core';
import { BlockchainName, BlockchainsInfo, Web3Pure } from 'rubic-sdk';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/address-type';
import { blockchainScanner } from '@shared/constants/blockchain/blockchain-scanner';

@Pipe({ name: 'scannerLink' })
export class ScannerLinkPipe implements PipeTransform {
  constructor() {}

  transform(address: string, blockchainName: BlockchainName, type: ADDRESS_TYPE): string {
    if (!address || !blockchainName) {
      return '';
    }

    const scannerInfo = blockchainScanner[blockchainName];
    const baseUrl = scannerInfo.baseUrl;

    if (Web3Pure[BlockchainsInfo.getChainType(blockchainName)].isNativeAddress(address)) {
      return baseUrl + scannerInfo.nativeCoinUrl;
    }
    return baseUrl + scannerInfo[type] + address;
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { BlockchainName, BlockchainsInfo, ChainType } from '@cryptorubic/core';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/address-type';
import { blockchainScanner } from '@shared/constants/blockchain/blockchain-scanner';
import { Web3Pure } from '@cryptorubic/web3';

@Pipe({ name: 'scannerLink' })
export class ScannerLinkPipe implements PipeTransform {
  constructor() {}

  transform(address: string, blockchainName: BlockchainName, type: ADDRESS_TYPE): string {
    if (!address || !blockchainName) {
      return '';
    }

    const scannerInfo = blockchainScanner[blockchainName];
    const baseUrl = scannerInfo.baseUrl;

    let chainType: ChainType | undefined;
    try {
      chainType = BlockchainsInfo.getChainType(blockchainName);
    } catch {}
    if (
      (chainType && Web3Pure.isNativeAddress(blockchainName, address)) ||
      address === Web3Pure.getEmptyTokenAddress(blockchainName)
    ) {
      return baseUrl + scannerInfo.nativeCoinUrl;
    }
    return baseUrl + scannerInfo[type] + address;
  }
}

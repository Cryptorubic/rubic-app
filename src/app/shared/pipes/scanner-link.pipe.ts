import { Pipe, PipeTransform } from '@angular/core';
import { BlockchainName, BlockchainsInfo, EMPTY_ADDRESS, Web3Pure } from 'rubic-sdk';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/address-type';
import { blockchainScanner } from '@shared/constants/blockchain/blockchain-scanner';
import { CHAIN_TYPE } from 'rubic-sdk/lib/core/blockchain/models/chain-type';

@Pipe({ name: 'scannerLink' })
export class ScannerLinkPipe implements PipeTransform {
  constructor() {}

  transform(address: string, blockchainName: BlockchainName, type: ADDRESS_TYPE): string {
    if (!address || !blockchainName) {
      return '';
    }

    const scannerInfo = blockchainScanner[blockchainName];
    const baseUrl = scannerInfo.baseUrl;

    let chainType: CHAIN_TYPE | undefined;
    try {
      chainType = BlockchainsInfo.getChainType(blockchainName);
    } catch {}
    if ((chainType && Web3Pure[chainType].isNativeAddress(address)) || address === EMPTY_ADDRESS) {
      return baseUrl + scannerInfo.nativeCoinUrl;
    }
    return baseUrl + scannerInfo[type] + address;
  }
}

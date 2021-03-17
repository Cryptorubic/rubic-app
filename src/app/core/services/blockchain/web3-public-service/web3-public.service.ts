import { Injectable } from '@angular/core';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import ConnectionLink from '../types/ConnectionLink';

import { Web3Public } from './Web3Public';
import { PublicProviderService } from '../public-provider/public-provider.service';
import { BlockchainsInfo } from '../blockchain-info';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';

@Injectable({
  providedIn: 'root'
})
export class Web3PublicService {
  private readonly connectionLinks: ConnectionLink[];

  static tokenAmountToWei(token: SwapToken, amount: string | BigNumber): string {
    return new BigNumber(amount || '0').times(new BigNumber(10).pow(token.decimals)).toFixed(0);
  }

  static tokenWeiToAmount(token: SwapToken, amount: string): BigNumber {
    return new BigNumber(amount).div(new BigNumber(10).pow(token.decimals));
  }

  constructor(publicProvider: PublicProviderService) {
    this.connectionLinks = publicProvider.connectionLinks;
    const web3Connections = this.connectionLinks.reduce(
      (acc, connection) => ({
        ...acc,
        [connection.blockchainName as BLOCKCHAIN_NAME]: new Web3Public(
          new Web3(connection.rpcLink),
          BlockchainsInfo.getBlockchainByName(connection.blockchainName)
        )
      }),
      {} as any
    );
    Object.assign(this, web3Connections);
  }
}

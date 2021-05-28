import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { List } from 'immutable';
import { map } from 'rxjs/operators';
import { BlockchainsBridgeProvider } from '../blockchains-bridge-provider';
import { PanamaBridgeProviderService } from '../common/panama-bridge-provider/panama-bridge-provider.service';
import { BlockchainsTokens, BridgeToken } from '../../../models/BridgeToken';
import { BLOCKCHAIN_NAME } from '../../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeTrade } from '../../../models/BridgeTrade';
import { PanamaToken } from '../common/panama-bridge-provider/models/PanamaToken';
import { Web3PrivateService } from '../../../../../../core/services/blockchain/web3-private-service/web3-private.service';

@Injectable()
export class EthereumXdaiBridgeProviderService extends BlockchainsBridgeProvider {
  constructor(
    private commonPanamaBridgeProviderService: PanamaBridgeProviderService,
    private web3PrivateService: Web3PrivateService
  ) {
    super();
  }

  private static parseXdaiPanamaToken(token: PanamaToken): BridgeToken {
    return {
      symbol: token.symbol,
      image: '',
      rank: 0,

      blockchainToken: {
        [BLOCKCHAIN_NAME.ETHEREUM]: {
          address: token.ethContractAddress,
          name: token.name,
          symbol: token.ethSymbol,
          decimals: token.ethContractDecimal,

          minAmount: 0.005,
          maxAmount: 9999999
        },
        [BLOCKCHAIN_NAME.XDAI]: {
          address: '0x44fA8E6f47987339850636F88629646662444217',
          name: token.name,
          symbol: token.ethSymbol,
          decimals: token.ethContractDecimal,

          minAmount: token.minAmount,
          maxAmount: token.maxAmount
        }
      } as BlockchainsTokens
    };
  }

  getTokensList(): Observable<List<BridgeToken>> {
    return this.commonPanamaBridgeProviderService.getTokensList().pipe(
      map(tokens => {
        return tokens
          .filter(token => token.symbol === 'DAI')
          .map(EthereumXdaiBridgeProviderService.parseXdaiPanamaToken);
      })
    );
  }

  getFee(): Observable<number> {
    return of(0);
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<string> {
    const { token } = bridgeTrade;
    const tokenAddress = token.blockchainToken[bridgeTrade.fromBlockchain].address;
    const depositAddress = '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016';
    const { decimals } = token.blockchainToken[bridgeTrade.fromBlockchain];
    const amountInWei = bridgeTrade.amount.multipliedBy(10 ** decimals);

    this.web3PrivateService
      .transferTokens(tokenAddress, depositAddress, amountInWei.toFixed())
      .then(receipt => console.log(receipt));

    return of('welding');
  }
}

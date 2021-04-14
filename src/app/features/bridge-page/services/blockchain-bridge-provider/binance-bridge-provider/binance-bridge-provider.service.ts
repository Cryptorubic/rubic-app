import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { List } from 'immutable';
import { BlockchainBridgeProvider } from '../blockchain-bridge-provider';
import { PanamaBridgeProviderService } from './panama-bridge-provider/panama-bridge-provider.service';
import { RubicBridgeProviderService } from './rubic-bridge-provider/rubic-bridge-provider.service';
import { BridgeToken } from '../../../models/BridgeToken';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import SwapToken from '../../../../../shared/models/tokens/SwapToken';
import { BridgeTrade } from '../../../models/BridgeTrade';

@Injectable()
export class BinanceBridgeProviderService extends BlockchainBridgeProvider {
  constructor(
    private panamaBridgeProvider: PanamaBridgeProviderService,
    private rubicBridgeProvider: RubicBridgeProviderService
  ) {
    super();
  }

  public getTokensList(swapTokens: List<SwapToken>): Observable<List<BridgeToken>> {
    const panamaTokensObservable = this.panamaBridgeProvider.getTokensList();
    const rubicTokenObservable = this.rubicBridgeProvider.getTokensList();
    return forkJoin([rubicTokenObservable, panamaTokensObservable]).pipe(
      map(([rubicToken, panamaTokens]) => {
        return this.getTokensWithImages(rubicToken.concat(panamaTokens), swapTokens);
      })
    );
  }

  private getTokensWithImages(
    tokens: List<BridgeToken>,
    swapTokens: List<SwapToken>
  ): List<BridgeToken> {
    return tokens.map(token => {
      const tokenInfo = swapTokens
        .filter(item => item.blockchain === BLOCKCHAIN_NAME.ETHEREUM)
        .find(
          item =>
            token.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].address.toLowerCase() ===
            item.address.toLowerCase()
        );
      token.image = tokenInfo?.image || '/assets/images/icons/coins/empty.svg';
      return token;
    });
  }

  public getFee(token: BridgeToken, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    if (token.symbol === 'RBC') {
      return this.rubicBridgeProvider.getFee(token, toBlockchain);
    }
    return this.panamaBridgeProvider.getFee(token, toBlockchain);
  }

  public createTrade(
    bridgeTrade: BridgeTrade,
    updateTransactionsList: () => Promise<void>
  ): Observable<string> {
    if (bridgeTrade.token.symbol === 'RBC') {
      return this.rubicBridgeProvider.createTrade(bridgeTrade, updateTransactionsList);
    }
    return this.panamaBridgeProvider.createTrade(bridgeTrade, updateTransactionsList);
  }
}

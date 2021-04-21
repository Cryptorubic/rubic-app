import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { List } from 'immutable';
import { HttpService } from '../../http/http.service';
import SwapToken from '../../../../shared/models/tokens/SwapToken';
import { coingeckoTestTokens } from '../../../../../test/tokens/coingecko-tokens';
import { UseTestingModeService } from '../../use-testing-mode/use-testing-mode.service';
import { FROM_BACKEND_BLOCKCHAINS } from '../../../../shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { BackendToken } from './models/BackendToken';

@Injectable({
  providedIn: 'root'
})
export class TokensService {
  private getTokensUrl = 'tokens/';

  public tokens: BehaviorSubject<List<SwapToken>> = new BehaviorSubject(List([]));

  constructor(private httpService: HttpService, useTestingModule: UseTestingModeService) {
    this.getTokensList();

    useTestingModule.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.tokens.next(List(coingeckoTestTokens));
      }
    });
  }

  private static parseToken(token: BackendToken): SwapToken {
    return {
      ...token,
      blockchain: FROM_BACKEND_BLOCKCHAINS[token.blockchain_network],
      price: token.usd_price
    };
  }

  private getTokensList(): void {
    this.httpService.get(this.getTokensUrl).subscribe(
      (tokens: BackendToken[]) =>
        this.tokens.next(List(tokens.map(TokensService.parseToken.bind(this)))),
      err => console.error('Error retrieving tokens', err)
    );
  }
}

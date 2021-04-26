import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { List } from 'immutable';
import { HttpService } from '../../http/http.service';
import SwapToken from '../../../../shared/models/tokens/SwapToken';
import { coingeckoTestTokens } from '../../../../../test/tokens/coingecko-tokens';
import { UseTestingModeService } from '../../use-testing-mode/use-testing-mode.service';
import { FROM_BACKEND_BLOCKCHAINS } from '../../../../shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { BackendToken } from './models/BackendToken';
import { TokensListResponse } from './models/TokensListResponse';

@Injectable({
  providedIn: 'root'
})
export class TokensService {
  private static readonly maxRankValue = 999999999;

  private getTokensUrl = 'coingecko_tokens/';

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
      name: token.token_title,
      symbol: token.token_short_title,
      blockchain: FROM_BACKEND_BLOCKCHAINS[token.platform],
      image: token.image_link,
      rank: token.coingecko_rank || TokensService.maxRankValue,
      price: token.usd_price
    };
  }

  private getTokensList(): void {
    this.httpService.get(this.getTokensUrl).subscribe(
      (response: TokensListResponse) =>
        this.tokens.next(List(response.tokens.map(TokensService.parseToken.bind(this)))),
      err => console.error('Error retrieving tokens', err)
    );
  }
}

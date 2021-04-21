import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { List } from 'immutable';
import { HttpService } from '../../http/http.service';
import SwapToken from '../../../../shared/models/tokens/SwapToken';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { coingeckoTestTokens } from '../../../../../test/tokens/coingecko-tokens';
import { UseTestingModeService } from '../../use-testing-mode/use-testing-mode.service';
import { BackendToken } from './models/BackendToken';
import { TokensListResponse } from './models/TokensListResponse';

@Injectable({
  providedIn: 'root'
})
export class TokensService {
  private getTokensUrl = 'coingecko_tokens/';

  private readonly maxRankValue = 999999999;

  private backendBlockchains = {
    ethereum: BLOCKCHAIN_NAME.ETHEREUM,
    'binance-smart-chain': BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
  };

  public tokens: BehaviorSubject<List<SwapToken>> = new BehaviorSubject(List([]));

  constructor(private httpService: HttpService, useTestingModule: UseTestingModeService) {
    this.getTokensList();

    useTestingModule.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.tokens.next(List(coingeckoTestTokens));
      }
    });
  }

  private getTokensList(): void {
    this.httpService.get(this.getTokensUrl).subscribe(
      (response: TokensListResponse) =>
        this.tokens.next(List(response.tokens.map(this.parseToken.bind(this)))),
      err => console.log('Error retrieving tokens', err)
    );
  }

  private parseToken(token: BackendToken): SwapToken {
    return {
      ...token,
      name: token.token_title,
      symbol: token.token_short_title,
      blockchain: this.backendBlockchains[token.platform],
      image: token.image_link,
      rank: token.coingecko_rank || this.maxRankValue,
      price: token.usd_price
    };
  }
}

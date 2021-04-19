import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { List } from 'immutable';
import { HttpService } from '../../http/http.service';
import SwapToken from '../../../../shared/models/tokens/SwapToken';
import { coingeckoTestTokens } from '../../../../../test/tokens/coingecko-tokens';
import { UseTestingModeService } from '../../use-testing-mode/use-testing-mode.service';
import { FROM_BACKEND_BLOCKCHAINS } from '../../../../shared/constants/blockchain/BACKEND_BLOCKCHAINS';

interface BackendToken {
  name: string;
  symbol: string;
  blockchain_network: string;
  address: string;
  decimals: number;
  image: string;
  rank: number;
  coingecko_id: number;
  coingecko_rank: number;
  usd_price: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokensService {
  private getTokensUrl = 'tokens/';

  private readonly maxRankValue = 999999999;

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
      (tokens: BackendToken[]) => this.tokens.next(List(tokens.map(this.parseToken.bind(this)))),
      err => console.error('Error retrieving tokens', err)
    );
  }

  private parseToken(token: BackendToken): SwapToken {
    return {
      ...token,
      blockchain: FROM_BACKEND_BLOCKCHAINS[token.blockchain_network],
      image: token.image,
      rank: token.coingecko_rank || this.maxRankValue,
      price: token.usd_price
    };
  }
}

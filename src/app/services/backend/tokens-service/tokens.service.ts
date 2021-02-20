import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { List } from 'immutable';
import { HttpService } from '../../http/http.service';
import { PLATFORM, SwapToken } from './types';

interface TokensListResponse {
  total: number;
  tokens: BackendToken[];
}

interface BackendToken {
  token_title: string;
  token_short_title: string;
  platform: string;
  address: string;
  decimals: number;
  image_link: string;
  coingecko_rank: number;
  usd_price: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokensService {
  private getTokensUrl = 'coingecko_tokens/';
  private _tokens: BehaviorSubject<List<SwapToken>> = new BehaviorSubject(List([]));

  public readonly tokens: Observable<List<SwapToken>> = this._tokens.asObservable();

  constructor(private httpService: HttpService) {
    this.getTokensList();
  }

  private getTokensList(): void {
    this.httpService.get(this.getTokensUrl).subscribe(
      (response: TokensListResponse) =>
        this._tokens.next(List(response.tokens.map(TokensService.parseToken))),
      err => console.log('Error retrieving tokens ' + err)
    );
  }

  private static parseToken(token: BackendToken): SwapToken {
    return {
      ...token,
      name: token.token_title,
      symbol: token.token_short_title,
      platform: PLATFORM[token.platform],
      image: token.image_link,
      rank: token.coingecko_rank,
      price: token.usd_price
    };
  }
}

import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { List } from 'immutable';
import {
  BackendBlockchain,
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS
} from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { Token } from 'src/app/shared/models/tokens/Token';
import { map, switchMap } from 'rxjs/operators';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { HttpService } from '../../http/http.service';
import { BackendToken } from './models/BackendToken';

interface TokensResponse {
  readonly count: number;
  readonly next: string;
  readonly previous: string;
  readonly results: BackendToken[];
}

interface TokensRequestOptions {
  readonly address?: string;
  readonly network?: BackendBlockchain;
  readonly page: number;
  readonly pageSize?: number;
  readonly symbol?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TokensApiService {
  private readonly getTokensUrl = 'tokens/';

  private readonly getIframeTokensUrl = 'tokens/iframe/';

  constructor(
    private readonly httpService: HttpService,
    private readonly iframeService: IframeService
  ) {}

  private static prepareTokens(tokens: BackendToken[]): List<Token> {
    return List(
      tokens
        .map((token: BackendToken) => ({
          ...token,
          blockchain: FROM_BACKEND_BLOCKCHAINS[token.blockchain_network],
          price: token.usd_price,
          usedInIframe: token.used_in_iframe
        }))
        .filter(token => token.address && token.blockchain)
    );
  }

  public getTokensList(params: Object): Observable<List<Token>> {
    return this.iframeService.isIframe$.pipe(
      switchMap(isIframe => {
        const url = isIframe ? this.getIframeTokensUrl : this.getTokensUrl;
        return this.httpService
          .get(url, params)
          .pipe(
            map((backendTokens: BackendToken[]) => TokensApiService.prepareTokens(backendTokens))
          );
      })
    );
  }

  /**
   * @description Fetch another networks basic tokens from backend.
   * @returns Observable<List<Token>> Tokens.
   */
  private fetchBasicTokens(): Observable<List<Token>> {
    const params = { page: 1, page_size: 150 };
    const requests$ = Object.values(TO_BACKEND_BLOCKCHAINS).map(network =>
      this.httpService.get(this.getTokensUrl, { ...params, network })
    ) as Observable<TokensResponse>[];
    return forkJoin(requests$).pipe(
      map(results => {
        return TokensApiService.prepareTokens(results.flatMap(el => el.results));
      })
    );
  }

  /**
   * Fetch specific network tokens from backend.
   * @param requestOptions Network which tokens is searched.
   */
  public fetchSpecificBackendTokens(
    requestOptions: TokensRequestOptions
  ): Observable<{ total: number; result: List<Token> }> {
    const options = {
      network: requestOptions.network,
      page: requestOptions.page,
      page_size: requestOptions.pageSize
    };
    return this.httpService.get(this.getTokensUrl, options).pipe(
      map((tokensResponse: TokensResponse) => {
        return {
          total: tokensResponse.count,
          result: TokensApiService.prepareTokens(tokensResponse.results)
        };
      })
    );
  }
}

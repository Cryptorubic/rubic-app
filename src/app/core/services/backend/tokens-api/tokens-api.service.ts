import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { List } from 'immutable';
import {
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS
} from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { Token } from 'src/app/shared/models/tokens/Token';
import { map, switchMap } from 'rxjs/operators';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import {
  BackendToken,
  TokensBackendResponse,
  TokensRequestOptions,
  TokensResponse
} from 'src/app/core/services/backend/tokens-api/models/tokens';
import { HttpService } from '../../http/http.service';

/**
 * Perform backend requests and transforms to get valid tokens.
 */
@Injectable({
  providedIn: 'root'
})
export class TokensApiService {
  private readonly getTokensUrl: string = 'tokens/';

  constructor(
    private readonly httpService: HttpService,
    private readonly iframeService: IframeService
  ) {}

  /**
   * @description Convert backend tokens to Token.
   * @param tokens Tokens from backend response.
   * @return List<Token> Useful tokens list.
   */
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

  /**
   * @description Fetch specific tokens from backend.
   * @param params Request params.
   * @return Observable<List<Token>> Tokens list.
   */
  public getTokensList(params: { [p: string]: unknown }): Observable<List<Token>> {
    return this.iframeService.isIframe$.pipe(
      switchMap(isIframe => {
        return isIframe ? this.fetchIframeTokens(params) : this.fetchBasicTokens(null);
      })
    );
  }

  /**
   * @description Fetch iframe tokens from backend.
   * @param params Request params.
   * @return Observable<List<Token>> Tokens list.
   */
  private fetchIframeTokens(params: { [p: string]: unknown }): Observable<List<Token>> {
    const tokensPath = 'tokens/iframe/';
    return this.httpService
      .get(tokensPath, params)
      .pipe(map((backendTokens: BackendToken[]) => TokensApiService.prepareTokens(backendTokens)));
  }

  /**
   * @description Fetch another networks basic tokens from backend.
   * @param params Request params.
   * @return Observable<List<Token>> Tokens.
   */
  private fetchBasicTokens(params: TokensRequestOptions): Observable<List<Token>> {
    const options = { page: 1, page_size: 150, ...params };
    const requests$ = Object.values(TO_BACKEND_BLOCKCHAINS).map(network =>
      this.httpService.get(this.getTokensUrl, { ...options, network })
    ) as Observable<TokensResponse>[];
    return forkJoin(requests$).pipe(
      map(results => {
        return TokensApiService.prepareTokens(results.flatMap(el => el.results));
      })
    );
  }

  /**
   * @description Fetch specific network tokens from backend.
   * @param requestOptions Network which tokens is searched.
   * @return Observable<TokensBackendResponse> Tokens response from backend with count.
   */
  public fetchSpecificBackendTokens(
    requestOptions: TokensRequestOptions
  ): Observable<TokensBackendResponse> {
    const options = {
      network: TO_BACKEND_BLOCKCHAINS[requestOptions.network],
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

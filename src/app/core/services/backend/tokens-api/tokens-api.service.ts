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
  DEFAULT_PAGE_SIZE,
  TokensBackendResponse,
  TokensRequestOptions,
  TokensResponse
} from 'src/app/core/services/backend/tokens-api/models/tokens';
import { PAGINATED_BLOCKCHAIN_NAME } from 'src/app/shared/models/tokens/paginated-tokens';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { HttpService } from '../../http/http.service';

/**
 * Perform backend requests and transforms to get valid tokens.
 */
@Injectable({
  providedIn: 'root'
})
export class TokensApiService {
  /**
   * API path to backend token list.
   */
  private readonly getTokensUrl: string = 'tokens/';

  /**
   * API path to iframe backend token list.
   */
  private readonly iframeTokensUrl: string = 'tokens/iframe/';

  constructor(
    private readonly httpService: HttpService,
    private readonly iframeService: IframeService
  ) {}

  /**
   * @description Convert {@link BackendToken} to {@link Token} List.
   * @param tokens Tokens from backend response.
   * @return List<Token> Useful tokens list.
   */
  private static prepareTokens(tokens: BackendToken[]): List<Token> {
    return List(
      tokens
        .map((token: BackendToken) => ({
          ...token,
          blockchain:
            FROM_BACKEND_BLOCKCHAINS[
              token.blockchain_network as keyof typeof FROM_BACKEND_BLOCKCHAINS
            ],
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
    return this.httpService
      .get(this.iframeTokensUrl, params)
      .pipe(map((backendTokens: BackendToken[]) => TokensApiService.prepareTokens(backendTokens)));
  }

  /**
   * @description Fetch another networks basic tokens from backend.
   * @param params Request params.
   * @return Observable<List<Token>> Tokens.
   */
  private fetchBasicTokens(params: TokensRequestOptions): Observable<List<Token>> {
    const options = { page: 1, page_size: DEFAULT_PAGE_SIZE, ...params };
    const blockchainsToFetch = [
      BLOCKCHAIN_NAME.ETHEREUM,
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      BLOCKCHAIN_NAME.POLYGON,
      BLOCKCHAIN_NAME.HARMONY
    ].map(el => TO_BACKEND_BLOCKCHAINS[el as PAGINATED_BLOCKCHAIN_NAME]);
    const requests$ = blockchainsToFetch.map(network =>
      this.httpService.get(this.getTokensUrl, { ...options, network })
    ) as Observable<TokensResponse>[];
    return forkJoin(requests$).pipe(
      map(results => {
        return TokensApiService.prepareTokens(results.flatMap(el => el.results));
      })
    );
  }

  /**
   * @description Fetch specific tokens by symbol or address.
   * @param requestOptions Network which tokens is searched.
   * @return Observable<TokensBackendResponse> Tokens response from backend with count.
   */
  public fetchQueryToken(requestOptions: TokensRequestOptions): Observable<List<Token>> {
    const options = {
      page: 1,
      network: requestOptions.network,
      ...(requestOptions.symbol && { symbol: requestOptions.symbol }),
      ...(requestOptions.address && { address: requestOptions.address })
    };
    return this.httpService
      .get(this.getTokensUrl, options)
      .pipe(
        map((tokensResponse: BackendToken[]) =>
          tokensResponse.length ? TokensApiService.prepareTokens(tokensResponse) : List()
        )
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
      network: TO_BACKEND_BLOCKCHAINS[requestOptions.network as PAGINATED_BLOCKCHAIN_NAME],
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

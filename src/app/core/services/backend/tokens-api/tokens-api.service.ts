import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { List } from 'immutable';
import {
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS
} from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { Token } from 'src/app/shared/models/tokens/Token';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import {
  BackendToken,
  DEFAULT_PAGE_SIZE,
  TokensListResponse,
  TokensBackendResponse,
  TokensRequestQueryOptions,
  TokensRequestNetworkOptions
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
   * Converts {@link BackendToken} to {@link Token} List.
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
   * Fetch specific tokens from backend.
   * @param params Request params.
   * @return Observable<List<Token>> Tokens list.
   */
  public getTokensList(params: { [p: string]: unknown }): Observable<List<Token>> {
    return this.iframeService.isIframe$.pipe(
      debounceTime(50),
      switchMap(isIframe => {
        return isIframe ? this.fetchIframeTokens(params) : this.fetchBasicTokens();
      })
    );
  }

  /**
   * Fetches iframe tokens from backend.
   * @param params Request params.
   * @return Observable<List<Token>> Tokens list.
   */
  private fetchIframeTokens(params: { [p: string]: unknown }): Observable<List<Token>> {
    return this.httpService
      .get(this.iframeTokensUrl, params)
      .pipe(map((backendTokens: BackendToken[]) => TokensApiService.prepareTokens(backendTokens)));
  }

  /**
   * Fetches basic tokens from backend.
   */
  private fetchBasicTokens(): Observable<List<Token>> {
    const options = { page: 1, page_size: DEFAULT_PAGE_SIZE };
    const blockchainsToFetch = [
      BLOCKCHAIN_NAME.ETHEREUM,
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      BLOCKCHAIN_NAME.POLYGON,
      BLOCKCHAIN_NAME.HARMONY,
      BLOCKCHAIN_NAME.AVALANCHE,
      BLOCKCHAIN_NAME.FANTOM
    ].map(el => TO_BACKEND_BLOCKCHAINS[el as PAGINATED_BLOCKCHAIN_NAME]);

    const requests$ = blockchainsToFetch.map(network =>
      this.httpService.get<TokensBackendResponse>(this.getTokensUrl, { ...options, network })
    );
    return forkJoin(requests$).pipe(
      map(results => {
        return TokensApiService.prepareTokens(results.flatMap(el => el.results));
      })
    );
  }

  /**
   * Fetches specific tokens by symbol or address.
   * @param requestOptions Request options to search tokens by.
   * @return Observable<TokensListResponse> Tokens response from backend with count.
   */
  public fetchQueryTokens(requestOptions: TokensRequestQueryOptions): Observable<List<Token>> {
    const options = {
      network: TO_BACKEND_BLOCKCHAINS[requestOptions.network],
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
   * Fetches specific network tokens from backend.
   * @param requestOptions Request options to get tokens by.
   * @return Observable<TokensListResponse> Tokens response from backend with count.
   */
  public fetchSpecificBackendTokens(
    requestOptions: TokensRequestNetworkOptions
  ): Observable<TokensListResponse> {
    const options = {
      network: TO_BACKEND_BLOCKCHAINS[requestOptions.network],
      page: requestOptions.page,
      page_size: DEFAULT_PAGE_SIZE
    };
    return this.httpService.get<TokensBackendResponse>(this.getTokensUrl, options).pipe(
      map(tokensResponse => {
        return {
          total: tokensResponse.count,
          result: TokensApiService.prepareTokens(tokensResponse.results),
          next: tokensResponse.next
        };
      })
    );
  }
}

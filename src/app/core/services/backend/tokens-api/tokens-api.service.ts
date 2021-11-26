import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { List } from 'immutable';
import {
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS,
  ToBackendBlockchain
} from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { Token } from 'src/app/shared/models/tokens/Token';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import {
  BackendToken,
  DEFAULT_PAGE_SIZE,
  TokensListResponse,
  TokensBackendResponse,
  TokensRequestQueryOptions,
  TokensRequestNetworkOptions,
  ENDPOINTS,
  FavoriteTokenRequestParams
} from 'src/app/core/services/backend/tokens-api/models/tokens';
import { PAGINATED_BLOCKCHAIN_NAME } from 'src/app/shared/models/tokens/paginated-tokens';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenAmount } from '@shared/models/tokens/TokenAmount';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { TokenListContainer, TokenListProvider } from '@solana/spl-token-registry';
import { HttpService } from '../../http/http.service';

/**
 * Perform backend requests and transforms to get valid tokens.
 */
@Injectable({
  providedIn: 'root'
})
export class TokensApiService {
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
   * Fetches favorite tokens from backend.
   * @return Observable<BackendToken[]> Favorite Tokens.
   */
  public fetchFavoriteTokens(): Observable<List<Token>> {
    return this.httpService.get<BackendToken[]>(ENDPOINTS.FAVORITE_TOKENS).pipe(
      map(tokens => TokensApiService.prepareTokens(tokens)),
      catchError(() => of(List([])))
    );
  }

  /**
   * Adds favorite token on backend.
   * @param token Token to add.
   */
  public addFavoriteToken(token: TokenAmount): Observable<unknown | null> {
    const body: FavoriteTokenRequestParams = {
      blockchain_network: TO_BACKEND_BLOCKCHAINS[token.blockchain as ToBackendBlockchain],
      address: token.address
    };
    return this.httpService.post(ENDPOINTS.FAVORITE_TOKENS, body);
  }

  /**
   * Deletes favorite token on backend.
   * @param token Token to delete.
   */
  public deleteFavoriteToken(token: TokenAmount): Observable<unknown | null> {
    const body: FavoriteTokenRequestParams = {
      blockchain_network: TO_BACKEND_BLOCKCHAINS[token.blockchain as ToBackendBlockchain],
      address: token.address
    };
    return this.httpService.delete(ENDPOINTS.FAVORITE_TOKENS, { body });
  }

  /**
   * Fetches iframe tokens from backend.
   * @param params Request params.
   * @return Observable<List<Token>> Tokens list.
   */
  private fetchIframeTokens(params: { [p: string]: unknown }): Observable<List<Token>> {
    return this.httpService
      .get(ENDPOINTS.IFRAME_TOKENS, params)
      .pipe(map((backendTokens: BackendToken[]) => TokensApiService.prepareTokens(backendTokens)));
  }

  /**
   * Fetches static tokens for bridges.
   * @return BackendToken[] Static tokens for bridge.
   */
  private fetchStaticTokens(): BackendToken[] {
    return [
      {
        address: NATIVE_TOKEN_ADDRESS,
        name: 'Dai Stablecoin',
        symbol: 'xDAI',
        decimals: 18,
        image:
          'https://api.rubic.exchange/assets/xdai/0x0000000000000000000000000000000000000000/logo.png',
        rank: 1,
        blockchain_network: 'xdai',
        coingecko_id: '0',
        usd_price: 1,
        used_in_iframe: false
      }
    ];
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
      BLOCKCHAIN_NAME.MOONRIVER,
      BLOCKCHAIN_NAME.FANTOM
    ].map(el => TO_BACKEND_BLOCKCHAINS[el as PAGINATED_BLOCKCHAIN_NAME]);

    const requests$ = blockchainsToFetch.map(network =>
      this.httpService.get<TokensBackendResponse>(ENDPOINTS.TOKKENS, { ...options, network })
    );
    // @TODO Solana.
    const solanaTokens$ = from(new TokenListProvider().resolve()).pipe(
      map((tokenList: TokenListContainer) => ({
        results: tokenList
          .filterByChainId(101)
          .getList()
          .map(token => {
            const coolNames = ['ray', 'usdt', 'usdc', 'eth', 'sol', 'wsol'];
            const rank = coolNames.includes(token.symbol.toLowerCase()) ? 1 : 0;
            return {
              address: token.address,
              name: token.name,
              symbol: token.symbol,
              blockchain_network: 'solana',
              decimals: token.decimals,
              rank,
              image: token.logoURI,
              coingecko_id: null,
              usd_price: 0,
              used_in_iframe: false
            };
          }) as BackendToken[]
      }))
    );
    return forkJoin([...requests$, solanaTokens$]).pipe(
      map(results => {
        const backendTokens = results.flatMap(el => el.results || []);
        const staticTokens = this.fetchStaticTokens();
        return TokensApiService.prepareTokens([...backendTokens, ...staticTokens]);
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
      ...(requestOptions.symbol && { symbol: requestOptions.symbol.toLowerCase() }),
      ...(requestOptions.address && { address: requestOptions.address.toLowerCase() })
    };
    return this.httpService
      .get(ENDPOINTS.TOKKENS, options)
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
    return this.httpService.get<TokensBackendResponse>(ENDPOINTS.TOKKENS, options).pipe(
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

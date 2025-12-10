import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { List } from 'immutable';

import { RatedToken, Token } from '@shared/models/tokens/token';
import { catchError, map, tap } from 'rxjs/operators';
import {
  BackendToken,
  ClearswapApiToken,
  ClearswapTokensBackendResponse,
  ENDPOINTS,
  FavoriteTokenRequestParams,
  RatedBackendToken,
  TokensBackendResponse,
  TokenSecurityBackendResponse,
  TokensRequestNetworkOptions,
  TokensRequestQueryOptions
} from 'src/app/core/services/backend/tokens-api/models/tokens';
import { TokenSecurity } from '@shared/models/tokens/token-security';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { HttpService } from '../../http/http.service';
import { AuthService } from '../../auth/auth.service';
import { defaultTokens } from './models/default-tokens';
import { blockchainsToFetch, blockchainsWithOnePage } from './constants/fetch-blockchains';
import { ENVIRONMENT } from 'src/environments/environment';

import { compareAddresses } from '@app/shared/utils/utils';
import { TokensNetworkStateService } from '../../tokens/tokens-network-state.service';
import {
  BackendBlockchain,
  BLOCKCHAIN_NAME,
  BlockchainName,
  Cache as Memo,
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS
} from '@cryptorubic/core';

/**
 * Perform backend requests and transforms to get valid tokens.
 */
@Injectable({
  providedIn: 'root'
})
export class TokensApiService {
  public needRefetchTokens: boolean;

  private readonly tokensApiUrl = `${ENVIRONMENT.apiTokenUrl}/`;

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
    private readonly tokensNetworkStateService: TokensNetworkStateService
  ) {}

  /**
   * Converts {@link BackendToken} to {@link Token} List.
   * @param tokens Tokens from backend response.
   * @return List<Token> Useful tokens list.
   */
  public static prepareTokens<T extends BackendToken = BackendToken, K extends Token = Token>(
    tokens: T[]
  ): List<K> {
    return List(
      tokens
        .map((token: T) => {
          // @ts-ignore
          return {
            blockchain: FROM_BACKEND_BLOCKCHAINS[token.blockchainNetwork as BackendBlockchain],
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            image: token.image,
            rank: token.rank,
            price: token.usdPrice,
            tokenSecurity: token.token_security,
            type: token.type,
            ...('source_rank' in token && { sourceRank: token.source_rank }),
            ...('usdPriceChangePercentage24h' in token && {
              priceChange24h: token.usdPriceChangePercentage24h
            }),
            ...('usdPriceChangePercentage7d' in token && {
              priceChange7d: token.usdPriceChangePercentage7d
            })
          } as K;
        })
        .filter(token => token.address && token.blockchain)
    );
  }

  public static convertClearswapResponseToAppTokens(
    clearswapResp: ClearswapTokensBackendResponse,
    onlyPrivate: boolean = false
  ): List<Token> {
    const apiTokens = Object.values(clearswapResp).flatMap(t => t.tokens);
    let results = List(
      apiTokens
        .map((apiToken: ClearswapApiToken) => {
          return {
            ...apiToken,
            blockchain: apiToken.network,
            price: apiToken.usdPrice
          };
        })
        .filter(token => token.address && token.blockchain)
    );

    if (onlyPrivate) {
      results = results.filter(t => t.private);
    }
    return results;
  }

  /**
   * Fetches favorite tokens from backend.
   * @return Observable<BackendToken[]> Favorite Tokens.
   */
  public fetchFavoriteTokens(): Promise<List<Token>> {
    return firstValueFrom(
      this.httpService
        .get<BackendToken[]>(
          ENDPOINTS.FAVORITE_TOKENS,
          { user: this.authService.userAddress },
          this.tokensApiUrl
        )
        .pipe(
          map(tokens => TokensApiService.prepareTokens(tokens)),
          catchError(() => of(List([])))
        )
    );
  }

  /**
   * Adds favorite token on backend.
   * @param token Tokens to add.
   */
  public addFavoriteToken(token: TokenAmount): Observable<unknown | null> {
    const body: FavoriteTokenRequestParams = {
      network: TO_BACKEND_BLOCKCHAINS[token.blockchain],
      address: token.address,
      user: this.authService.userAddress
    };
    return this.httpService.post(ENDPOINTS.FAVORITE_TOKENS, body, this.tokensApiUrl);
  }

  /**
   * Deletes favorite token on backend.
   * @param token Tokens to delete.
   */
  public deleteFavoriteToken(token: TokenAmount): Observable<unknown | null> {
    const body: FavoriteTokenRequestParams = {
      network: TO_BACKEND_BLOCKCHAINS[token.blockchain],
      address: token.address,
      user: this.authService.userAddress
    };
    return this.httpService.delete(ENDPOINTS.FAVORITE_TOKENS, { body }, this.tokensApiUrl);
  }

  /**
   * Fetches basic tokens from backend.
   * Sets maxPage for each assetType of selector.
   */
  public fetchBasicTokensOnPageInit(): Observable<List<Token>> {
    // const options = { page: 1, pageSize: DEFAULT_PAGE_SIZE };
    // const blockchains = blockchainsToFetch.map(bF => TO_BACKEND_BLOCKCHAINS[bF]);

    // const requests$ = blockchains.map((network: BackendBlockchain) =>
    //   this.httpService
    //     .get<TokensBackendResponse>(ENDPOINTS.TOKENS, { ...options, network }, this.tokensApiUrl)
    //     .pipe(
    //       tap(networkTokens => {
    //         if (networkTokens?.results) {
    //           const blockchain = FROM_BACKEND_BLOCKCHAINS[network];
    //           const oldState = this.tokensNetworkStateService.tokensNetworkState;
    //           this.tokensNetworkStateService.updateTokensNetworkState({
    //             ...oldState,
    //             [blockchain]: {
    //               page: options.page,
    //               maxPage: Math.ceil(networkTokens.count / options.pageSize)
    //             }
    //           });
    //         }
    //       }),
    //       catchError(() => {
    //         return of(null);
    //       })
    //     )
    // );
    // @FIX add loading of gainers/losers

    return this.fetchClearswapTokens().pipe(
      map(clearswapResponse => {
        if (!clearswapResponse) {
          this.needRefetchTokens = true;
          return List(
            blockchainsToFetch
              .map(blockchain => defaultTokens[blockchain])
              .filter(tokens => tokens?.length > 0)
              .flat()
          );
        }

        this.needRefetchTokens = false;

        return TokensApiService.convertClearswapResponseToAppTokens(clearswapResponse);
      })
    );
  }

  private fetchClearswapTokens(): Observable<ClearswapTokensBackendResponse> {
    return this.httpService
      .get<ClearswapTokensBackendResponse>(ENDPOINTS.TOKENS, {}, this.tokensApiUrl)
      .pipe(
        tap(clearswapTokens => {
          if (Object.keys(clearswapTokens).length) {
            blockchainsWithOnePage.forEach(blockchain => {
              const oldState = this.tokensNetworkStateService.tokensNetworkState;
              this.tokensNetworkStateService.updateTokensNetworkState({
                ...oldState,
                [blockchain]: {
                  page: 1,
                  maxPage: 1
                }
              });
            });
          }
        }),
        catchError(_ => {
          return of(null);
        })
      );
  }

  /**
   * Fetches specific tokens by symbol/address from specific chain or from all chains
   */
  @Memo({ maxAge: 60_000 })
  public fetchQueryTokens(
    query: string,
    blockchain: BlockchainName | null
  ): Observable<List<Token>> {
    return this.httpService.get<ClearswapTokensBackendResponse>(ENDPOINTS.TOKENS).pipe(
      catchError(() => {
        return of(
          Object.fromEntries(
            Object.values(BLOCKCHAIN_NAME).map(chain => [
              chain,
              { count: 0, tokens: [] as ClearswapApiToken[] }
            ])
          ) as ClearswapTokensBackendResponse
        );
      }),
      map(clearswapResponse => {
        // manually finds tokens cause clearswap returns list for every network only
        if (blockchain) {
          return TokensApiService.convertClearswapResponseToAppTokens(clearswapResponse).filter(
            t =>
              t.blockchain === blockchain &&
              (compareAddresses(t.address, query) ||
                t.symbol.toLowerCase().includes(query.toLowerCase()) ||
                t.name.toLowerCase().includes(query.toLowerCase()))
          );
        }
        return TokensApiService.convertClearswapResponseToAppTokens(clearswapResponse);
      })
    );
  }

  /**
   * Fetches token security info from backend.
   * @param requestOptions Request options to get token security info by.
   * @returns Observable<TokenSecurity> Token security info from backend.
   */
  public fetchTokenSecurity(requestOptions: TokensRequestQueryOptions): Observable<TokenSecurity> {
    const options = {
      ...(requestOptions.network && { network: TO_BACKEND_BLOCKCHAINS[requestOptions.network] }),
      ...(requestOptions.address && { address: requestOptions.address })
    };

    return this.httpService
      .get<TokenSecurityBackendResponse>(ENDPOINTS.TOKENS_SECURITY, options, this.tokensApiUrl)
      .pipe(
        map(({ token_security }) => ({
          ...token_security
        })),
        catchError(() => of(null))
      );
  }

  /**
   * Fetches specific network tokens from backend.
   * @param requestOptions Request options to get tokens by.
   */
  public fetchSpecificBackendTokens(
    _requestOptions: TokensRequestNetworkOptions
  ): Observable<List<Token>> {
    // const options = {
    //   network: TO_BACKEND_BLOCKCHAINS[requestOptions.network],
    //   page: requestOptions.page,
    //   pageSize: DEFAULT_PAGE_SIZE
    // };
    return this.httpService
      .get<ClearswapTokensBackendResponse>(ENDPOINTS.TOKENS)
      .pipe(
        map(clearswapResp => TokensApiService.convertClearswapResponseToAppTokens(clearswapResp))
      );
  }

  public fetchTokensListForAllChains(): Observable<List<Token>> {
    return this.fetchClearswapTokens().pipe(
      map(clearswapResponse =>
        TokensApiService.convertClearswapResponseToAppTokens(clearswapResponse)
      )
    );
    // return forkJoin([
    //   this.httpService
    //     .get<TokensBackendResponse>('v2/tokens/top', {}, '', { retry: 2, timeoutMs: 15_000 })
    //     .pipe(map(backendTokens => TokensApiService.prepareTokens(backendTokens.results))),
    //   this.httpService
    //     .get<BackendTokenForAllChains[]>('v2/tokens/allchains', {}, '', {
    //       retry: 2,
    //       timeoutMs: 15_000
    //     })
    //     .pipe(map(backendTokens => TokensApiService.prepareTokens(backendTokens)))
    // ]).pipe(
    //   map(([topTokens, allChainsTokens]) => {
    //     // filters unique tokens from v2/tokens/allchains and api/v2/tokens/?pageSize=5000
    //     return topTokens.concat(allChainsTokens).reduce((acc, token) => {
    //       // not show 2nd metis native token in selector
    //       if (
    //         token.blockchain === BLOCKCHAIN_NAME.METIS &&
    //         compareAddresses(token.address, '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000')
    //       ) {
    //         return acc;
    //       }

    //       const repeated = acc.find(t => compareTokens(t, token));
    //       return repeated ? acc : acc.push(token);
    //     }, List() as List<Token>);
    //   }),
    //   catchError(() => of(List() as List<Token>))
    // );
  }

  public fetchTrendTokens(): Observable<List<RatedToken>> {
    return this.httpService
      .get<RatedBackendToken[]>('v2/tokens/trending', {}, '', { retry: 2, timeoutMs: 15_000 })
      .pipe(
        map(backendTokens =>
          TokensApiService.prepareTokens<RatedBackendToken, RatedToken>(backendTokens)
        ),
        catchError(() => of(List() as List<RatedToken>))
      );
  }

  public fetchGainersTokens(): Observable<List<RatedToken>> {
    return this.httpService
      .get<TokensBackendResponse>('v2/tokens/gainers', {}, '', { retry: 2, timeoutMs: 15_000 })
      .pipe(
        map(resp =>
          TokensApiService.prepareTokens<RatedBackendToken, RatedToken>(
            resp.results as RatedBackendToken[]
          )
        ),
        catchError(() => of(List() as List<RatedToken>))
      );
  }

  public fetchLosersTokens(): Observable<List<RatedToken>> {
    return this.httpService
      .get<TokensBackendResponse>('v2/tokens/losers', {}, '', { retry: 2, timeoutMs: 15_000 })
      .pipe(
        map(resp =>
          TokensApiService.prepareTokens<RatedBackendToken, RatedToken>(
            resp.results as RatedBackendToken[]
          )
        ),
        catchError(() => of(List() as List<RatedToken>))
      );
  }
}

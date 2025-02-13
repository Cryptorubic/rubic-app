import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, forkJoin, Observable, of } from 'rxjs';
import { List } from 'immutable';

import { Token } from '@shared/models/tokens/token';
import { catchError, map, tap } from 'rxjs/operators';
import {
  BackendToken,
  BackendTokenForAllChains,
  DEFAULT_PAGE_SIZE,
  ENDPOINTS,
  FavoriteTokenRequestParams,
  TokensBackendResponse,
  TokenSecurityBackendResponse,
  TokensListResponse,
  TokensRequestNetworkOptions,
  TokensRequestQueryOptions
} from 'src/app/core/services/backend/tokens-api/models/tokens';
import { TokenSecurity } from '@shared/models/tokens/token-security';
import { TokensNetworkState } from 'src/app/shared/models/tokens/paginated-tokens';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { HttpService } from '../../http/http.service';
import { AuthService } from '../../auth/auth.service';
import { defaultTokens } from './models/default-tokens';
import { blockchainsToFetch, blockchainsWithOnePage } from './constants/fetch-blockchains';
import {
  BackendBlockchain,
  BLOCKCHAIN_NAME,
  BlockchainName,
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS
} from 'rubic-sdk';
import { ENVIRONMENT } from 'src/environments/environment';

import { compareAddresses, compareTokens } from '@app/shared/utils/utils';

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
    private readonly authService: AuthService
  ) {}

  /**
   * Converts {@link BackendToken} to {@link Token} List.
   * @param tokens Tokens from backend response.
   * @return List<Token> Useful tokens list.
   */
  public static prepareTokens(tokens: BackendToken[]): List<Token> {
    return List(
      tokens
        .map(({ token_security, ...token }: BackendToken) => {
          return {
            blockchain: FROM_BACKEND_BLOCKCHAINS[token.blockchainNetwork as BackendBlockchain],
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            image: token.image,
            rank: token.rank,
            price: token.usdPrice,
            tokenSecurity: token_security,
            type: token.type
          };
        })
        .filter(token => token.address && token.blockchain)
    );
  }

  /**
   * Fetch specific tokens from backend.
   * @param params Request params.
   * @param tokensNetworkState$ Tokens pagination state.
   * @return Observable<List<Token>> Tokens list.
   */
  public getTokensList(
    tokensNetworkState$: BehaviorSubject<TokensNetworkState>
  ): Observable<List<Token>> {
    return this.fetchBasicTokens(tokensNetworkState$);
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
   */
  private fetchBasicTokens(
    tokensNetworkState$: BehaviorSubject<TokensNetworkState>
  ): Observable<List<Token>> {
    const options = { page: 1, pageSize: DEFAULT_PAGE_SIZE };
    const blockchains = blockchainsToFetch.map(bF => TO_BACKEND_BLOCKCHAINS[bF]);

    const requests$ = blockchains.map((network: BackendBlockchain) =>
      this.httpService
        .get<TokensBackendResponse>(ENDPOINTS.TOKENS, { ...options, network }, this.tokensApiUrl)
        .pipe(
          tap(networkTokens => {
            if (networkTokens?.results) {
              const blockchain = FROM_BACKEND_BLOCKCHAINS[network];
              tokensNetworkState$.next({
                ...tokensNetworkState$.value,
                [blockchain]: {
                  ...tokensNetworkState$.value[blockchain],
                  page: options.page,
                  maxPage: Math.ceil(networkTokens.count / options.pageSize)
                }
              });
            }
          }),
          catchError(() => {
            return of(null);
          })
        )
    );
    requests$.push(this.fetchTokensFromOnePageBlockchains(tokensNetworkState$));

    return forkJoin(requests$).pipe(
      map(results => {
        if (results.every(el => el === null)) {
          this.needRefetchTokens = true;
          return List(
            blockchainsToFetch
              .map(blockchain => defaultTokens[blockchain])
              .filter(tokens => tokens?.length > 0)
              .flat()
          );
        }

        this.needRefetchTokens = false;
        const backendTokens = results.flatMap(el => el?.results || []);
        const fakeTokens = this.getFakeTokens();

        const allTokens = [...backendTokens, ...fakeTokens];

        return TokensApiService.prepareTokens(allTokens);
      })
    );
  }

  private fetchTokensFromOnePageBlockchains(
    tokensNetworkState$: BehaviorSubject<TokensNetworkState>
  ): Observable<TokensBackendResponse> {
    const blockchains = [...blockchainsWithOnePage];
    const backendBlockchains = blockchains.map(chain => TO_BACKEND_BLOCKCHAINS[chain]);
    const queryString = backendBlockchains.join(',');

    return this.httpService
      .get<TokensBackendResponse>(ENDPOINTS.TOKENS, { networks: queryString }, this.tokensApiUrl)
      .pipe(
        tap(networkTokens => {
          if (networkTokens?.results) {
            blockchainsWithOnePage.forEach(blockchain => {
              tokensNetworkState$.next({
                ...tokensNetworkState$.value,
                [blockchain]: {
                  page: 1,
                  maxPage: 1
                }
              });
            });
          }
        }),
        catchError(() => {
          return of(null);
        })
      );
  }

  /**
   * Fetches specific tokens by symbol/address from specific chain or from all chains
   */
  public fetchQueryTokens(
    query: string,
    blockchain: BlockchainName | null
  ): Observable<List<Token>> {
    const options = {
      query,
      ...(blockchain !== null && { network: TO_BACKEND_BLOCKCHAINS[blockchain] })
    };

    return this.httpService.get<TokensBackendResponse>(ENDPOINTS.TOKENS, options).pipe(
      catchError(() => {
        return of({
          count: 0,
          next: '0',
          previous: '0',
          results: [] as BackendToken[]
        });
      }),
      map(tokensResponse =>
        tokensResponse.results.length
          ? TokensApiService.prepareTokens(tokensResponse.results)
          : List()
      )
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
   * @return Observable<TokensListResponse> Tokens response from backend with count.
   */
  public fetchSpecificBackendTokens(
    requestOptions: TokensRequestNetworkOptions
  ): Observable<TokensListResponse> {
    const options = {
      network: TO_BACKEND_BLOCKCHAINS[requestOptions.network],
      page: requestOptions.page,
      pageSize: DEFAULT_PAGE_SIZE
    };
    return this.httpService
      .get<TokensBackendResponse>(ENDPOINTS.TOKENS, options, this.tokensApiUrl)
      .pipe(
        map(tokensResponse => {
          return {
            total: tokensResponse.count,
            result: TokensApiService.prepareTokens(tokensResponse.results),
            next: tokensResponse.next
          };
        })
      );
  }

  public fetchTokensListForAllChains(): Observable<List<Token>> {
    return forkJoin([
      this.httpService
        .get<TokensBackendResponse>('v2/tokens/top')
        .pipe(map(backendTokens => TokensApiService.prepareTokens(backendTokens.results))),
      this.httpService
        .get<BackendTokenForAllChains[]>('v2/tokens/allchains')
        .pipe(map(backendTokens => TokensApiService.prepareTokens(backendTokens)))
    ]).pipe(
      map(([topTokens, allChainsTokens]) => {
        // filters unique tokens from v2/tokens/allchains and api/v2/tokens/?pageSize=5000
        return topTokens.concat(allChainsTokens).reduce((acc, token) => {
          // not show 2nd metis native token in selector
          if (
            token.blockchain === BLOCKCHAIN_NAME.METIS &&
            compareAddresses(token.address, '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000')
          ) {
            return acc;
          }
          const repeated = acc.find(t => compareTokens(t, token));
          return repeated ? acc : acc.push(token);
        }, List() as List<Token>);
      })
    );
  }

  public getFakeTokens(): BackendToken[] {
    return [];
  }
}

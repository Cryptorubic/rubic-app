import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from, Observable, of } from 'rxjs';
import { List } from 'immutable';
import {
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS,
  BackendBlockchain
} from '@shared/constants/blockchain/backend-blockchains';
import { Token } from '@shared/models/tokens/token';
import { catchError, debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import {
  BackendToken,
  DEFAULT_PAGE_SIZE,
  ENDPOINTS,
  FavoriteTokenRequestParams,
  TokensBackendResponse,
  TokensListResponse,
  TokensRequestNetworkOptions,
  TokensRequestQueryOptions
} from 'src/app/core/services/backend/tokens-api/models/tokens';
import { TokensNetworkState } from 'src/app/shared/models/tokens/paginated-tokens';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { HttpService } from '../../http/http.service';
import { AuthService } from '../../auth/auth.service';
import { BLOCKCHAIN_NAME, BlockchainName, Injector } from 'rubic-sdk';
import { EMPTY_ADDRESS } from '@shared/constants/blockchain/empty-address';
import { defaultTokens } from './models/default-tokens';
import { ENVIRONMENT } from 'src/environments/environment';

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
    private readonly iframeService: IframeService,
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
        .map((token: BackendToken) => ({
          ...token,
          blockchain: FROM_BACKEND_BLOCKCHAINS[token.blockchainNetwork],
          price: token.usdPrice
        }))
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
    params: { [p: string]: unknown },
    tokensNetworkState$: BehaviorSubject<TokensNetworkState>
  ): Observable<List<Token>> {
    return this.iframeService.isIframe$.pipe(
      debounceTime(50),
      switchMap(isIframe => {
        return isIframe
          ? this.fetchIframeTokens(params)
          : this.fetchBasicTokens(tokensNetworkState$);
      })
    );
  }

  /**
   * Fetches favorite tokens from backend.
   * @return Observable<BackendToken[]> Favorite Tokens.
   */
  public fetchFavoriteTokens(): Observable<List<Token>> {
    return this.httpService
      .get<BackendToken[]>(
        ENDPOINTS.FAVORITE_TOKENS,
        { user: this.authService.userAddress },
        this.tokensApiUrl
      )
      .pipe(
        map(tokens => TokensApiService.prepareTokens(tokens)),
        catchError(() => of(List([])))
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
   * Fetches iframe tokens from backend.
   * @param params Request params.
   * @return Observable<List<Token>> Tokens list.
   */
  private fetchIframeTokens(params: { [p: string]: unknown }): Observable<List<Token>> {
    const backendNetworks: BlockchainName[] = [
      BLOCKCHAIN_NAME.ETHEREUM,
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      BLOCKCHAIN_NAME.POLYGON,
      BLOCKCHAIN_NAME.AVALANCHE,
      BLOCKCHAIN_NAME.FANTOM,
      BLOCKCHAIN_NAME.ARBITRUM,
      BLOCKCHAIN_NAME.AURORA,
      BLOCKCHAIN_NAME.MOONRIVER,
      BLOCKCHAIN_NAME.TELOS,
      BLOCKCHAIN_NAME.HARMONY,
      BLOCKCHAIN_NAME.TRON,
      BLOCKCHAIN_NAME.CELO,
      BLOCKCHAIN_NAME.OKE_X_CHAIN,
      BLOCKCHAIN_NAME.OPTIMISM,
      BLOCKCHAIN_NAME.MOONBEAM,
      BLOCKCHAIN_NAME.CRONOS,
      BLOCKCHAIN_NAME.GNOSIS,
      BLOCKCHAIN_NAME.BOBA,
      BLOCKCHAIN_NAME.FUSE,
      BLOCKCHAIN_NAME.ETHEREUM_POW,
      BLOCKCHAIN_NAME.KAVA,
      BLOCKCHAIN_NAME.BITGERT,
      BLOCKCHAIN_NAME.OASIS,
      BLOCKCHAIN_NAME.METIS,
      BLOCKCHAIN_NAME.DFK,
      BLOCKCHAIN_NAME.KLAYTN,
      BLOCKCHAIN_NAME.VELAS,
      BLOCKCHAIN_NAME.SYSCOIN
    ];
    const backendTokens$ = this.httpService
      .get<BackendToken[]>(ENDPOINTS.IFRAME_TOKENS, params, this.tokensApiUrl)
      .pipe(
        map(backendTokens =>
          backendTokens.filter(token => {
            const network = FROM_BACKEND_BLOCKCHAINS?.[token.blockchainNetwork];
            return backendNetworks.includes(network);
          })
        ),
        map(backendTokens => TokensApiService.prepareTokens(backendTokens))
      );

    const staticTokens$ = this.fetchStaticTokens();

    return forkJoin([backendTokens$, staticTokens$]).pipe(
      map(([backendTokens, staticTokens]) => backendTokens.concat(staticTokens))
    );
  }

  /**
   * Fetches basic tokens from backend.
   */
  private fetchBasicTokens(
    tokensNetworkState$: BehaviorSubject<TokensNetworkState>
  ): Observable<List<Token>> {
    const options = { page: 1, pageSize: DEFAULT_PAGE_SIZE };
    const blockchainsToFetch = Object.values(TO_BACKEND_BLOCKCHAINS);

    const requests$ = blockchainsToFetch.map((network: BackendBlockchain) =>
      this.httpService
        .get<TokensBackendResponse>(ENDPOINTS.TOKENS, { ...options, network }, this.tokensApiUrl)
        .pipe(
          tap(networkTokens => {
            const blockchain = FROM_BACKEND_BLOCKCHAINS[network];
            if (networkTokens?.results) {
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
    const backendTokens$ = forkJoin(requests$).pipe(
      map(results => {
        if (results.every(el => el === null)) {
          this.needRefetchTokens = true;
          return List(
            blockchainsToFetch
              .map(blockchain => defaultTokens[FROM_BACKEND_BLOCKCHAINS[blockchain]])
              .filter(tokens => tokens.length > 0)
              .flat()
          );
        }

        this.needRefetchTokens = false;
        const backendTokens = results.flatMap(el => el?.results || []);
        return TokensApiService.prepareTokens(backendTokens);
      })
    );

    const staticTokens$ = this.fetchStaticTokens();

    return forkJoin([backendTokens$, staticTokens$]).pipe(
      map(([backendTokens, staticTokens]) => {
        return backendTokens.concat(staticTokens);
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
      .get<TokensBackendResponse>(ENDPOINTS.TOKENS, options, this.tokensApiUrl)
      .pipe(
        map(tokensResponse =>
          tokensResponse.results.length
            ? TokensApiService.prepareTokens(tokensResponse.results)
            : List()
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

  private fetchStaticTokens(): Observable<Token[]> {
    return from(Injector.coingeckoApi.getNativeCoinPrice(BLOCKCHAIN_NAME.BITCOIN)).pipe(
      switchMap(price =>
        of([
          {
            image: '/assets/images/icons/coins/bitcoin.svg',
            rank: 1,
            price: price.toNumber(),
            usedInIframe: true,
            hasDirectPair: null,

            blockchain: BLOCKCHAIN_NAME.BITCOIN,
            address: EMPTY_ADDRESS,
            name: 'Bitcoin',
            symbol: 'BTC',
            decimals: 8
          }
        ])
      )
    );
  }
}

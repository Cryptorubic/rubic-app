import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { List } from 'immutable';
import {
  FROM_BACKEND_BLOCKCHAINS,
  FromBackendBlockchain,
  TO_BACKEND_BLOCKCHAINS,
  ToBackendBlockchain
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
import { BLOCKCHAIN_NAME, BlockchainsInfo, compareAddresses } from 'rubic-sdk';
import { LifiTokens } from '@core/services/backend/tokens-api/models/lifi-token';

/**
 * Perform backend requests and transforms to get valid tokens.
 */
@Injectable({
  providedIn: 'root'
})
export class TokensApiService {
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
          price: token.usdPrice,
          usedInIframe: token.usedInIframe,
          hasDirectPair: token.hasDirectPair
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
      .get<BackendToken[]>(ENDPOINTS.FAVORITE_TOKENS, { user: this.authService.userAddress })
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
      blockchain_network: TO_BACKEND_BLOCKCHAINS[token.blockchain as ToBackendBlockchain],
      address: token.address,
      user: this.authService.userAddress
    };
    return this.httpService.post(ENDPOINTS.FAVORITE_TOKENS, body);
  }

  /**
   * Deletes favorite token on backend.
   * @param token Tokens to delete.
   */
  public deleteFavoriteToken(token: TokenAmount): Observable<unknown | null> {
    const body: FavoriteTokenRequestParams = {
      blockchain_network: TO_BACKEND_BLOCKCHAINS[token.blockchain as ToBackendBlockchain],
      address: token.address,
      user: this.authService.userAddress
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
   * Fetches basic tokens from backend.
   */
  private fetchBasicTokens(
    tokensNetworkState$: BehaviorSubject<TokensNetworkState>
  ): Observable<List<Token>> {
    const options = { page: 1, pageSize: DEFAULT_PAGE_SIZE };
    const blockchainsToFetch = [
      BLOCKCHAIN_NAME.ETHEREUM,
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      BLOCKCHAIN_NAME.POLYGON,
      BLOCKCHAIN_NAME.HARMONY,
      BLOCKCHAIN_NAME.AVALANCHE,
      BLOCKCHAIN_NAME.MOONRIVER,
      BLOCKCHAIN_NAME.FANTOM,
      BLOCKCHAIN_NAME.ARBITRUM,
      BLOCKCHAIN_NAME.AURORA,
      BLOCKCHAIN_NAME.SOLANA,
      BLOCKCHAIN_NAME.NEAR,
      BLOCKCHAIN_NAME.TELOS,
      BLOCKCHAIN_NAME.BOBA
    ].map(blockchain => TO_BACKEND_BLOCKCHAINS[blockchain]);

    const requests$ = blockchainsToFetch.map((network: FromBackendBlockchain) =>
      this.httpService.get<TokensBackendResponse>(ENDPOINTS.TOKENS, { ...options, network }).pipe(
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
        })
      )
    );
    const backendTokens$ = forkJoin(requests$).pipe(
      map(results => {
        const backendTokens = results.flatMap(el => el.results || []);
        return TokensApiService.prepareTokens(backendTokens);
      })
    );

    const lifiChains = [
      BLOCKCHAIN_NAME.OPTIMISM,
      BLOCKCHAIN_NAME.CRONOS,
      BLOCKCHAIN_NAME.OKE_X_CHAIN,
      BLOCKCHAIN_NAME.GNOSIS,
      BLOCKCHAIN_NAME.FUSE,
      BLOCKCHAIN_NAME.MOONBEAM,
      BLOCKCHAIN_NAME.CELO
    ].map(blockchain => BlockchainsInfo.getBlockchainByName(blockchain).id);

    const lifiTokens$: Observable<Token[]> = this.httpService
      .get<LifiTokens>('v1/tokens', { chains: lifiChains.join(',') }, 'https://li.quest/')
      .pipe(
        map(wrappedTokens =>
          lifiChains
            .map(chainId =>
              wrappedTokens.tokens[chainId]
                ?.filter(token => {
                  const blockchain = BlockchainsInfo.getBlockchainById(chainId).name;
                  return !(
                    blockchain === BLOCKCHAIN_NAME.OPTIMISM &&
                    compareAddresses(token.address, '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000')
                  );
                })
                .map(token => {
                  const blockchain = BlockchainsInfo.getBlockchainById(chainId).name;
                  const name =
                    blockchain !== BLOCKCHAIN_NAME.GNOSIS || !token.name.includes(' on xDai')
                      ? token.name
                      : token.name.slice(0, token.name.length - 8);

                  return {
                    ...token,
                    blockchain,
                    name,
                    image: token.logoURI,
                    rank: 0,
                    price: parseFloat(token.priceUSD),
                    usedInIframe: false,
                    hasDirectPair: null
                  };
                })
            )
            .flat()
        )
      );

    return forkJoin([backendTokens$, lifiTokens$]).pipe(
      map(([backendTokens, lifiTokens]) => backendTokens.concat(lifiTokens))
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
      .get<TokensBackendResponse>(ENDPOINTS.TOKENS, options)
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
    return this.httpService.get<TokensBackendResponse>(ENDPOINTS.TOKENS, options).pipe(
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

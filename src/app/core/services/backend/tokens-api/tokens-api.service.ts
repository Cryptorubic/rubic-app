import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, forkJoin, Observable, of } from 'rxjs';
import { List } from 'immutable';
import {
  BackendBlockchain,
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS
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
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import { defaultTokens } from './models/default-tokens';
import { ENVIRONMENT } from 'src/environments/environment';
import { blockchainsToFetch, blockchainsWithOnePage } from './constants/fetch-blockchains';

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
        .map(({ token_security, ...token }: BackendToken) => {
          return {
            blockchain: FROM_BACKEND_BLOCKCHAINS[token.blockchainNetwork],
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            image: token.image,
            rank: token.rank,
            price: token.usdPrice,
            tokenSecurity: token_security
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
      BLOCKCHAIN_NAME.BOBA_AVALANCHE,
      BLOCKCHAIN_NAME.BOBA_BSC,
      BLOCKCHAIN_NAME.FUSE,
      BLOCKCHAIN_NAME.ETHEREUM_POW,
      BLOCKCHAIN_NAME.KAVA,
      BLOCKCHAIN_NAME.BITGERT,
      BLOCKCHAIN_NAME.OASIS,
      BLOCKCHAIN_NAME.METIS,
      BLOCKCHAIN_NAME.DFK,
      BLOCKCHAIN_NAME.KLAYTN,
      BLOCKCHAIN_NAME.VELAS,
      BLOCKCHAIN_NAME.SYSCOIN,
      BLOCKCHAIN_NAME.SOLANA,
      BLOCKCHAIN_NAME.NEAR,
      BLOCKCHAIN_NAME.ASTAR_EVM,
      BLOCKCHAIN_NAME.ASTAR,
      BLOCKCHAIN_NAME.BITCOIN,
      BLOCKCHAIN_NAME.EOS,
      BLOCKCHAIN_NAME.FILECOIN,
      BLOCKCHAIN_NAME.XDC,
      BLOCKCHAIN_NAME.ICP,
      BLOCKCHAIN_NAME.CARDANO,
      BLOCKCHAIN_NAME.ALGORAND,
      BLOCKCHAIN_NAME.COSMOS,
      BLOCKCHAIN_NAME.DASH,
      BLOCKCHAIN_NAME.DOGECOIN,
      BLOCKCHAIN_NAME.POLKADOT,
      BLOCKCHAIN_NAME.FLOW,
      BLOCKCHAIN_NAME.HEDERA,
      BLOCKCHAIN_NAME.IOTA,
      BLOCKCHAIN_NAME.KUSAMA,
      BLOCKCHAIN_NAME.LITECOIN,
      BLOCKCHAIN_NAME.MINA_PROTOCOL,
      BLOCKCHAIN_NAME.NEO,
      BLOCKCHAIN_NAME.OSMOSIS,
      BLOCKCHAIN_NAME.SIA,
      BLOCKCHAIN_NAME.SECRET,
      BLOCKCHAIN_NAME.TON,
      BLOCKCHAIN_NAME.WAVES,
      BLOCKCHAIN_NAME.WAX,
      BLOCKCHAIN_NAME.STELLAR,
      BLOCKCHAIN_NAME.MONERO,
      BLOCKCHAIN_NAME.RIPPLE,
      BLOCKCHAIN_NAME.TEZOS,
      BLOCKCHAIN_NAME.ZILLIQA,
      BLOCKCHAIN_NAME.KAVA_COSMOS,
      BLOCKCHAIN_NAME.ZK_SYNC,
      BLOCKCHAIN_NAME.ONTOLOGY,
      BLOCKCHAIN_NAME.APTOS,
      BLOCKCHAIN_NAME.PULSECHAIN
    ];
    return this.httpService
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
  }

  private fetchTokensFromOnePageBlockchains(
    tokensNetworkState$: BehaviorSubject<TokensNetworkState>
  ): Observable<TokensBackendResponse> {
    const onePageBlockchains = blockchainsWithOnePage
      .map(b => TO_BACKEND_BLOCKCHAINS[b])
      .reduce((acc, blockchain) => {
        if (acc.length) {
          return acc + ',' + blockchain;
        }
        return blockchain;
      }, '');
    return this.httpService
      .get<TokensBackendResponse>(
        ENDPOINTS.TOKENS,
        { networks: onePageBlockchains },
        this.tokensApiUrl
      )
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
   * Fetches token security info from backend.
   * @param requestOptions Request options to get token security info by.
   * @returns Observable<TokenSecurity> Token security info from backend.
   */
  public fetchTokenSecurity(requestOptions: TokensRequestQueryOptions): Observable<TokenSecurity> {
    const options = {
      network: TO_BACKEND_BLOCKCHAINS[requestOptions.network],
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
}

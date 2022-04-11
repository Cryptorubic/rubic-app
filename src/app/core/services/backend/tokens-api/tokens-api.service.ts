import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { List } from 'immutable';
import {
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS,
  ToBackendBlockchain
} from '@shared/constants/blockchain/backend-blockchains';
import { Token } from '@shared/models/tokens/token';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
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
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { HttpService } from '../../http/http.service';
import { AuthService } from '../../auth/auth.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';

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
  private fetchBasicTokens(): Observable<List<Token>> {
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
      BLOCKCHAIN_NAME.TELOS
    ].map(blockchain => TO_BACKEND_BLOCKCHAINS[blockchain]);

    const requests$ = blockchainsToFetch.map(network =>
      this.httpService.get<TokensBackendResponse>(ENDPOINTS.TOKENS, { ...options, network })
    );
    return forkJoin(requests$).pipe(
      map(results => {
        const backendTokens = results.flatMap(el => el.results || []);
        const staticTokens: BackendToken[] = [
          {
            address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
            name: 'Wrapped TLOS',
            symbol: 'WTLOS',
            blockchainNetwork: 'telos',
            decimals: 18,
            rank: 1,
            image: 'string',
            coingeckoId: 'string',
            usdPrice: 0.8,
            usedInIframe: false,
            hasDirectPair: true
          },
          {
            address: NATIVE_TOKEN_ADDRESS,
            name: 'TLOS',
            symbol: 'TLOS',
            blockchainNetwork: 'telos',
            decimals: 18,
            rank: 1,
            image: 'string',
            coingeckoId: 'string',
            usdPrice: 0.8,
            usedInIframe: false,
            hasDirectPair: true
          },
          {
            address: '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b',
            name: 'USDC',
            symbol: 'USDC',
            blockchainNetwork: 'telos',
            decimals: 6,
            rank: 1,
            image: 'string',
            coingeckoId: 'string',
            usdPrice: 0.8,
            usedInIframe: false,
            hasDirectPair: true
          }
          // { address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E', symbol: 'WTLOS' }
          // { address: '0xf390830DF829cf22c53c8840554B98eafC5dCBc2', symbol: 'BTC' },
          // { address: '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f', symbol: 'ETH' },
          // { address: '0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73', symbol: 'USDT' },
          // { address: '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b', symbol: 'USDC' },
          // { address: '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b', symbol: 'BNB' },
          // { address: '0x332730a4F6E03D9C55829435f10360E13cfA41Ff', symbol: 'MATIC' },
          // { address: '0x7C598c96D02398d89FbCb9d41Eab3DF0C16F227D', symbol: 'AVAX' },
          // { address: '0xC1Be9a4D5D45BeeACAE296a7BD5fADBfc14602C4', symbol: 'FTM' },
          // { address: '0x922D641a426DcFFaeF11680e5358F34d97d112E1', symbol: 'SUSHI' }
        ];
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
      .get(ENDPOINTS.TOKENS, options)
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

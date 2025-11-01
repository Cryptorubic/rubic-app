import { Injectable } from '@angular/core';
import { BlockchainName } from '@cryptorubic/sdk';
import {
  BackendToken,
  ENDPOINTS,
  FavoriteTokenRequestParams,
  NewTokensBackendResponse,
  RatedBackendToken,
  TokensBackendResponse
} from '@core/services/backend/tokens-api/models/tokens';
import { RatedToken, Token } from '@shared/models/tokens/token';
import {
  BackendBlockchain,
  BLOCKCHAIN_NAME,
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS,
  TEST_EVM_BLOCKCHAIN_NAME
} from '@cryptorubic/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from '@core/services/http/http.service';
import { ENVIRONMENT } from '../../../../environments/environment';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { AuthService } from '@core/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NewTokensApiService {
  private readonly tokensApiUrl = `${ENVIRONMENT.apiTokenUrl}/`;

  private readonly pageSize = 50;

  private readonly topTierChains: BlockchainName[] = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.SOLANA,
    BLOCKCHAIN_NAME.BERACHAIN,
    BLOCKCHAIN_NAME.ZK_SYNC,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.BITCOIN
  ];

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService
  ) {}

  public fetchQueryTokens(query: string, blockchain: BlockchainName | null): Observable<Token[]> {
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
          ? NewTokensApiService.prepareTokens(tokensResponse.results)
          : []
      )
    );
  }

  public static prepareTokens<T extends BackendToken = BackendToken, K extends Token = Token>(
    tokens: T[]
  ): K[] {
    return tokens
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
      .filter(token => token.address && token.blockchain);
  }

  public getNewPage(
    page: number,
    chain: BlockchainName
  ): Observable<{ list: Token[]; total: number; haveMore: boolean }> {
    const options = { page: page, pageSize: this.pageSize };

    return this.httpService
      .get<TokensBackendResponse>(
        ENDPOINTS.TOKENS,
        { ...options, network: chain },
        this.tokensApiUrl
      )
      .pipe(
        map(backendResponse => {
          return {
            list: NewTokensApiService.prepareTokens(backendResponse.results),
            total: backendResponse.count,
            haveMore: Boolean(backendResponse.next)
          };
        })
      );
  }

  public getTopTokens(): Observable<
    Partial<Record<BlockchainName, { list: Token[]; total: number; haveMore: boolean }>>
  > {
    // const tier1Blockchains = this.topTierChains.map(chain => TO_BACKEND_BLOCKCHAINS[chain]);

    return this.httpService
      .get<Partial<Record<BlockchainName, NewTokensBackendResponse>>>(
        ENDPOINTS.NEW_TOKENS,
        { networks: this.topTierChains.join(',') },
        this.tokensApiUrl
      )
      .pipe(
        map(response => {
          return this.topTierChains.reduce((acc, blockchain) => {
            // const blockchain = FROM_BACKEND_BLOCKCHAINS[chain];
            const chainResponse = response[blockchain];
            if (!chainResponse) return acc;

            return {
              ...acc,
              [blockchain]: {
                list: NewTokensApiService.prepareTokens(chainResponse.tokens),
                total: chainResponse.count,
                haveMore: Boolean(chainResponse.next_page)
              }
            };
          }, {});
        })
      );
  }

  public getRestTokens(): Observable<
    Partial<Record<BlockchainName, { list: Token[]; total: number; haveMore: boolean }>>
  > {
    const excludedChains = [...Object.values(TEST_EVM_BLOCKCHAIN_NAME), ...this.topTierChains];
    const tier2blockchains = Object.values(BLOCKCHAIN_NAME).filter(
      chain => !excludedChains.includes(chain)
    );

    return this.httpService
      .get<Partial<Record<BlockchainName, NewTokensBackendResponse>>>(
        ENDPOINTS.NEW_TOKENS,
        { networks: tier2blockchains.join(',') },
        this.tokensApiUrl
      )
      .pipe(
        map(response => {
          return tier2blockchains.reduce((acc, blockchain) => {
            const chainResponse = response[blockchain];
            if (!chainResponse) return acc;

            return {
              ...acc,
              [blockchain]: {
                list: NewTokensApiService.prepareTokens(chainResponse.tokens),
                total: chainResponse.count,
                haveMore: Boolean(chainResponse.next_page)
              }
            };
          }, {});
        })
      );
  }

  public fetchFavoriteTokens(): Observable<Token[]> {
    return this.httpService
      .get<BackendToken[]>(
        ENDPOINTS.FAVORITE_TOKENS,
        { user: this.authService.userAddress },
        this.tokensApiUrl
      )
      .pipe(
        map(resp => NewTokensApiService.prepareTokens<BackendToken, Token>(resp)),
        catchError(() => of([]))
      );
  }

  public addFavoriteToken(token: BalanceToken): Observable<unknown | null> {
    const body: FavoriteTokenRequestParams = {
      network: TO_BACKEND_BLOCKCHAINS[token.blockchain],
      address: token.address,
      user: this.authService.userAddress
    };
    return this.httpService.post(ENDPOINTS.FAVORITE_TOKENS, body, this.tokensApiUrl);
  }

  public deleteFavoriteToken(token: BalanceToken): Observable<unknown | null> {
    const body: FavoriteTokenRequestParams = {
      network: TO_BACKEND_BLOCKCHAINS[token.blockchain],
      address: token.address,
      user: this.authService.userAddress
    };
    return this.httpService.delete(ENDPOINTS.FAVORITE_TOKENS, { body }, this.tokensApiUrl);
  }

  public fetchTrendTokens(): Observable<RatedToken[]> {
    return this.httpService
      .get<RatedBackendToken[]>('v2/tokens/trending', {}, '', { retry: 2, timeoutMs: 15_000 })
      .pipe(
        map(backendTokens =>
          NewTokensApiService.prepareTokens<RatedBackendToken, RatedToken>(backendTokens)
        ),
        catchError(() => of([]))
      );
  }

  public fetchGainersTokens(): Observable<RatedToken[]> {
    return this.httpService
      .get<TokensBackendResponse>('v2/tokens/gainers', {}, '', { retry: 2, timeoutMs: 15_000 })
      .pipe(
        map(resp =>
          NewTokensApiService.prepareTokens<RatedBackendToken, RatedToken>(
            resp.results as RatedBackendToken[]
          )
        ),
        catchError(() => of([]))
      );
  }

  public fetchLosersTokens(): Observable<RatedToken[]> {
    return this.httpService
      .get<TokensBackendResponse>('v2/tokens/losers', {}, '', { retry: 2, timeoutMs: 15_000 })
      .pipe(
        map(resp =>
          NewTokensApiService.prepareTokens<RatedBackendToken, RatedToken>(
            resp.results as RatedBackendToken[]
          )
        ),
        catchError(() => of([]))
      );
  }
}

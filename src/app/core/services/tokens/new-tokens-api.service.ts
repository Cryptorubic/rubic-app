import { Injectable } from '@angular/core';
import { TokensApiService } from '@core/services/backend/tokens-api/tokens-api.service';
import { BlockchainName } from '@cryptorubic/sdk';
import {
  BackendToken,
  ENDPOINTS,
  FavoriteTokenRequestParams,
  TokensBackendResponse
} from '@core/services/backend/tokens-api/models/tokens';
import { Token } from '@shared/models/tokens/token';
import {
  BackendBlockchain,
  BLOCKCHAIN_NAME,
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS
} from '@cryptorubic/core';
import { firstValueFrom, forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from '@core/services/http/http.service';
import { ENVIRONMENT } from '../../../../environments/environment';
import { List } from 'immutable';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { AuthService } from '@core/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NewTokensApiService {
  private readonly tokensApiUrl = `${ENVIRONMENT.apiTokenUrl}/`;

  constructor(
    private readonly tokensApiService: TokensApiService,
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

  public getTopTokens(): Observable<Partial<Record<BlockchainName, Token[]>>> {
    const options = { page: 1, pageSize: 50 };
    const tier1Blockchains = [
      BLOCKCHAIN_NAME.ETHEREUM,
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      BLOCKCHAIN_NAME.POLYGON
    ].map(chain => TO_BACKEND_BLOCKCHAINS[chain]);

    return forkJoin(
      tier1Blockchains.map((network: BackendBlockchain) =>
        this.httpService.get<TokensBackendResponse>(
          ENDPOINTS.TOKENS,
          { ...options, network },
          this.tokensApiUrl
        )
      )
    ).pipe(
      map(chains => {
        return chains.reduce((acc, backendResponse, index) => {
          const blockchain = tier1Blockchains[index];
          return {
            ...acc,
            [blockchain]: NewTokensApiService.prepareTokens(backendResponse.results)
          };
        }, {});
      })
    );
  }

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

  public addFavoriteToken(token: TokenAmount): Observable<unknown | null> {
    const body: FavoriteTokenRequestParams = {
      network: TO_BACKEND_BLOCKCHAINS[token.blockchain],
      address: token.address,
      user: this.authService.userAddress
    };
    return this.httpService.post(ENDPOINTS.FAVORITE_TOKENS, body, this.tokensApiUrl);
  }

  public deleteFavoriteToken(token: TokenAmount): Observable<unknown | null> {
    const body: FavoriteTokenRequestParams = {
      network: TO_BACKEND_BLOCKCHAINS[token.blockchain],
      address: token.address,
      user: this.authService.userAddress
    };
    return this.httpService.delete(ENDPOINTS.FAVORITE_TOKENS, { body }, this.tokensApiUrl);
  }
}

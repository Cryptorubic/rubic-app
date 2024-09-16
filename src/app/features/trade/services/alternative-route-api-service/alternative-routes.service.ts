import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlternativeRoutesRequestParams } from './models/alternative-routes-request-params';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import {
  AlternativeRoute,
  AlternativeRouteDTO,
  AlternativeTokenPairs
} from './models/alternative-route';
import { SwapsFormService } from '../swaps-form/swaps-form.service';
import { TokensStoreService } from '@app/core/services/tokens/tokens-store.service';
import { compareAddresses, notNull } from '@app/shared/utils/utils';

@Injectable()
export class AlternativeRoutesService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly swapFormService: SwapsFormService,
    private readonly tokenStoreService: TokensStoreService
  ) {}

  private fetchAlternativeRoutes(
    params: AlternativeRoutesRequestParams
  ): Observable<AlternativeTokenPairs[]> {
    return this.httpClient
      .get<AlternativeRouteDTO>('https://dev-tokens.rubic.exchange/api/v1/token_pairs', {
        params: {
          ...params
        }
      })
      .pipe(map(res => res.token_pairs));
  }

  public getAlternativeRoutes(): Observable<AlternativeRoute[]> {
    return combineLatest([this.swapFormService.fromToken$, this.swapFormService.toToken$]).pipe(
      switchMap(([fromToken, toToken]) =>
        this.fetchAlternativeRoutes({
          sourceNetwork: fromToken.blockchain.toLowerCase(),
          sourceTokenAddress: fromToken.address,
          destinationNetwork: toToken.blockchain.toLowerCase(),
          destinationTokenAddress: toToken.address
        })
      ),
      map(alternativeRoutes =>
        alternativeRoutes
          .sort((a, b) => b.totalRank - a.totalRank)
          .map(route => {
            const fromToken = this.tokenStoreService.tokens.find(
              token =>
                compareAddresses(token.address, route.sourceTokenAddress) &&
                token.blockchain.toLowerCase() === route.sourceTokenNetwork.toLowerCase()
            );
            const toToken = this.tokenStoreService.tokens.find(
              token =>
                compareAddresses(token.address, route.destinationTokenAddress) &&
                token.blockchain.toLowerCase() === route.destinationTokenNetwork.toLowerCase()
            );

            if (!fromToken || !toToken) {
              return null;
            }
            return {
              from: fromToken,
              to: toToken
            };
          })
          .filter(notNull)
      )
    );
  }
}

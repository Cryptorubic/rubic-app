import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlternativeRoutesRequestParams } from './models/alternative-routes-request-params';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
  tap
} from 'rxjs';
import {
  AlternativeRoute,
  AlternativeRouteDTO,
  AlternativeRouteStatus,
  AlternativeRouteStatuses,
  AlternativeTokenPairs
} from './models/alternative-route';
import { SwapsFormService } from '../swaps-form/swaps-form.service';
import { TokensStoreService } from '@app/core/services/tokens/tokens-store.service';
import { compareAddresses, notNull } from '@app/shared/utils/utils';
import BigNumber from 'bignumber.js';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';

@Injectable()
export class AlternativeRoutesService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly swapFormService: SwapsFormService,
    private readonly tokenStoreService: TokensStoreService
  ) {}

  private readonly _alternativeRouteStatus$ = new BehaviorSubject<AlternativeRouteStatus>(
    AlternativeRouteStatuses.PENDING
  );

  private readonly DEFAULT_TOKEN_PRICE = 100;

  private DEFAULT_TOKEN_AMOUNT = new BigNumber(100);

  public readonly alternativeRouteStatus$ = this._alternativeRouteStatus$.asObservable();

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
    this._alternativeRouteStatus$.next(AlternativeRouteStatuses.PENDING);
    return combineLatest([this.swapFormService.fromToken$, this.swapFormService.toToken$]).pipe(
      switchMap(([fromToken, toToken]) =>
        this.fetchAlternativeRoutes({
          sourceNetwork: fromToken.blockchain.toLowerCase(),
          sourceTokenAddress: fromToken.address,
          destinationNetwork: toToken.blockchain.toLowerCase(),
          destinationTokenAddress: toToken.address
        })
      ),
      map(alternativeRoutes => {
        if (alternativeRoutes && alternativeRoutes.length === 0) {
          throw Error();
        }
        return alternativeRoutes
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

            const fromAmount = this.getFromTokenAmount(fromToken, route.sourceTokenUsdPrice);
            return {
              from: fromToken,
              to: toToken,
              amount: fromAmount
            };
          })
          .slice(0, 5)
          .filter(notNull);
      }),
      tap(() => this._alternativeRouteStatus$.next(AlternativeRouteStatuses.COMPLETE)),
      catchError(() => {
        this._alternativeRouteStatus$.next(AlternativeRouteStatuses.NO_ROUTES);
        return of(null);
      })
    );
  }

  private getFromTokenAmount(
    newFromToken: TokenAmount,
    alternativeTokenUsdPrice: number | null
  ): BigNumber {
    const prevFromToken = this.swapFormService.inputValue.fromToken;
    const fromAmount = this.swapFormService.inputValue.fromAmount;

    if (!compareAddresses(prevFromToken.address, newFromToken.address)) {
      if (!alternativeTokenUsdPrice) return this.DEFAULT_TOKEN_AMOUNT;

      const usdPrice = this.swapFormService.inputValue.fromToken.price;
      if (usdPrice) {
        const usdAmount = fromAmount.actualValue.multipliedBy(usdPrice);
        return usdAmount.dividedBy(alternativeTokenUsdPrice);
      }

      return new BigNumber(this.DEFAULT_TOKEN_PRICE).dividedBy(alternativeTokenUsdPrice);
    }

    return fromAmount.actualValue;
  }
}

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
import { compareAddresses, notNull } from '@app/shared/utils/utils';
import BigNumber from 'bignumber.js';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { ENVIRONMENT } from 'src/environments/environment';
import { TO_BACKEND_BLOCKCHAINS } from '@cryptorubic/sdk';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';

@Injectable()
export class AlternativeRoutesService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly swapFormService: SwapsFormService,
    private readonly tokensFacade: TokensFacadeService
  ) {}

  private readonly _alternativeRouteStatus$ = new BehaviorSubject<AlternativeRouteStatus>(
    AlternativeRouteStatuses.PENDING
  );

  private readonly DEFAULT_TOKEN_PRICE = 100;

  private readonly DEFAULT_TOKEN_AMOUNT = new BigNumber(100);

  public readonly alternativeRouteStatus$ = this._alternativeRouteStatus$.asObservable();

  private readonly _prevAlternativeRoutes$ = new BehaviorSubject<AlternativeRoute[]>([]);

  private readonly _currentAlternativeRoute$ = new BehaviorSubject<AlternativeRoute>(null);

  public setCurrentAlternativeRoute(selectedRoute: AlternativeRoute): void {
    this._currentAlternativeRoute$.next(selectedRoute);
  }

  public get currentAlternativeRoute(): AlternativeRoute {
    return this._currentAlternativeRoute$.getValue();
  }

  public setPrevAlternativeRoute(selectedRoute: AlternativeRoute): void {
    const prevAlternativeRoutes = this._prevAlternativeRoutes$.getValue();
    const isPrevRoute = this.checkIsPrevRoute({
      fromAddress: selectedRoute.from.address,
      toAddress: selectedRoute.to.address
    });
    if (!isPrevRoute) {
      this._prevAlternativeRoutes$.next([...prevAlternativeRoutes, selectedRoute]);
    }
  }

  private fetchAlternativeRoutes(
    params: AlternativeRoutesRequestParams
  ): Observable<AlternativeTokenPairs[]> {
    return this.httpClient
      .get<AlternativeRouteDTO>(`${ENVIRONMENT.apiTokenUrl}/v2/token_pairs/`, {
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
          sourceNetwork: TO_BACKEND_BLOCKCHAINS[fromToken.blockchain],
          sourceTokenAddress: fromToken.address,
          destinationNetwork: TO_BACKEND_BLOCKCHAINS[toToken.blockchain],
          destinationTokenAddress: toToken.address
        })
      ),
      map(routes => {
        const currentRoutes = routes.filter(
          route =>
            !this.checkIsPrevRoute({
              fromAddress: route.sourceTokenAddress,
              toAddress: route.destinationTokenAddress
            })
        );

        if (currentRoutes && currentRoutes.length === 0) {
          throw Error();
        }
        const alternativeRoutes = currentRoutes
          .sort((a, b) => b.totalRank - a.totalRank)
          .map(route => {
            const fromToken = this.tokensFacade.tokens.find(
              token =>
                compareAddresses(token.address, route.sourceTokenAddress) &&
                TO_BACKEND_BLOCKCHAINS[token.blockchain] === route.sourceTokenNetwork.toLowerCase()
            );
            const toToken = this.tokensFacade.tokens.find(
              token =>
                compareAddresses(token.address, route.destinationTokenAddress) &&
                TO_BACKEND_BLOCKCHAINS[token.blockchain] ===
                  route.destinationTokenNetwork.toLowerCase()
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

        if (alternativeRoutes.length === 0) {
          throw new Error();
        }

        return alternativeRoutes;
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

  private checkIsPrevRoute(currentRoute: { fromAddress: string; toAddress: string }): boolean {
    const prevAlternativeRoutes = this._prevAlternativeRoutes$.getValue();

    return prevAlternativeRoutes.some(
      route =>
        compareAddresses(route.from.address, currentRoute.fromAddress) &&
        compareAddresses(route.to.address, currentRoute.toAddress)
    );
  }
}

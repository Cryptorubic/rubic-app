import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlternativeRoutesRequestParams } from './models/alternative-routes-request-params';
import { catchError, combineLatest, map, Observable, of, switchMap } from 'rxjs';
import {
  AlternativeRoute,
  AlternativeRouteDTO,
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
            const fromAmount = this.getFromTokenAmount(fromToken, route.sourceTokenUsdPrice);
            return {
              from: fromToken,
              to: toToken,
              amount: fromAmount
            };
          })
          .slice(0, 5)
          .filter(notNull)
      ),
      catchError(() => of([]))
    );
  }

  private getFromTokenAmount(newFromToken: TokenAmount, tokenUsdPrice: number): BigNumber {
    const prevFromToken = this.swapFormService.inputValue.fromToken;
    const fromAmount = this.swapFormService.inputValue.fromAmount;
    if (!compareAddresses(prevFromToken.address, newFromToken.address)) {
      const usdPrice = this.swapFormService.inputValue.fromToken.price;
      const usdAmount = fromAmount.actualValue.multipliedBy(usdPrice);

      return usdAmount.dividedBy(tokenUsdPrice);
    }
    return fromAmount.actualValue;
  }
}

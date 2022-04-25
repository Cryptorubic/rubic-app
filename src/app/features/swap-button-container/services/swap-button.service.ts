import { Injectable } from '@angular/core';
import { SwapButtonContainerService } from '@features/swap-button-container/services/swap-button-container.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SwapButtonContainerErrorsService } from '@features/swap-button-container/services/swap-button-container-errors.service';
import { PRICE_IMPACT_RANGE } from '@shared/models/swaps/price-impact-range';
import { IframeService } from '@core/services/iframe/iframe.service';
import { SwapsService } from '@features/swaps/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';

@Injectable()
export class SwapButtonService {
  /**
   * Default text to display inside button.
   */
  private _defaultButtonText$ = new BehaviorSubject<string>(undefined);

  public set defaultButtonText(value: string) {
    this._defaultButtonText$.next(value);
  }

  private readonly _priceImpact$ = new BehaviorSubject<number>(0);

  public get priceImpact(): number {
    return this._priceImpact$.getValue();
  }

  private readonly _priceImpactLoading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = combineLatest([
    this.swapButtonContainerErrorsService.errorLoading$,
    this.swapButtonContainerService.tradeStatus$,
    this._priceImpactLoading$
  ]).pipe(
    map(
      ([errorLoading, tradeStatus, priceImpactLoading]) =>
        errorLoading ||
        tradeStatus === TRADE_STATUS.LOADING ||
        tradeStatus === TRADE_STATUS.SWAP_IN_PROGRESS ||
        (tradeStatus === TRADE_STATUS.READY_TO_SWAP && priceImpactLoading)
    )
  );

  public readonly disabled$ = combineLatest([
    this.swapButtonContainerService.tradeStatus$,
    this._priceImpact$,
    this.loading$
  ]).pipe(
    map(
      ([tradeStatus, priceImpact, loading]) =>
        tradeStatus !== TRADE_STATUS.READY_TO_SWAP ||
        priceImpact >= PRICE_IMPACT_RANGE.HIGH_DISABLED ||
        loading
    )
  );

  /**
   * Returns true, if warning is medium.
   */
  public readonly warningMedium$ = combineLatest([
    this.swapButtonContainerService.tradeStatus$,
    this._priceImpact$
  ]).pipe(
    map(
      ([tradeStatus, priceImpact]) =>
        tradeStatus !== TRADE_STATUS.DISABLED &&
        ((PRICE_IMPACT_RANGE.MEDIUM <= priceImpact && priceImpact < PRICE_IMPACT_RANGE.HIGH) ||
          priceImpact === null)
    )
  );

  /**
   * Returns true, if warning is high.
   */
  public readonly warningHigh$ = combineLatest([
    this.swapButtonContainerService.tradeStatus$,
    this._priceImpact$
  ]).pipe(
    map(
      ([tradeStatus, priceImpact]) =>
        tradeStatus !== TRADE_STATUS.DISABLED && priceImpact >= PRICE_IMPACT_RANGE.HIGH
    )
  );

  /**
   * Returns text to display inside button.
   */
  public readonly buttonText$ = combineLatest([
    this._defaultButtonText$,
    this.swapButtonContainerService.tradeStatus$,
    this._priceImpact$
  ]).pipe(
    map(([defaultText, tradeStatus, priceImpact]) =>
      tradeStatus === TRADE_STATUS.DISABLED ||
      !priceImpact ||
      priceImpact < PRICE_IMPACT_RANGE.MEDIUM
        ? defaultText
        : priceImpact < PRICE_IMPACT_RANGE.HIGH_DISABLED
        ? 'Swap Anyway'
        : 'Price impact too high'
    )
  );

  constructor(
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly swapButtonContainerErrorsService: SwapButtonContainerErrorsService,
    private readonly iframeService: IframeService,
    private readonly swapsService: SwapsService,
    private readonly priceImpactService: PriceImpactService
  ) {
    this.setupPriceImpactCalculation();
  }

  public setupPriceImpactCalculation(): void {
    this.swapButtonContainerService.tradeStatus$.subscribe(status => {
      if (status === TRADE_STATUS.LOADING) {
        this._priceImpactLoading$.next(true);
      } else {
        if (
          this.iframeService.isIframe ||
          this.swapsService.swapMode === SWAP_PROVIDER_TYPE.BRIDGE
        ) {
          this._priceImpact$.next(0);
        } else {
          this._priceImpact$.next(this.priceImpactService.priceImpact);
        }
        this._priceImpactLoading$.next(false);
      }
    });
  }
}

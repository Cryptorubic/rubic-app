import { Injectable } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SwapButtonContainerService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container.service';
import { SwapButtonContainerErrorsService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container-errors.service';

@Injectable()
export class OnramperSwapButtonService {
  public readonly buyNativeButtonLoading$ = combineLatest([
    this.swapButtonContainerErrorsService.errorLoading$,
    this.swapButtonContainerService.tradeStatus$
  ]).pipe(
    map(
      ([errorLoading, tradeStatus]) =>
        errorLoading ||
        tradeStatus === TRADE_STATUS.LOADING ||
        tradeStatus === TRADE_STATUS.BUY_NATIVE_IN_PROGRESS
    )
  );

  public readonly buyNativeButtonDisabled$ = this.swapButtonContainerService.tradeStatus$.pipe(
    map(tradeStatus => tradeStatus !== TRADE_STATUS.READY_TO_BUY_NATIVE)
  );

  constructor(
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly swapButtonContainerErrorsService: SwapButtonContainerErrorsService
  ) {}
}

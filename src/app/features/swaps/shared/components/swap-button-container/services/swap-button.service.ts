import { Injectable } from '@angular/core';
import { SwapButtonContainerService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SwapButtonContainerErrorsService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container-errors.service';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';

@Injectable()
export class SwapButtonService {
  public readonly loading$ = combineLatest([
    this.swapButtonContainerErrorsService.errorLoading$,
    this.swapButtonContainerService.tradeStatus$,
    this.sdkService.sdkLoading$
  ]).pipe(
    map(
      ([errorLoading, tradeStatus, sdkLoading]) =>
        errorLoading ||
        tradeStatus === TRADE_STATUS.LOADING ||
        tradeStatus === TRADE_STATUS.SWAP_IN_PROGRESS ||
        sdkLoading
    )
  );

  public readonly disabled$ = combineLatest([
    this.swapButtonContainerService.tradeStatus$,
    this.loading$
  ]).pipe(map(([tradeStatus, loading]) => tradeStatus !== TRADE_STATUS.READY_TO_SWAP || loading));

  constructor(
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly swapButtonContainerErrorsService: SwapButtonContainerErrorsService,
    private readonly sdkService: RubicSdkService
  ) {}
}

import { Injectable } from '@angular/core';
import { SwapButtonContainerService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SwapButtonContainerErrorsService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container-errors.service';

// @TODO TEST INT 2
@Injectable()
export class ApproveSwapButtonService {
  public readonly approveButtonLoading$ = combineLatest([
    this.swapButtonContainerErrorsService.errorLoading$,
    this.swapButtonContainerService.tradeStatus$
  ]).pipe(
    map(
      ([errorLoading, tradeStatus]) =>
        errorLoading ||
        tradeStatus === TRADE_STATUS.LOADING ||
        tradeStatus === TRADE_STATUS.APPROVE_IN_PROGRESS
    )
  );

  public readonly approveButtonDisabled$ = this.swapButtonContainerService.tradeStatus$.pipe(
    map(tradeStatus => tradeStatus !== TRADE_STATUS.READY_TO_APPROVE)
  );

  constructor(
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly swapButtonContainerErrorsService: SwapButtonContainerErrorsService
  ) {}
}

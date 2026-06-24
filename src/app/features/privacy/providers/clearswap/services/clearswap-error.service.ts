import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Injectable } from '@angular/core';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { PrivateSwapWindowService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import { PrivateTransferWindowService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-transfer-window/private-transfer-window.service';
import { ErrorInterface } from '@cryptorubic/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, tap } from 'rxjs';
import { compareTokens } from '@app/shared/utils/utils';

@Injectable()
export class ClearswapErrorService {
  private readonly _tradeError$ = new BehaviorSubject<ErrorInterface | null>(null);

  public readonly tradeError$ = this._tradeError$.asObservable();

  constructor(
    protected readonly privatePageTypeService: PrivatePageTypeService,
    protected readonly privateTransferWindowService: PrivateTransferWindowService,
    protected readonly privateSwapWindowService: PrivateSwapWindowService
  ) {
    combineLatest([
      this.privatePageTypeService.activePage$,
      this.privateTransferWindowService.transferAsset$,
      this.privateTransferWindowService.transferAmount$,
      this.privateSwapWindowService.swapInfo$.pipe(
        distinctUntilChanged((prev, curr) => {
          return (
            compareTokens(prev.fromAsset, curr.fromAsset) &&
            compareTokens(prev.toAsset, curr.toAsset) &&
            ((prev.fromAmount === null && curr.fromAmount === null) ||
              prev.fromAmount?.actualValue.eq(curr.fromAmount?.actualValue))
          );
        })
      )
    ])
      .pipe(
        tap(() => {
          this._tradeError$.next(null);
        }),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  public setTradeError(tradeError: ErrorInterface): void {
    this._tradeError$.next(tradeError);
  }
}

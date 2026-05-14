import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Injectable, Self } from '@angular/core';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { PrivateSwapWindowService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import { compareTokens } from '@app/shared/utils/utils';
import { ErrorInterface } from '@cryptorubic/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, takeUntil, tap } from 'rxjs';

@Injectable()
export class HoudiniErrorService {
  private readonly _tradeError$ = new BehaviorSubject<Partial<ErrorInterface> | null>(null);

  public readonly tradeError$ = this._tradeError$.asObservable();

  constructor(
    protected readonly privatePageTypeService: PrivatePageTypeService,
    protected readonly privateSwapWindowService: PrivateSwapWindowService
  ) {
    combineLatest([
      this.privatePageTypeService.activePage$,
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

  public setTradeError(tradeError: Partial<ErrorInterface>): void {
    this._tradeError$.next(tradeError);
  }
}

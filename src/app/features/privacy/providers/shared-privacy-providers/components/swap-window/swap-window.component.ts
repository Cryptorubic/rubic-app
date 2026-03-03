import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Injector,
  Output
} from '@angular/core';
import { Token, TokenAmount } from '@cryptorubic/core';
import { BehaviorSubject, debounceTime, of } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { PrivateSwapService } from '@features/privacy/providers/railgun/services/private-swap/private-swap.service';
import { PrivateModalsService } from '@features/privacy/providers/shared-privacy-providers/services/private-modals/private-modals.service';
import { combineLatestWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-swap-window',
  templateUrl: './swap-window.component.html',
  styleUrls: ['./swap-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapWindowComponent {
  @Output() public readonly handleSwap = new EventEmitter<{
    from: TokenAmount;
    to: TokenAmount;
    loadingCallback: () => void;
  }>();

  private readonly _fromAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly fromAsset$ = this._fromAsset$.asObservable();

  private readonly _toAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly toAsset$ = this._toAsset$.asObservable();

  private readonly _fromAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly fromAmount$ = this._fromAmount$.asObservable();

  private readonly _toAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly toAmount$ = this._toAmount$.asObservable();

  private readonly swapService = inject(PrivateSwapService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public readonly modalService = inject(PrivateModalsService);

  private readonly injector = inject(Injector);

  constructor() {
    this.initSubscribes();
  }

  public openFromSelector(): void {
    this.modalService
      .openPublicTokensModal(this.injector)
      .subscribe((selectedToken: BalanceToken) => {
        this._fromAsset$.next(selectedToken);
      });
  }

  public openToSelector(): void {
    this.modalService
      .openPrivateTokensModal(this.injector)
      .subscribe((selectedToken: BalanceToken) => {
        this._toAsset$.next(selectedToken);
      });
  }

  public updateFromInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    this._fromAmount$.next(value);
  }

  public handleMaxButton(): void {}

  public async swap(): Promise<void> {
    this._loading$.next(true);

    const fromToken = new TokenAmount({
      ...this._fromAsset$.value,
      tokenAmount: this._fromAmount$.value.actualValue
    });
    const toToken = new TokenAmount({
      ...this._toAsset$.value,
      tokenAmount: this._toAmount$.value.actualValue
    });

    this.handleSwap.emit({
      from: fromToken,
      to: toToken,
      loadingCallback: () => this._loading$.next(false)
    });
  }

  public async calculate(): Promise<void> {
    this._toAmount$.next(null);
    this._loading$.next(true);
    const fromWeiAmount = Token.toWei(
      this._fromAmount$.value.actualValue.toFixed(),
      this._fromAsset$.value.decimals
    );
    try {
      const amountOut = await this.swapService.getRates(
        this._fromAsset$.value.address,
        fromWeiAmount,
        this._toAsset$.value.address,
        this._fromAsset$.value.decimals,
        this._fromAsset$.value.blockchain,
        this._toAsset$.value.blockchain
      );
      this._toAmount$.next({
        visibleValue: amountOut,
        actualValue: new BigNumber(amountOut)
      });
    } catch (e) {
      this._toAmount$.next(null);
      console.error(e);
    }

    this._loading$.next(false);
  }

  private initSubscribes(): void {
    this.fromAmount$
      .pipe(
        combineLatestWith(this.fromAsset$, this.toAsset$),
        debounceTime(100),
        switchMap(([fromAmount, fromAsset, toAsset]) => {
          if (fromAmount?.actualValue?.gt(0) && fromAsset && toAsset) {
            return this.calculate();
          }
          return of(null);
        })
      )
      .subscribe();
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  Self,
  inject
} from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged, skip, takeUntil } from 'rxjs';
import { PrivateModalsService } from '../../services/private-modals/private-modals.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { PrivateSwapInfo, SwapAmount } from '../../models/swap-info';
import { PrivateSwapEvent } from '../../models/private-event';
import { compareTokens, isNil } from '@app/shared/utils/utils';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateQuoteAdapter } from '../../models/quote-adapter';
import { Token } from '@cryptorubic/core';
import { receiverAnimation } from '../../animations/receiver-animation';

@Component({
  selector: 'app-swap-window',
  templateUrl: './swap-window.component.html',
  styleUrls: ['./swap-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
  animations: [receiverAnimation()]
})
export class SwapWindowComponent implements OnInit {
  @Input({ required: true }) quoteAdapter: PrivateQuoteAdapter;

  @Output() swapClicked = new EventEmitter<PrivateSwapEvent>();

  private readonly modalService = inject(PrivateModalsService);

  private readonly injector = inject(Injector);

  private readonly _swapInfo$ = new BehaviorSubject<PrivateSwapInfo>({
    fromAsset: null,
    fromAmount: null,
    toAsset: null,
    toAmount: null
  });

  public readonly swapInfo$ = this._swapInfo$.asObservable();

  private readonly _displayReceiver$ = new BehaviorSubject<boolean>(false);

  public readonly displayReceiver$ = this._displayReceiver$.asObservable();

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public get swapInfoNotFilled(): boolean {
    const form = this._swapInfo$.value;
    return (
      !form.fromAsset ||
      !form.toAsset ||
      isNaN(form.fromAmount?.actualValue.toNumber()) ||
      isNaN(form.toAmount?.actualValue.toNumber()) ||
      form.fromAmount?.actualValue.isZero() ||
      form.toAmount?.actualValue.isZero()
    );
  }

  constructor(@Self() private readonly destroy$: TuiDestroyService) {}

  ngOnInit(): void {
    this.subscribeOnFormInputChanged();
  }

  private subscribeOnFormInputChanged(): void {
    this._swapInfo$
      .pipe(
        skip(1),
        debounceTime(500),
        distinctUntilChanged((prev, curr) => {
          const inputNotChanged =
            prev.fromAmount === curr.fromAmount &&
            compareTokens(prev.fromAsset, curr.fromAsset) &&
            compareTokens(prev.toAsset, curr.toAsset);
          return inputNotChanged;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(swapInfo => {
        if (this.assetsNotSelected()) return;
        if (this.amountNotSet()) {
          this.patchSwapInfo({ toAmount: null });
          return;
        }
        this.calculate(swapInfo);
      });
  }

  private assetsNotSelected(): boolean {
    const form = this._swapInfo$.value;
    return !form.fromAsset || !form.toAsset;
  }

  private amountNotSet(): boolean {
    const form = this._swapInfo$.value;
    return (
      isNil(form.fromAmount) ||
      form.fromAmount?.actualValue.isNaN() ||
      form.fromAmount?.actualValue.isZero()
    );
  }

  private async calculate(swapInfo: PrivateSwapInfo): Promise<void> {
    try {
      this._loading$.next(true);
      const outAmountWei = await this.quoteAdapter.quoteCallback(
        swapInfo.fromAsset,
        swapInfo.toAsset,
        swapInfo.fromAmount
      );
      this.patchSwapInfo({
        toAmount: {
          actualValue: outAmountWei,
          visibleValue: Token.fromWei(outAmountWei, swapInfo.toAsset.decimals).toFixed()
        }
      });
    } catch (err) {
      await this.quoteAdapter.quoteFallback(
        swapInfo.fromAsset,
        swapInfo.toAsset,
        swapInfo.fromAmount,
        err
      );
    } finally {
      this._loading$.next(false);
    }
  }

  private patchSwapInfo(partialSwapInfo: Partial<PrivateSwapInfo>): void {
    this._swapInfo$.next({ ...this._swapInfo$.value, ...partialSwapInfo });
  }

  public openInputSelector(): void {
    this.modalService
      .openPrivateTokensModal(this.injector)
      .subscribe((selectedToken: BalanceToken) => {
        this.patchSwapInfo({ fromAsset: selectedToken });
      });
  }

  public openOutputSelector(): void {
    this.modalService
      .openPrivateTokensModal(this.injector)
      .subscribe((selectedToken: BalanceToken) => {
        this.patchSwapInfo({ toAsset: selectedToken });
      });
  }

  public updateInputValue(value: SwapAmount): void {
    this.patchSwapInfo({ fromAmount: value });
  }

  public handleMaxButton(): void {}

  public async swap(): Promise<void> {
    this._loading$.next(true);
    this.swapClicked.emit({
      swapInfo: this._swapInfo$.value,
      loadingCallback: () => this._loading$.next(false)
    });
  }

  public toggleReceiver(): void {
    this._displayReceiver$.next(!this._displayReceiver$.value);
  }

  public async revert(): Promise<void> {
    this.patchSwapInfo({
      fromAsset: this._swapInfo$.value.toAsset,
      toAsset: this._swapInfo$.value.fromAsset,
      fromAmount: this._swapInfo$.value.toAmount,
      toAmount: null
    });
  }
}

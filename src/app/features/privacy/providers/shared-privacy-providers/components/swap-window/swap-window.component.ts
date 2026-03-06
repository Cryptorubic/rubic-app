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
import { BehaviorSubject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { PrivateModalsService } from '../../services/private-modals/private-modals.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { PrivateSwapInfo, SwapAmount } from '../../models/swap-info';
import { PrivateSwapEvent } from '../../models/private-event';
import { compareTokens, isNil } from '@app/shared/utils/utils';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateQuoteAdapter } from '../../models/quote-adapter';
import { Token } from '@cryptorubic/core';
import { receiverAnimation } from '../../animations/receiver-animation';
import { PreviewSwapModalFactory } from '../private-preview-swap/models/preview-swap-modal-factory';
import { PrivateSwapOptions } from '../private-preview-swap/models/preview-swap-options';

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

  @Input() set receiverAddressRequired(value: boolean) {
    if (value) {
      this._displayReceiver$.next(true);
    }
  }

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

  public get swapInfo(): PrivateSwapInfo {
    return this._swapInfo$.value;
  }

  private readonly _displayReceiver$ = new BehaviorSubject<boolean>(false);

  public readonly displayReceiver$ = this._displayReceiver$.asObservable();

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public get swapInfoNotFilled(): boolean {
    return (
      !this.swapInfo.fromAsset ||
      !this.swapInfo.toAsset ||
      isNaN(this.swapInfo.fromAmount?.actualValue.toNumber()) ||
      isNaN(this.swapInfo.toAmount?.actualValue.toNumber()) ||
      this.swapInfo.fromAmount?.actualValue.isZero() ||
      this.swapInfo.toAmount?.actualValue.isZero()
    );
  }

  public get notEnoughBalance(): boolean {
    return this.swapInfo.fromAmount.actualValue.gt(this.swapInfo.fromAsset.amount);
  }

  private createPreviewModal(): PreviewSwapModalFactory {
    const injector = this.injector;
    const modalService = this.modalService;

    return (options: PrivateSwapOptions) => {
      return modalService.openPrivatePreviewSwap(injector, {
        fromToken: this.swapInfo.fromAsset,
        toToken: this.swapInfo.toAsset,
        fromAmount: this.swapInfo.fromAmount,
        toAmount: this.swapInfo.toAmount,
        swapType: 'swap',
        swapOptions: options
      });
    };
  }

  constructor(@Self() private readonly destroy$: TuiDestroyService) {}

  ngOnInit(): void {
    this.subscribeOnFormInputChanged();
  }

  private subscribeOnFormInputChanged(): void {
    this._swapInfo$
      .pipe(
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
    return !this.swapInfo.fromAsset || !this.swapInfo.toAsset;
  }

  private amountNotSet(): boolean {
    return (
      isNil(this.swapInfo.fromAmount) ||
      this.swapInfo.fromAmount?.actualValue.isNaN() ||
      this.swapInfo.fromAmount?.actualValue.isZero()
    );
  }

  private async calculate(swapInfo: PrivateSwapInfo): Promise<void> {
    try {
      this._loading$.next(true);
      const { toAmountWei, tradeId } = await this.quoteAdapter.quoteCallback(
        swapInfo.fromAsset,
        swapInfo.toAsset,
        swapInfo.fromAmount
      );
      this.patchSwapInfo({
        toAmount: {
          actualValue: Token.fromWei(toAmountWei, swapInfo.toAsset.decimals),
          visibleValue: Token.fromWei(toAmountWei, swapInfo.toAsset.decimals).toFixed()
        },
        tradeId
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
      loadingCallback: () => this._loading$.next(false),
      openPreview: this.createPreviewModal()
    });
  }

  public toggleReceiver(): void {
    this._displayReceiver$.next(!this._displayReceiver$.value);
  }

  public async revert(): Promise<void> {
    this.patchSwapInfo({
      fromAsset: this.swapInfo.toAsset,
      toAsset: this.swapInfo.fromAsset,
      fromAmount: this.swapInfo.toAmount,
      toAmount: null
    });
  }
}

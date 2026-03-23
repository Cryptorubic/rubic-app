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
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  finalize,
  from,
  map,
  Observable,
  startWith,
  switchMap,
  takeUntil,
  tap
} from 'rxjs';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { compareTokens, isNil } from '@app/shared/utils/utils';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { Token } from '@cryptorubic/core';
import { FormControl } from '@angular/forms';
import { PrivateSwapWindowService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import BigNumber from 'bignumber.js';
import { CrossChainDepositStatus } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { CrossChainTransferTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import { CrossChainPaymentInfo } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { receiverAnimation } from '@app/features/privacy/providers/shared-privacy-providers/animations/receiver-animation';
import { PreviewSwapModalFactory } from '@app/features/privacy/providers/shared-privacy-providers/components/private-preview-swap/models/preview-swap-modal-factory';
import { PrivateSwapOptions } from '@app/features/privacy/providers/shared-privacy-providers/components/private-preview-swap/models/preview-swap-options';
import { PrivateSwapEvent } from '@app/features/privacy/providers/shared-privacy-providers/models/private-event';
import { PrivateQuoteAdapter } from '@app/features/privacy/providers/shared-privacy-providers/models/quote-adapter';
import { PrivateSwapFormConfig } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-form-types';
import { PrivateModalsService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-modals/private-modals.service';
import {
  PrivateSwapInfo,
  SwapAmount
} from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';

@Component({
  selector: 'app-private-page-swap',
  templateUrl: './private-page-swap.component.html',
  styleUrls: ['./private-page-swap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
  animations: [receiverAnimation()]
})
export class PrivatePageSwapComponent implements OnInit {
  @Input() receiverCtrl: FormControl<string>;

  @Input({ required: true }) quoteAdapter: PrivateQuoteAdapter;

  @Input() status: string;

  @Input() creationConfig: PrivateSwapFormConfig = {
    withActionButton: true,
    withDstSelector: true,
    withDstAmount: true,
    withReceiver: true,
    withSrcAmount: true
  };

  @Input() depositTrade: CrossChainTransferTrade | null;

  @Input() depositTradeStatus: CrossChainDepositStatus;

  @Input() depositPaymentInfo: CrossChainPaymentInfo;

  @Input() set receiverAddressRequired(value: boolean) {
    if (value) {
      this._displayReceiver$.next(true);
    }
  }

  @Input() set clearOutput(value: object) {
    this.patchSwapInfo({
      toAsset: null,
      toAmount: { actualValue: new BigNumber(0), visibleValue: '0' }
    });
  }

  @Output() swapClicked = new EventEmitter<PrivateSwapEvent>();

  @Output() formChanged = new EventEmitter<PrivateSwapInfo>();

  private readonly modalService = inject(PrivateModalsService);

  private readonly injector = inject(Injector);

  public readonly swapInfo$ = this.privateSwapWindowService.swapInfo$;

  private readonly _displayReceiver$ = new BehaviorSubject<boolean>(false);

  public readonly displayReceiver$ = this._displayReceiver$.asObservable();

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public readonly fromToken$ = this.swapInfo$.pipe(
    distinctUntilChanged((prev, curr) => compareTokens(prev.fromAsset, curr.fromAsset)),
    map(swapInfo => swapInfo.fromAsset)
  );

  public get swapInfo(): PrivateSwapInfo {
    return this.privateSwapWindowService.swapInfo;
  }

  public get notEnoughBalance(): boolean {
    return this.swapInfo.fromAmount.actualValue.gt(this.swapInfo.fromAsset.amount);
  }

  public get hasOutputContainer(): boolean {
    return this.creationConfig.withDstAmount || this.creationConfig.withDstSelector;
  }

  public get inputContainerRounding(): 'top' | 'bottom' | 'all' {
    const receiverOpened = this.creationConfig.withReceiver && this._displayReceiver$.value;
    if (this.hasOutputContainer) return 'top';
    else {
      if (receiverOpened) return 'top';
      return 'all';
    }
  }

  constructor(
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly privateSwapWindowService: PrivateSwapWindowService
  ) {}

  private createPreviewModal(): PreviewSwapModalFactory {
    const injector = this.injector;
    const modalService = this.modalService;

    return (options: PrivateSwapOptions) => {
      return modalService.openPrivatePreviewSwap(injector, {
        fromToken: this.swapInfo.fromAsset,
        toToken: this.swapInfo.toAsset,
        fromAmount: this.swapInfo.fromAmount,
        toAmount: this.swapInfo.toAmount,
        swapType: options.swapType ?? 'swap',
        swapOptions: options
      });
    };
  }

  ngOnInit(): void {
    this.subscribeOnFormInputChanged();
    this.subscribeForCalculation();
  }

  private subscribeForCalculation(): void {
    combineLatest([
      this.swapInfo$.pipe(
        distinctUntilChanged((prev, curr) => {
          const inputNotChanged =
            prev.fromAmount === curr.fromAmount &&
            compareTokens(prev.fromAsset, curr.fromAsset) &&
            compareTokens(prev.toAsset, curr.toAsset);
          return inputNotChanged;
        })
      ),
      this.receiverCtrl.valueChanges.pipe(startWith(''))
    ])
      .pipe(
        debounceTime(500),
        switchMap(([swapInfo]) => {
          if (this.assetsNotSelected() || this.amountNotSet()) {
            this.patchSwapInfo({ toAmount: null });
            this._loading$.next(false);
            return EMPTY;
          }
          return this.calculate(swapInfo);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private subscribeOnFormInputChanged(): void {
    this.swapInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(swapInfo => this.formChanged.emit(swapInfo));
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

  private calculate(swapInfo: PrivateSwapInfo): Observable<void> {
    this._loading$.next(true);

    return this.quoteAdapter
      .quoteCallback(swapInfo.fromAsset, swapInfo.toAsset, swapInfo.fromAmount)
      .pipe(
        tap(({ toAmountWei, tradeId }) => {
          this.patchSwapInfo({
            toAmount: {
              actualValue: Token.fromWei(toAmountWei, swapInfo.toAsset.decimals),
              visibleValue: Token.fromWei(toAmountWei, swapInfo.toAsset.decimals).toFixed()
            },
            tradeId
          });
        }),
        catchError(err => {
          this.patchSwapInfo({
            toAmount: null,
            tradeId: null
          });
          return from(
            this.quoteAdapter.quoteFallback(
              swapInfo.fromAsset,
              swapInfo.toAsset,
              swapInfo.fromAmount,
              err
            )
          );
        }),
        switchMap(() => EMPTY),
        finalize(() => {
          this._loading$.next(false);
        })
      );
  }

  private patchSwapInfo(partialSwapInfo: Partial<PrivateSwapInfo>): void {
    this.privateSwapWindowService.swapInfo = {
      ...this.privateSwapWindowService.swapInfo,
      ...partialSwapInfo
    };
  }

  public openInputSelector(): void {
    this.modalService
      .openPrivateTokensModal(this.injector, 'from', this.creationConfig.assetsSelectorConfig)
      .subscribe((selectedToken: BalanceToken) => {
        this.patchSwapInfo({ fromAsset: selectedToken });
      });
  }

  public openOutputSelector(): void {
    this.modalService
      .openPrivateTokensModal(this.injector, 'to', this.creationConfig.assetsSelectorConfig)
      .subscribe((selectedToken: BalanceToken) => {
        this.patchSwapInfo({ toAsset: selectedToken });
      });
  }

  public updateInputValue(value: SwapAmount): void {
    this.patchSwapInfo({ fromAmount: value });
  }

  public handleMaxButton(): void {
    const token = this.privateSwapWindowService.swapInfo.fromAsset;
    this.patchSwapInfo({
      fromAmount: {
        visibleValue: token.amount.toString(),
        actualValue: token.amount
      }
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

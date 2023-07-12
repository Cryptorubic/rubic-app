import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  Optional,
  Self
} from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { TuiDestroyService, tuiWatch } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { InstantTradeInfo } from '@features/swaps/features/instant-trade/models/instant-trade-info';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { PolymorpheusInput } from '@app/shared/decorators/polymorpheus-input';
import { HeaderStore } from '@app/core/header/services/header.store';

@Component({
  selector: 'app-swap-info-container',
  templateUrl: './swap-info-container.component.html',
  styleUrls: ['./swap-info-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SwapInfoContainerComponent implements OnInit {
  @PolymorpheusInput()
  @Input()
  swapType: SWAP_PROVIDER_TYPE;

  @PolymorpheusInput()
  @Input()
  currentInstantTradeInfo: InstantTradeInfo;

  @PolymorpheusInput()
  @Input()
  private set tradeStatus(status: TRADE_STATUS) {
    if (status === TRADE_STATUS.LOADING) {
      this.loading = true;
    }
  }

  public loading = false;

  public accordionOpened = false;

  public get isInstantTrade(): boolean {
    return this.swapType === SWAP_PROVIDER_TYPE.INSTANT_TRADE;
  }

  public get showTransactionInfo(): boolean {
    const { toAmount } = this.swapFormService.outputValue;
    return (
      (!this.isInstantTrade || this.currentInstantTradeInfo?.isWrappedType === false) &&
      toAmount?.isFinite()
    );
  }

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(
    @Optional()
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      void,
      {
        swapType: SWAP_PROVIDER_TYPE;
        currentInstantTradeInfo: InstantTradeInfo;
        tradeStatus: TRADE_STATUS;
      }
    >,
    private readonly cdr: ChangeDetectorRef,
    private readonly swapFormService: SwapFormService,
    private readonly headerStore: HeaderStore,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    this.handleLoading();
  }

  private handleLoading(): void {
    this.swapFormService.outputValue$
      .pipe(tuiWatch(this.cdr), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
  }
}

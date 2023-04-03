import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Self
} from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { InstantTradeInfo } from '@features/swaps/features/instant-trade/models/instant-trade-info';
import { SwapFormService } from '@core/services/swaps/swap-form.service';

@Component({
  selector: 'app-swap-info-container',
  templateUrl: './swap-info-container.component.html',
  styleUrls: ['./swap-info-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SwapInfoContainerComponent implements OnInit {
  @Input() public swapType: SWAP_PROVIDER_TYPE;

  @Input() public currentInstantTradeInfo: InstantTradeInfo;

  @Input() private set tradeStatus(status: TRADE_STATUS) {
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

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapFormService: SwapFormService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    this.handleLoading();
  }

  private handleLoading(): void {
    this.swapFormService.outputValue$
      .pipe(watch(this.cdr), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
  }
}

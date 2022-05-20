import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Self
} from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SwapInfoService } from '@features/swaps/core/services/swap-info-service/swap-info.service';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { map, takeUntil } from 'rxjs/operators';
import { InstantTradeInfo } from '@features/swaps/features/instant-trade/models/instant-trade-info';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';

@Component({
  selector: 'app-swap-info-container',
  templateUrl: './swap-info-container.component.html',
  styleUrls: ['./swap-info-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SwapInfoContainerComponent implements OnInit {
  @Input() public currentInstantTradeInfo: InstantTradeInfo;

  @Input() private set tradeStatus(status: TRADE_STATUS) {
    if (status === TRADE_STATUS.LOADING) {
      this.loading = true;
    }
  }

  public loading: boolean;

  public accordionOpened = false;

  public readonly isInstantTrade$ = this.swapsService.swapMode$.pipe(
    map(swapMode => swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE)
  );

  public get showTransactionInfo(): boolean {
    const { toAmount } = this.swapFormService.outputValue;
    return (
      (this.swapsService.swapMode !== SWAP_PROVIDER_TYPE.INSTANT_TRADE ||
        this.currentInstantTradeInfo?.isWrappedType === false) &&
      toAmount?.isFinite()
    );
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapInfoService: SwapInfoService,
    private readonly swapFormService: SwapFormService,
    private readonly swapsService: SwapsService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.loading = false;
  }

  ngOnInit() {
    this.swapFormService.outputValueChanges
      .pipe(watch(this.cdr), takeUntil(this.destroy$))
      .subscribe();

    this.swapInfoService.onInfoCalculated$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loading = false;
      this.cdr.markForCheck();
    });
  }
}

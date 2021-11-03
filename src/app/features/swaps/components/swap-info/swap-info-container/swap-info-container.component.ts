import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Self
} from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/SwapProviderType';
import InstantTrade from '@features/instant-trade/models/InstantTrade';
import { TRADE_STATUS } from '@shared/models/swaps/TRADE_STATUS';
import { SwapInfoService } from '@features/swaps/components/swap-info/services/swap-info.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-swap-info-container',
  templateUrl: './swap-info-container.component.html',
  styleUrls: ['./swap-info-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SwapInfoContainerComponent implements OnInit {
  @Input() public swapType: SWAP_PROVIDER_TYPE;

  @Input() public currentInstantTrade: InstantTrade;

  @Input() private set tradeStatus(status: TRADE_STATUS) {
    if (status === TRADE_STATUS.LOADING) {
      this.loading = true;
    }
  }

  public SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public loading: boolean;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapInfoService: SwapInfoService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.loading = false;
  }

  ngOnInit() {
    this.swapInfoService.onInfoCalculated$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loading = false;
      this.cdr.markForCheck();
    });
  }
}

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/SwapProviderType';
import InstantTrade from '@features/instant-trade/models/InstantTrade';
import { TRADE_STATUS } from '@shared/models/swaps/TRADE_STATUS';

@Component({
  selector: 'app-swap-info-container',
  templateUrl: './swap-info-container.component.html',
  styleUrls: ['./swap-info-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapInfoContainerComponent {
  @Input() public swapType: SWAP_PROVIDER_TYPE;

  @Input() public currentInstantTrade: InstantTrade;

  @Input() private set tradeStatus(status: TRADE_STATUS) {
    if (status === TRADE_STATUS.LOADING) {
      this.loading = true;
    }
  }

  public SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public loading: boolean;

  constructor() {
    this.loading = false;
  }
}

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/SwapProviderType';
import InstantTrade from '@features/instant-trade/models/InstantTrade';

@Component({
  selector: 'app-swap-info-container',
  templateUrl: './swap-info-container.component.html',
  styleUrls: ['./swap-info-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapInfoContainerComponent {
  @Input() public swapType: SWAP_PROVIDER_TYPE;

  @Input() public currentInstantTrade: InstantTrade;

  public SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  constructor() {}
}

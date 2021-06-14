import { Component } from '@angular/core';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';

@Component({
  selector: 'app-swaps-form',
  templateUrl: './swaps-form.component.html',
  styleUrls: ['./swaps-form.component.scss']
})
export class SwapsFormComponent {
  public blockchainsList = [
    { name: 'Binance Smart Chain', chainImg: 'assets/images/icons/coins/bnb.svg' },
    { name: 'Polygon', chainImg: 'assets/images/icons/coins/polygon.svg' },
    { name: 'Ethereum', chainImg: 'assets/images/icons/eth-logo.svg' },
    { name: 'xDai', chainImg: 'assets/images/icons/coins/xdai.svg' },
    { name: 'Kovan', chainImg: 'assets/images/icons/coins/kovan.png' }
  ];

  get isInstantTrade(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE;
  }

  constructor(private readonly swapsService: SwapsService) {}
}

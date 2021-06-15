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
    { name: 'Binance Smart Chain', chainImg: 'assets/images/icons/coins/bnb.svg', id: 2 },
    { name: 'Polygon', chainImg: 'assets/images/icons/coins/polygon.svg', id: 3 },
    { name: 'Ethereum', chainImg: 'assets/images/icons/eth-logo.svg', id: 4 },
    { name: 'xDai', chainImg: 'assets/images/icons/coins/xdai.svg', id: 5 },
    { name: 'Kovan', chainImg: 'assets/images/icons/coins/kovan.png', id: 6 }
  ];

  get isInstantTrade(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE;
  }

  constructor(private readonly swapsService: SwapsService) {}
}

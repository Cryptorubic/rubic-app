import { ChangeDetectorRef, Component } from '@angular/core';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

@Component({
  selector: 'app-swaps-form',
  templateUrl: './swaps-form.component.html',
  styleUrls: ['./swaps-form.component.scss']
})
export class SwapsFormComponent {
  public blockchainsList = [
    {
      name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      chainImg: 'assets/images/icons/coins/bnb.svg',
      id: 56
    },
    {
      name: BLOCKCHAIN_NAME.POLYGON,
      chainImg: 'assets/images/icons/coins/polygon.svg',
      id: 137
    },
    { name: BLOCKCHAIN_NAME.ETHEREUM, chainImg: 'assets/images/icons/eth-logo.svg', id: 1 },
    { name: BLOCKCHAIN_NAME.XDAI, chainImg: 'assets/images/icons/coins/xdai.svg', id: 100 },
    {
      name: BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
      chainImg: 'assets/images/icons/coins/kovan.png',
      id: 42
    }
  ];

  get isInstantTrade(): boolean {
    this.cdr.markForCheck();
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE;
  }

  constructor(
    private readonly swapsService: SwapsService,
    private readonly cdr: ChangeDetectorRef
  ) {}
}

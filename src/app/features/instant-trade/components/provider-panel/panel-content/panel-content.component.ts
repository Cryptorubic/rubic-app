import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { TradeData } from 'src/app/features/instant-trade/components/provider-panel/models/trade-data';
import { ProviderData } from 'src/app/features/instant-trade/components/provider-panel/models/provider-data';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Observable } from 'rxjs';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { shouldDisplayGas } from 'src/app/features/instant-trade/constants/shouldDisplayGas';

@Component({
  selector: 'app-panel-content',
  templateUrl: './panel-content.component.html',
  styleUrls: ['./panel-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelContentComponent implements OnInit {
  @Input() public tradeData: TradeData;

  @Input() public providerData: ProviderData;

  public blockchains = BLOCKCHAIN_NAME;

  public swapFormData: Observable<SwapFormInput>;

  public displayGas: boolean;

  constructor() {}

  public ngOnInit(): void {
    this.displayGas = shouldDisplayGas[this.tradeData?.blockchain as keyof typeof shouldDisplayGas];
  }
}

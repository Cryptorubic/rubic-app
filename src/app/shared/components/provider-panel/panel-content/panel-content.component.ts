import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TradeData } from 'src/app/shared/components/provider-panel/models/trade-data';
import { ProviderData } from 'src/app/shared/components/provider-panel/models/provider-data';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

@Component({
  selector: 'app-panel-content',
  templateUrl: './panel-content.component.html',
  styleUrls: ['./panel-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelContentComponent {
  @Input() public tradeData: TradeData;

  @Input() public providerData: ProviderData;

  public blockchains = BLOCKCHAIN_NAME;

  constructor() {}
}

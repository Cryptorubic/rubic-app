import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { TradeData } from 'src/app/shared/components/provider-panel/models/trade-data';
import { ProviderData } from 'src/app/shared/components/provider-panel/models/provider-data';

@Component({
  selector: 'app-panel-content',
  templateUrl: './panel-content.component.html',
  styleUrls: ['./panel-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelContentComponent {
  @Input() public tradeData: TradeData;

  @Input() public providerData: ProviderData;

  constructor() {}
}

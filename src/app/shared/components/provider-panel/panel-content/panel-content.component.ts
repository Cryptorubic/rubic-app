import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { TradeData } from 'src/app/shared/components/provider-panel/models/trade-data';
import { ProviderData } from 'src/app/shared/components/provider-panel/models/provider-data';
import { shouldCalculateGasInBlockchain } from '../../../../features/instant-trade/services/instant-trade-service/constants/shouldCalculateGasInBlockchain';

@Component({
  selector: 'app-panel-content',
  templateUrl: './panel-content.component.html',
  styleUrls: ['./panel-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelContentComponent implements OnInit {
  @Input() public tradeData: TradeData;

  @Input() public providerData: ProviderData;

  public isGasFeeShow: boolean = false;

  constructor() {}

  ngOnInit() {
    this.isGasFeeShow = shouldCalculateGasInBlockchain[this.tradeData?.blockchain];
  }
}

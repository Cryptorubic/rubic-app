import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { TradeData } from 'src/app/shared/components/provider-panel/models/trade-data';
import { ProviderData } from 'src/app/shared/components/provider-panel/models/provider-data';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { shouldCalculateGasInBlockchain } from '../../../../features/instant-trade/services/instant-trade-service/constants/shouldCalculateGasInBlockchain';

type InstantTradeBlockchain = Exclude<
  BLOCKCHAIN_NAME,
  | BLOCKCHAIN_NAME.TRON
  | BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET
  | BLOCKCHAIN_NAME.ETHEREUM_TESTNET
  | BLOCKCHAIN_NAME.HARMONY_TESTNET
  | BLOCKCHAIN_NAME.POLYGON_TESTNET
  | BLOCKCHAIN_NAME.XDAI
>;

@Component({
  selector: 'app-panel-content',
  templateUrl: './panel-content.component.html',
  styleUrls: ['./panel-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelContentComponent implements OnInit {
  @Input() public tradeData: TradeData;

  @Input() public providerData: ProviderData;

  public isGasFeeShow = false;

  constructor() {}

  ngOnInit() {
    this.isGasFeeShow =
      shouldCalculateGasInBlockchain[this.tradeData?.blockchain as InstantTradeBlockchain];
  }
}

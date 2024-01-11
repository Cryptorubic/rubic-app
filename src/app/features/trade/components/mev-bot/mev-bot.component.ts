import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { CrossChainTrade, OnChainTrade } from 'rubic-sdk';

@Component({
  selector: 'app-mev-bot',
  templateUrl: './mev-bot.component.html',
  styleUrls: ['./mev-bot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MevBotComponent {
  public crossChainRoutingForm = this.settingsService.crossChainRouting;

  public displayMev: boolean = false;

  @Input() set trade(trade: CrossChainTrade | OnChainTrade) {
    const minDollarAmountToDisplay = 999;
    const amount = trade?.from.price.multipliedBy(trade?.from.tokenAmount);
    const isCrossChain = trade?.from.blockchain !== trade?.to.blockchain;

    this.displayMev = amount && isCrossChain ? amount.gt(minDollarAmountToDisplay) : false;

    if (!this.displayMev) {
      this.settingsService.crossChainRouting.patchValue({
        useMevBotProtection: false
      });
    }
  }

  constructor(private readonly settingsService: SettingsService) {}
}

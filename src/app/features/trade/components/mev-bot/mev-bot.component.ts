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

  //state.tradeState?.trade?.from.price.multipliedBy(state.tradeState?.trade?.from.tokenAmount)
  @Input() set trade(trade: CrossChainTrade | OnChainTrade) {
    const minDollarAmountToDisplay = 100;
    const amount = trade?.from.price.multipliedBy(trade?.from.tokenAmount);
    const isOnChainSwap = trade?.from.blockchain === trade?.to.blockchain;

    if (isOnChainSwap) {
      this.displayMev = false;
    } else {
      this.displayMev = amount ? amount.gt(minDollarAmountToDisplay) : false;
    }

    if (!this.displayMev) {
      this.settingsService.crossChainRouting.patchValue({
        useMevBotProtection: false
      });
    }
  }

  constructor(private readonly settingsService: SettingsService) {}
}

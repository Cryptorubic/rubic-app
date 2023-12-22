import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-mev-bot',
  templateUrl: './mev-bot.component.html',
  styleUrls: ['./mev-bot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MevBotComponent {
  public crossChainRoutingForm = this.settingsService.crossChainRouting;

  public displayMev: boolean = false;

  @Input() set tradePrice(value: BigNumber | undefined) {
    const minDollarAmountToDisplay = 999;
    this.displayMev = value ? value.gt(minDollarAmountToDisplay) : false;
    if (!this.displayMev) {
      this.settingsService.crossChainRouting.patchValue({
        useMevBotProtection: false
      });
    }
  }

  constructor(private readonly settingsService: SettingsService) {}
}

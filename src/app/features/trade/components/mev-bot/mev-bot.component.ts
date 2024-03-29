import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import {
  CcrSettingsFormControls,
  ItSettingsFormControls
} from '@features/trade/services/settings-service/models/settings-form-controls';
import { FormGroup } from '@angular/forms';
import { CrossChainTrade, OnChainTrade } from 'rubic-sdk';

@Component({
  selector: 'app-mev-bot',
  templateUrl: './mev-bot.component.html',
  styleUrls: ['./mev-bot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MevBotComponent {
  public routingForm: FormGroup<ItSettingsFormControls> | FormGroup<CcrSettingsFormControls> =
    this.settingsService.crossChainRouting;

  public displayMev: boolean = false;

  @Input() set trade(trade: CrossChainTrade | OnChainTrade) {
    const minDollarAmountToDisplay = 1000;
    const amount = trade?.from.price.multipliedBy(trade?.from.tokenAmount);

    this.routingForm =
      trade?.from.blockchain === trade?.to.blockchain
        ? this.settingsService.instantTrade
        : this.settingsService.crossChainRouting;

    this.displayMev = amount ? amount.gte(minDollarAmountToDisplay) : false;

    this.patchUseMevBotProtection(true);

    if (!this.displayMev) {
      this.patchUseMevBotProtection(false);
    }
  }

  constructor(private readonly settingsService: SettingsService) {}

  private patchUseMevBotProtection(value: boolean): void {
    this.routingForm.patchValue({
      useMevBotProtection: value
    });
  }
}

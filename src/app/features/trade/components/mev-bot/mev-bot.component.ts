import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import {
  CcrSettingsFormControls,
  ItSettingsFormControls
} from '@features/trade/services/settings-service/models/settings-form-controls';
import { FormGroup } from '@angular/forms';
import { CrossChainTrade, OnChainTrade } from 'rubic-sdk';
import { ModalService } from '@core/modals/services/modal.service';
import { HeaderStore } from '@core/header/services/header.store';

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

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public hintShownOnMobile = false;

  @Input() set trade(trade: CrossChainTrade | OnChainTrade) {
    const minDollarAmountToDisplay = 0.01;
    const amount = trade?.from.price.multipliedBy(trade?.from.tokenAmount);

    this.routingForm =
      trade?.from.blockchain === trade?.to.blockchain
        ? this.settingsService.instantTrade
        : this.settingsService.crossChainRouting;

    this.initSubscription();

    this.displayMev = amount ? amount.gte(minDollarAmountToDisplay) : false;

    if (!this.displayMev) {
      this.patchUseMevBotProtection(false);
    }
  }

  constructor(
    private readonly settingsService: SettingsService,
    private readonly modalService: ModalService,
    private readonly headerStore: HeaderStore
  ) {}

  private initSubscription(): void {
    this.routingForm.valueChanges.subscribe(form => {
      if (form.useMevBotProtection) {
        this.hintShownOnMobile = false;
        this.modalService.openMevBotModal().subscribe();
      }
    });
  }

  public patchUseMevBotProtection(value: boolean): void {
    this.routingForm.patchValue({
      useMevBotProtection: value
    });
  }

  public showHint(): void {
    if (!this.routingForm.value.useMevBotProtection) {
      this.hintShownOnMobile = !this.hintShownOnMobile;
    }
  }
}

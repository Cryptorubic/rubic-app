import { ChangeDetectionStrategy, Component, EventEmitter, Input } from '@angular/core';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import {
  CcrSettingsFormControls,
  ItSettingsFormControls
} from '@features/trade/services/settings-service/models/settings-form-controls';
import { FormGroup } from '@angular/forms';
import { CrossChainTrade, OnChainTrade } from 'rubic-sdk';
import { HeaderStore } from '@core/header/services/header.store';
import { combineLatestWith, map, startWith } from 'rxjs/operators';
import { ModalService } from '@core/modals/services/modal.service';

@Component({
  selector: 'app-mev-bot',
  templateUrl: './mev-bot.component.html',
  styleUrls: ['./mev-bot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MevBotComponent {
  public routingForm: FormGroup<ItSettingsFormControls | CcrSettingsFormControls> =
    this.settingsService.crossChainRouting;

  public displayMev: boolean = false;

  public readonly hintEmitter$ = new EventEmitter();

  private showHintOnMobile = false;

  public readonly showHint$ = this.headerStore.getMobileDisplayStatus().pipe(
    combineLatestWith(
      this.routingForm.valueChanges.pipe(startWith(this.routingForm.value)),
      this.hintEmitter$.pipe(startWith(undefined))
    ),
    map(([isMobile, settings]) => {
      if (isMobile && !settings.useMevBotProtection) {
        this.showHintOnMobile = !this.showHintOnMobile;
        return this.showHintOnMobile;
      }

      if (!isMobile) {
        return !settings.useMevBotProtection;
      }
    })
  );

  @Input() set trade(trade: CrossChainTrade | OnChainTrade) {
    const minDollarAmountToDisplay = 0.01;
    const amount = trade?.from.price.multipliedBy(trade?.from.tokenAmount);

    this.routingForm = (trade?.from.blockchain === trade?.to.blockchain
      ? this.settingsService.instantTrade
      : this.settingsService.crossChainRouting) as unknown as FormGroup<
      ItSettingsFormControls | CcrSettingsFormControls
    >;

    this.displayMev = amount ? amount.gte(minDollarAmountToDisplay) : false;

    if (!this.displayMev) {
      this.patchUseMevBotProtection(false);
    }
  }

  constructor(
    private readonly settingsService: SettingsService,
    private readonly modalService: ModalService,
    private readonly headerStore: HeaderStore
  ) {
    this.routingForm.valueChanges.subscribe(settings => {
      if (settings.useMevBotProtection) {
        this.modalService.openMevBotModal().subscribe();
      }
    });
  }

  private patchUseMevBotProtection(value: boolean): void {
    this.routingForm.patchValue({
      useMevBotProtection: value
    });
  }

  public showHint(): void {
    this.hintEmitter$.emit();
  }
}

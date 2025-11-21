import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import {
  CcrSettingsFormControls,
  ItSettingsFormControls
} from '@features/trade/services/settings-service/models/settings-form-controls';
import { FormGroup } from '@angular/forms';
import { HeaderStore } from '@core/header/services/header.store';
import { distinctUntilChanged, pairwise, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { ModalService } from '@core/modals/services/modal.service';
import { BehaviorSubject } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';

@Component({
  selector: 'app-mev-bot',
  templateUrl: './mev-bot.component.html',
  styleUrls: ['./mev-bot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class MevBotComponent {
  private readonly _routingForm$ = new BehaviorSubject<
    FormGroup<ItSettingsFormControls | CcrSettingsFormControls>
  >(this.settingsService.crossChainRouting);

  public readonly routingForm$ = this._routingForm$.asObservable();

  public displayMev: boolean = false;

  @Input() set trade(trade: CrossChainTrade | OnChainTrade) {
    const minDollarAmountToDisplay = 1000;
    const amount = trade?.from.price.multipliedBy(trade?.from.tokenAmount);

    if (trade?.from.blockchain !== trade?.to.blockchain) {
      this._routingForm$.next(this.settingsService.crossChainRouting);
    } else {
      this._routingForm$.next(
        this.settingsService.instantTrade as unknown as FormGroup<
          ItSettingsFormControls | CcrSettingsFormControls
        >
      );
    }

    this.displayMev = amount
      ? amount.gte(minDollarAmountToDisplay) && !this.headerStore.isMobile
      : false;

    if (!this.displayMev) {
      this.settings.patchValue({ useMevBotProtection: false });
    }
  }

  private get settings(): FormGroup<ItSettingsFormControls | CcrSettingsFormControls> {
    return this._routingForm$.getValue();
  }

  constructor(
    private readonly settingsService: SettingsService,
    private readonly destroy$: TuiDestroyService,
    private readonly modalService: ModalService,
    private readonly headerStore: HeaderStore
  ) {
    this.subscribeOnRoutingForm();
  }

  private subscribeOnRoutingForm(): void {
    this.routingForm$
      .pipe(
        switchMap(settings => settings.valueChanges),
        startWith(this.settingsService.crossChainRouting.value),
        distinctUntilChanged(),
        pairwise(),
        takeUntil(this.destroy$)
      )
      .subscribe(([prev, curr]) => {
        if (prev.useMevBotProtection !== curr.useMevBotProtection && curr.useMevBotProtection) {
          this.modalService.openMevBotModal().subscribe();
        }
      });
  }
}

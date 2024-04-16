import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import {
  CcrSettingsFormControls,
  ItSettingsFormControls
} from '@features/trade/services/settings-service/models/settings-form-controls';
import { FormGroup } from '@angular/forms';
import { CrossChainTrade, OnChainTrade } from 'rubic-sdk';
import { HeaderStore } from '@core/header/services/header.store';
import {
  distinctUntilChanged,
  pairwise,
  startWith,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { ModalService } from '@core/modals/services/modal.service';
import { BehaviorSubject } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-mev-bot',
  templateUrl: './mev-bot.component.html',
  styleUrls: ['./mev-bot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class MevBotComponent {
  // public routingForm: FormGroup<ItSettingsFormControls | CcrSettingsFormControls> =
  //   this.settingsService.crossChainRouting;

  private readonly _routingForm$ = new BehaviorSubject<
    FormGroup<ItSettingsFormControls | CcrSettingsFormControls>
  >(this.settingsService.crossChainRouting);

  public readonly routingForm$ = this._routingForm$.asObservable();

  public displayMev: boolean = false;

  @Input() set trade(trade: CrossChainTrade | OnChainTrade) {
    // TODO: set 1000 for production
    const minDollarAmountToDisplay = 0.01;
    const amount = trade?.from.price.multipliedBy(trade?.from.tokenAmount);

    if (trade?.from.blockchain === trade?.to.blockchain) {
      this._routingForm$.next(
        this.settingsService.instantTrade as unknown as FormGroup<
          ItSettingsFormControls | CcrSettingsFormControls
        >
      );
    } else {
      this._routingForm$.next(this.settingsService.crossChainRouting);
    }

    this.displayMev = amount
      ? amount.gte(minDollarAmountToDisplay) && !this.headerStore.isMobile
      : false;

    if (!this.displayMev) {
      this.patchUseMevBotProtection(false);
    }
  }

  constructor(
    private readonly settingsService: SettingsService,
    private readonly destroy$: TuiDestroyService,
    private readonly modalService: ModalService,
    private readonly headerStore: HeaderStore
  ) {
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

  private patchUseMevBotProtection(value: boolean): void {
    this._routingForm$.pipe(
      tap(settings => {
        settings.patchValue({
          useMevBotProtection: value
        });
      })
    );
  }
}

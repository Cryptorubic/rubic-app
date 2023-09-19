import { ChangeDetectionStrategy, Component, Injector, OnInit, Type } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { ModalService } from '@app/core/modals/services/modal.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { SettingsItComponent } from '@features/trade/components/settings-it/settings-it.component';
import { SettingsCcrComponent } from '@features/trade/components/settings-ccr/settings-ccr.component';

@Component({
  selector: 'app-settings-container',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsContainerComponent implements OnInit {
  public settingsComponent: PolymorpheusComponent<
    SettingsItComponent | SettingsCcrComponent,
    Injector
  >;

  public open: boolean;

  public readonly mode$ = this.swapsFormService.inputValue$.pipe(
    map(({ fromBlockchain, toBlockchain }) =>
      fromBlockchain === toBlockchain
        ? SWAP_PROVIDER_TYPE.INSTANT_TRADE
        : SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING
    ),
    startWith(SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING)
  );

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly swapsFormService: SwapsFormService,
    private readonly modalService: ModalService
  ) {
    this.open = false;
  }

  ngOnInit(): void {
    this.mode$.pipe(distinctUntilChanged()).subscribe(mode => {
      const component =
        mode === SWAP_PROVIDER_TYPE.INSTANT_TRADE ? SettingsItComponent : SettingsCcrComponent;

      this.settingsComponent = new PolymorpheusComponent(
        component as Type<SettingsItComponent | SettingsCcrComponent>
      );
    });
  }

  public openMobile(): void {
    this.mode$
      .pipe(
        switchMap(mode =>
          mode === SWAP_PROVIDER_TYPE.INSTANT_TRADE
            ? this.modalService.openItSettings()
            : this.modalService.openCcrSettings()
        )
      )
      .subscribe();
  }
}

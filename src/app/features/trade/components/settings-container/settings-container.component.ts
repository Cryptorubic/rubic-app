import { ChangeDetectionStrategy, Component, Inject, Injector, OnInit, Type } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ModalService } from '@app/core/modals/services/modal.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { distinctUntilChanged, first, map, startWith, switchMap } from 'rxjs/operators';
import { SettingsItComponent } from '@features/trade/components/settings-it/settings-it.component';
import { SettingsCcrComponent } from '@features/trade/components/settings-ccr/settings-ccr.component';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';

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
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector
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
        first(),
        switchMap(mode =>
          mode === SWAP_PROVIDER_TYPE.INSTANT_TRADE
            ? this.modalService.openItSettings(this.injector)
            : this.modalService.openCcrSettings(this.injector)
        )
      )
      .subscribe();
  }
}

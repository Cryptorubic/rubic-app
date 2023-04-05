import { ChangeDetectionStrategy, Component, Injector, OnInit, Type } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { SettingsItComponent } from '@features/swaps/features/swap-form/components/swap-settings/settings-it/settings-it.component';
import { SettingsCcrComponent } from '@features/swaps/features/swap-form/components/swap-settings/settings-ccr/settings-ccr.component';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { ModalService } from '@app/core/modals/services/modal.service';
import { HeaderStore } from '@app/core/header/services/header.store';

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

  private prevMode: SWAP_PROVIDER_TYPE;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly swapService: SwapTypeService,
    private readonly swapFormService: SwapFormService,
    private readonly modalService: ModalService
  ) {
    this.open = false;
  }

  ngOnInit(): void {
    this.settingsComponent = this.getSettingsComponent();
    this.swapFormService.form.valueChanges.subscribe(() => {
      if (this.prevMode !== this.swapService.swapMode) {
        this.settingsComponent = this.getSettingsComponent();
      }
      this.prevMode = this.swapService.swapMode;
    });
  }

  public getSettingsComponent(): PolymorpheusComponent<
    SettingsItComponent | SettingsCcrComponent,
    Injector
  > {
    let component;
    switch (this.swapService.swapMode) {
      case SWAP_PROVIDER_TYPE.INSTANT_TRADE:
        component = SettingsItComponent;
        break;
      default:
        component = SettingsCcrComponent;
    }
    return new PolymorpheusComponent(component as Type<SettingsItComponent | SettingsCcrComponent>);
  }

  public openMobile(): void {
    switch (this.swapService.swapMode) {
      case SWAP_PROVIDER_TYPE.INSTANT_TRADE:
        this.modalService.openItSettings().subscribe();
        break;
      default:
        this.modalService.openCcrSettings().subscribe();
    }
  }
}

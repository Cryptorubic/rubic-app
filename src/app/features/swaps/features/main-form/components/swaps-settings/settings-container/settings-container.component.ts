import { ChangeDetectionStrategy, Component, Injector, OnInit, Type } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { SettingsItComponent } from '@features/swaps/features/main-form/components/swaps-settings/settings-it/settings-it.component';
import { SettingsBridgeComponent } from '@features/swaps/features/main-form/components/swaps-settings/settings-bridge/settings-bridge.component';
import { SettingsCcrComponent } from '@features/swaps/features/main-form/components/swaps-settings/settings-ccr/settings-ccr.component';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';

@Component({
  selector: 'app-settings-container',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsContainerComponent implements OnInit {
  public settingsComponent: PolymorpheusComponent<
    SettingsItComponent | SettingsBridgeComponent | SettingsCcrComponent,
    Injector
  >;

  public open: boolean;

  private prevMode: SWAP_PROVIDER_TYPE;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly swapService: SwapsService,
    private readonly swapFormService: SwapFormService
  ) {
    this.open = false;
  }

  ngOnInit(): void {
    this.settingsComponent = this.getSettingsComponent();
    this.swapFormService.commonTrade.valueChanges.subscribe(() => {
      if (this.prevMode !== this.swapService.swapMode) {
        this.settingsComponent = this.getSettingsComponent();
      }
      this.prevMode = this.swapService.swapMode;
    });
  }

  public getSettingsComponent(): PolymorpheusComponent<
    SettingsItComponent | SettingsBridgeComponent | SettingsCcrComponent,
    Injector
  > {
    let component;
    switch (this.swapService.swapMode) {
      case SWAP_PROVIDER_TYPE.INSTANT_TRADE:
        component = SettingsItComponent;
        break;
      case SWAP_PROVIDER_TYPE.BRIDGE:
        component = SettingsBridgeComponent;
        break;
      default:
        component = SettingsCcrComponent;
    }
    return new PolymorpheusComponent(
      component as Type<SettingsItComponent | SettingsBridgeComponent | SettingsCcrComponent>
    );
  }
}

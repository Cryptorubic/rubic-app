import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { SettingsItComponent } from 'src/app/features/swaps/components/swaps-settings/settings-it/settings-it.component';
import { SettingsBridgeComponent } from 'src/app/features/swaps/components/swaps-settings/settings-bridge/settings-bridge.component';
import { SettingsCcrComponent } from 'src/app/features/swaps/components/swaps-settings/settings-ccr/settings-ccr.component';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';

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
      this.settingsComponent = this.getSettingsComponent();
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
    return new PolymorpheusComponent(component);
  }
}

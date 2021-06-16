import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SettingsItComponent } from 'src/app/features/swaps/components/settings-it/settings-it.component';
import { SettingsBridgeComponent } from 'src/app/features/swaps/components/settings-bridge/settings-bridge.component';

@Injectable()
export class SettingsService {
  public settings: {
    [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: FormGroup;
    [SWAP_PROVIDER_TYPE.BRIDGE]: FormGroup;
  };

  public get settingsForm(): FormGroup {
    return this.swapsService[this.swapsService.swapMode];
  }

  constructor(private readonly swapsService: SwapsService) {}

  public getSettingsComponent(): PolymorpheusComponent<any, any> {
    const component =
      this.swapsService.swapMode !== SWAP_PROVIDER_TYPE.INSTANT_TRADE
        ? SettingsItComponent
        : SettingsBridgeComponent;
    return new PolymorpheusComponent(component as any);
  }
}

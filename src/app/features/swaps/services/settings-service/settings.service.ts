import { Injectable, Injector } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SettingsItComponent } from 'src/app/features/swaps/components/settings-it/settings-it.component';
import { SettingsBridgeComponent } from 'src/app/features/swaps/components/settings-bridge/settings-bridge.component';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import BigNumber from 'bignumber.js';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';

export interface SettingsForm {
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: {
    slippageTolerance: number;
    deadline: number;
    disableMultihops: boolean;
    rubicOptimisation: boolean;
  };
  [SWAP_PROVIDER_TYPE.BRIDGE]: {};
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly defaultSlippage = 0.1;

  public settingsForm: FormGroup<SettingsForm>;

  constructor() {
    this.settingsForm = new FormGroup<SettingsForm>({
      [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: new FormGroup({
        slippageTolerance: new FormControl<number>(this.defaultSlippage),
        deadline: new FormControl<number>(20),
        disableMultihops: new FormControl<boolean>(false),
        rubicOptimisation: new FormControl<boolean>(false)
      }),
      [SWAP_PROVIDER_TYPE.BRIDGE]: new FormGroup({
        toAmount: new FormControl<BigNumber>()
      })
    });
  }
}

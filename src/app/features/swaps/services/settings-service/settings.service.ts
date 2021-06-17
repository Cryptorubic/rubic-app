import { Injectable } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SettingsItComponent } from 'src/app/features/swaps/components/settings-it/settings-it.component';
import { SettingsBridgeComponent } from 'src/app/features/swaps/components/settings-bridge/settings-bridge.component';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';

export interface SettingsForm {
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: {
    slippageTolerance: number;
    deadline: number;
    expertMode: boolean;
    disableMultihops: boolean;
    rubicOptimisation: boolean;
  };
  [SWAP_PROVIDER_TYPE.BRIDGE]: {};
}

@Injectable()
export class SettingsService {
  private readonly defaultSlippage = 0.1;

  public settingsForm: FormGroup<SettingsForm>;

  constructor(
    private readonly swapsService: SwapsService,
    private readonly swapFormService: SwapFormService
  ) {
    this.settingsForm = new FormGroup<SettingsForm>({
      [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: new FormGroup({
        slippageTolerance: new FormControl<number>(this.defaultSlippage),
        deadline: new FormControl<number>(20),
        expertMode: new FormControl<boolean>(false),
        disableMultihops: new FormControl<boolean>(false),
        rubicOptimisation: new FormControl<boolean>(false)
      }),
      [SWAP_PROVIDER_TYPE.BRIDGE]: new FormGroup({
        toAmount: new FormControl<BigNumber>()
      })
    });
  }

  public getSettingsComponent(): PolymorpheusComponent<any, any> {
    const control = this.swapFormService.commonTrade.controls.input.value;
    const component =
      control.fromBlockchain === control.toBlockchain
        ? SettingsItComponent
        : SettingsBridgeComponent;
    return new PolymorpheusComponent(component as any);
  }
}

import { Injectable } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import BigNumber from 'bignumber.js';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { StoreService } from 'src/app/core/services/store/store.service';

export interface ItSettingsForm {
  slippageTolerance: number;
  deadline: number;
  disableMultihops: boolean;
  rubicOptimisation: boolean;
  autoRefresh: boolean;
}

export interface SettingsForm {
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: ItSettingsForm;
  [SWAP_PROVIDER_TYPE.BRIDGE]: {};
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly defaultSettings: ItSettingsForm;

  public settingsForm: FormGroup<SettingsForm>;

  constructor(private readonly storeService: StoreService) {
    this.defaultSettings = {
      slippageTolerance: 0.15,
      deadline: 20,
      disableMultihops: false,
      rubicOptimisation: true,
      autoRefresh: true
    };
    this.createForm();
    this.setupData();
  }

  private setupData(): void {
    const localData = this.storeService.getItem('settings') as string;
    if (localData) {
      this.settingsForm.patchValue(
        { ...JSON.parse(localData) },
        {
          emitEvent: false
        }
      );
    }
    this.settingsForm.valueChanges.subscribe(form => {
      this.storeService.setItem('settings', JSON.stringify(form));
    });
  }

  private createForm(): void {
    this.settingsForm = new FormGroup<SettingsForm>({
      [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: new FormGroup({
        slippageTolerance: new FormControl<number>(this.defaultSettings.slippageTolerance),
        deadline: new FormControl<number>(this.defaultSettings.deadline),
        disableMultihops: new FormControl<boolean>(this.defaultSettings.disableMultihops),
        rubicOptimisation: new FormControl<boolean>(this.defaultSettings.rubicOptimisation),
        autoRefresh: new FormControl<boolean>(this.defaultSettings.autoRefresh)
      }),
      [SWAP_PROVIDER_TYPE.BRIDGE]: new FormGroup({
        toAmount: new FormControl<BigNumber>()
      })
    });
  }
}

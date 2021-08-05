import { Injectable } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { StoreService } from 'src/app/core/services/store/store.service';
import { AbstractControlOf } from '@ngneat/reactive-forms/lib/types';
import { Observable } from 'rxjs';

export interface ItSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  deadline: number;
  disableMultihops: boolean;
  rubicOptimisation: boolean;
  autoRefresh: boolean;
}

export interface BridgeSettingsForm {
  tronAddress: string;
}

export interface SettingsForm {
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: ItSettingsForm;
  [SWAP_PROVIDER_TYPE.BRIDGE]: BridgeSettingsForm;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly defaultSettings: ItSettingsForm;

  public settingsForm: FormGroup<SettingsForm>;

  public get instantTrade(): AbstractControlOf<ItSettingsForm> {
    return this.settingsForm.controls.INSTANT_TRADE;
  }

  public get instantTradeValue(): ItSettingsForm {
    return this.instantTrade.value;
  }

  public get instantTradeValueChanges(): Observable<ItSettingsForm> {
    return this.instantTrade.valueChanges;
  }

  public get bridge(): AbstractControlOf<BridgeSettingsForm> {
    return this.settingsForm.controls.BRIDGE;
  }

  public get bridgeValue(): BridgeSettingsForm {
    return this.bridge.value;
  }

  public get bridgeValueChanges(): Observable<BridgeSettingsForm> {
    return this.bridge.valueChanges;
  }

  constructor(private readonly storeService: StoreService) {
    this.defaultSettings = {
      autoSlippageTolerance: true,
      slippageTolerance: 1,
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
        autoSlippageTolerance: new FormControl<boolean>(this.defaultSettings.autoSlippageTolerance),
        slippageTolerance: new FormControl<number>(this.defaultSettings.slippageTolerance),
        deadline: new FormControl<number>(this.defaultSettings.deadline),
        disableMultihops: new FormControl<boolean>(this.defaultSettings.disableMultihops),
        rubicOptimisation: new FormControl<boolean>(this.defaultSettings.rubicOptimisation),
        autoRefresh: new FormControl<boolean>(this.defaultSettings.autoRefresh)
      }),
      [SWAP_PROVIDER_TYPE.BRIDGE]: new FormGroup({
        tronAddress: new FormControl<string>('')
      })
    });
  }
}

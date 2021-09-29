import { Injectable } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { StoreService } from 'src/app/core/services/store/store.service';
import { AbstractControlOf } from '@ngneat/reactive-forms/lib/types';
import { Observable } from 'rxjs';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';

export interface ItSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  deadline: number; // in minutes
  disableMultihops: boolean;
  rubicOptimisation: boolean;
  autoRefresh: boolean;
}

export interface BridgeSettingsForm {
  tronAddress: string;
}

export interface CcrSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  autoRefresh: boolean;
}

export interface SettingsForm {
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: ItSettingsForm;
  [SWAP_PROVIDER_TYPE.BRIDGE]: BridgeSettingsForm;
  [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: CcrSettingsForm;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly defaultItSettings: ItSettingsForm;

  private readonly defaultCcrSettings: ItSettingsForm;

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

  public get crossChainRouting(): AbstractControlOf<CcrSettingsForm> {
    return this.settingsForm.controls.CROSS_CHAIN_ROUTING;
  }

  public get crossChainRoutingValue(): CcrSettingsForm {
    return this.crossChainRouting.value;
  }

  public get crossChainRoutingValueChanges(): Observable<CcrSettingsForm> {
    return this.crossChainRouting.valueChanges;
  }

  constructor(private readonly storeService: StoreService, private iframeService: IframeService) {
    this.defaultItSettings = {
      autoSlippageTolerance: true,
      slippageTolerance: 2,
      deadline: 20,
      disableMultihops: false,
      rubicOptimisation: true,
      autoRefresh: true
    };
    this.defaultCcrSettings = {
      ...this.defaultItSettings,
      slippageTolerance: 2
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

    this.iframeService.widgetIntoViewport$.subscribe(widgetIntoViewport => {
      this.instantTrade.patchValue({
        autoRefresh: widgetIntoViewport
      });
    });
  }

  private createForm(): void {
    this.settingsForm = new FormGroup<SettingsForm>({
      [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: new FormGroup<ItSettingsForm>({
        autoSlippageTolerance: new FormControl<boolean>(
          this.defaultItSettings.autoSlippageTolerance
        ),
        slippageTolerance: new FormControl<number>(this.defaultItSettings.slippageTolerance),
        deadline: new FormControl<number>(this.defaultItSettings.deadline),
        disableMultihops: new FormControl<boolean>(this.defaultItSettings.disableMultihops),
        rubicOptimisation: new FormControl<boolean>(this.defaultItSettings.rubicOptimisation),
        autoRefresh: new FormControl<boolean>(this.defaultItSettings.autoRefresh)
      }),
      [SWAP_PROVIDER_TYPE.BRIDGE]: new FormGroup({
        tronAddress: new FormControl<string>('')
      }),
      [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: new FormGroup({
        autoSlippageTolerance: new FormControl<boolean>(
          this.defaultItSettings.autoSlippageTolerance
        ),
        slippageTolerance: new FormControl<number>(this.defaultCcrSettings.slippageTolerance),
        autoRefresh: new FormControl<boolean>(this.defaultCcrSettings.autoRefresh)
      })
    });
  }
}

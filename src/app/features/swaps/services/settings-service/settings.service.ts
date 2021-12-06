/* eslint-disable rxjs/finnish */
import { Injectable } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { StoreService } from 'src/app/core/services/store/store.service';
import { ControlsValue } from '@ngneat/reactive-forms/lib/types';
import { Observable } from 'rxjs';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { PromoCode } from 'src/app/features/swaps/models/PromoCode';
import { copyObject } from 'src/app/shared/utils/utils';
import { QueryParamsService } from '@core/services/query-params/query-params.service';

export interface ItSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  deadline: number; // in minutes
  disableMultihops: boolean;
  rubicOptimisation: boolean;
  autoRefresh: boolean;
}

export interface BridgeSettingsForm {}

export interface CcrSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  autoRefresh: boolean;
  promoCode: PromoCode | null;
}

export interface SettingsForm {
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: FormGroup<ItSettingsForm>;
  [SWAP_PROVIDER_TYPE.BRIDGE]: FormGroup<BridgeSettingsForm>;
  [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: FormGroup<CcrSettingsForm>;
}

export interface SlippageTolerance {
  instantTrades: number;
  crossChain: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly defaultSlippageTolerance: SlippageTolerance = {
    instantTrades: 2,
    crossChain: 5
  };

  public readonly defaultItSettings: ItSettingsForm;

  public readonly defaultCcrSettings: ItSettingsForm;

  public settingsForm: FormGroup<SettingsForm>;

  public get instantTrade(): FormGroup<ItSettingsForm> {
    return this.settingsForm.controls.INSTANT_TRADE;
  }

  public get instantTradeValue(): ItSettingsForm {
    return this.instantTrade.value;
  }

  public get instantTradeValueChanges(): Observable<ItSettingsForm> {
    return this.instantTrade.valueChanges;
  }

  public get bridge(): FormGroup<BridgeSettingsForm> {
    return this.settingsForm.controls.BRIDGE;
  }

  public get bridgeValue(): BridgeSettingsForm {
    return this.bridge.value;
  }

  public get bridgeValueChanges(): Observable<BridgeSettingsForm> {
    return this.bridge.valueChanges;
  }

  public get crossChainRouting(): FormGroup<CcrSettingsForm> {
    return this.settingsForm.controls.CROSS_CHAIN_ROUTING;
  }

  public get crossChainRoutingValue(): CcrSettingsForm {
    return this.crossChainRouting.value;
  }

  public get crossChainRoutingValueChanges(): Observable<CcrSettingsForm> {
    return this.crossChainRouting.valueChanges;
  }

  constructor(
    private readonly storeService: StoreService,
    private readonly iframeService: IframeService,
    private readonly queryParamsService: QueryParamsService
  ) {
    const { slippageIt, slippageCcr } = this.queryParamsService.slippage;
    this.defaultItSettings = {
      autoSlippageTolerance: true,
      slippageTolerance: slippageIt ?? this.defaultSlippageTolerance.instantTrades,
      deadline: 20,
      disableMultihops: false,
      rubicOptimisation: true,
      autoRefresh: true
    };
    this.defaultCcrSettings = {
      ...this.defaultItSettings,
      slippageTolerance: slippageCcr ?? this.defaultSlippageTolerance.crossChain
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
      this.storeService.setItem('settings', this.serializeForm(form));
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
      [SWAP_PROVIDER_TYPE.BRIDGE]: new FormGroup<BridgeSettingsForm>({}),
      [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: new FormGroup<CcrSettingsForm>({
        autoSlippageTolerance: new FormControl<boolean>(
          this.defaultItSettings.autoSlippageTolerance
        ),
        slippageTolerance: new FormControl<number>(this.defaultCcrSettings.slippageTolerance),
        autoRefresh: new FormControl<boolean>(this.defaultCcrSettings.autoRefresh),
        promoCode: new FormControl<PromoCode | null>(null)
      })
    });
  }

  /**
   * Deletes some form properties and serialize it to JSON string.
   * @param form form to serialize
   */
  private serializeForm(form: ControlsValue<SettingsForm>): string {
    const formClone = copyObject(form);
    delete formClone.CROSS_CHAIN_ROUTING.promoCode;

    return JSON.stringify(formClone);
  }
}

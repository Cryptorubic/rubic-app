/* eslint-disable rxjs/finnish */
import { Injectable } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { StoreService } from '@core/services/store/store.service';
import { ControlsValue } from '@ngneat/reactive-forms/lib/types';
import { Observable } from 'rxjs';
import { IframeService } from '@core/services/iframe/iframe.service';
import { PromoCode } from '@core/services/backend/promo-code-api/models/promo-code';
import { copyObject } from '@shared/utils/utils';
import { QuerySlippage } from '@core/services/query-params/models/query-params';
import { AuthService } from '@core/services/auth/auth.service';
import { filter, startWith, switchMap, tap } from 'rxjs/operators';
import { TargetNetworkAddressService } from '@features/swaps/shared/target-network-address/services/target-network-address.service';

export interface ItSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  deadline: number; // in minutes
  disableMultihops: boolean;
  rubicOptimisation: boolean;
  autoRefresh: boolean;
  showReceiverAddress: boolean;
}

export interface BridgeSettingsForm {}

export interface CcrSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  autoRefresh: boolean;
  promoCode: PromoCode | null;
  showReceiverAddress: boolean;
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
    crossChain: 4
  };

  public defaultItSettings: ItSettingsForm;

  public defaultCcrSettings: ItSettingsForm;

  public settingsForm: FormGroup<SettingsForm>;

  private ccrShowReceiverAddressUserValue: boolean;

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
    private readonly authService: AuthService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService
  ) {
    this.defaultItSettings = this.getDefaultITSettings();
    this.defaultCcrSettings = this.getDefaultCCRSettings();

    this.createForm();
    this.initSubscriptions();
  }

  public changeDefaultSlippage(slippage: QuerySlippage): void {
    this.defaultItSettings = this.getDefaultITSettings(slippage.slippageIt);
    this.defaultCcrSettings = this.getDefaultCCRSettings(slippage.slippageCcr);

    this.instantTrade.patchValue({ slippageTolerance: this.defaultItSettings.slippageTolerance });
    this.crossChainRouting.patchValue({
      slippageTolerance: this.defaultCcrSettings.slippageTolerance
    });
  }

  private getDefaultITSettings(slippageIt?: number): ItSettingsForm {
    return {
      autoSlippageTolerance: true,
      slippageTolerance:
        this.parseSlippage(slippageIt) ?? this.defaultSlippageTolerance.instantTrades,
      deadline: 20,
      disableMultihops: false,
      rubicOptimisation: true,
      autoRefresh: Boolean(this.authService?.user?.address),
      showReceiverAddress: false
    };
  }

  private getDefaultCCRSettings(slippageCcr?: number): ItSettingsForm {
    return {
      autoSlippageTolerance: true,
      slippageTolerance:
        this.parseSlippage(slippageCcr) ?? this.defaultSlippageTolerance.crossChain,
      deadline: 20,
      disableMultihops: false,
      rubicOptimisation: true,
      autoRefresh: Boolean(this.authService?.user?.address),
      showReceiverAddress: false
    };
  }

  private parseSlippage(slippage: number): number {
    if (!slippage || isNaN(slippage)) {
      return null;
    }
    return Math.min(Math.max(slippage, 0.1), 50);
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
        autoRefresh: new FormControl<boolean>(this.defaultItSettings.autoRefresh),
        showReceiverAddress: new FormControl<boolean>(this.defaultItSettings.showReceiverAddress)
      }),
      [SWAP_PROVIDER_TYPE.BRIDGE]: new FormGroup<BridgeSettingsForm>({}),
      [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: new FormGroup<CcrSettingsForm>({
        autoSlippageTolerance: new FormControl<boolean>(
          this.defaultItSettings.autoSlippageTolerance
        ),
        slippageTolerance: new FormControl<number>(this.defaultCcrSettings.slippageTolerance),
        autoRefresh: new FormControl<boolean>(this.defaultCcrSettings.autoRefresh),
        promoCode: new FormControl<PromoCode | null>(null),
        showReceiverAddress: new FormControl<boolean>(this.defaultCcrSettings.showReceiverAddress)
      })
    });
  }

  private initSubscriptions(): void {
    this.authService.currentUser$
      .pipe(
        filter(user => Boolean(user?.address)),
        tap(() => {
          const localData = this.storeService.getItem('settings') as string;
          if (localData && !this.iframeService.isIframe) {
            this.settingsForm.patchValue({ ...JSON.parse(localData) });
          }
        }),
        switchMap(() => {
          return this.settingsForm.valueChanges.pipe(startWith(this.settingsForm.value));
        })
      )
      .subscribe(form => {
        this.storeService.setItem('settings', this.serializeForm(form));
      });

    this.iframeService.widgetIntoViewport$.subscribe(widgetIntoViewport => {
      this.instantTrade.patchValue({
        autoRefresh: widgetIntoViewport
      });
      this.crossChainRouting.patchValue({
        autoRefresh: widgetIntoViewport
      });
    });

    this.targetNetworkAddressService.isAddressRequired$.subscribe(isAddressRequired => {
      if (isAddressRequired) {
        this.ccrShowReceiverAddressUserValue = this.crossChainRoutingValue.showReceiverAddress;

        this.crossChainRouting.patchValue({
          showReceiverAddress: true
        });
      } else {
        if (this.ccrShowReceiverAddressUserValue !== undefined) {
          this.crossChainRouting.patchValue({
            showReceiverAddress: this.ccrShowReceiverAddressUserValue
          });
        }
      }
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

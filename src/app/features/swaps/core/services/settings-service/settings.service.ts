/* eslint-disable rxjs/finnish */
import { Inject, Injectable } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { StoreService } from '@core/services/store/store.service';
import { ControlsValue } from '@ngneat/reactive-forms/lib/types';
import { firstValueFrom, Observable } from 'rxjs';
import { IframeService } from '@core/services/iframe/iframe.service';
import { copyObject } from '@shared/utils/utils';
import { QuerySlippage } from '@core/services/query-params/models/query-params';
import { AuthService } from '@core/services/auth/auth.service';
import { filter, startWith, switchMap, tap } from 'rxjs/operators';
import { TargetNetworkAddressService } from '@features/swaps/shared/components/target-network-address/services/target-network-address.service';
import { SettingsWarningModalComponent } from '@app/features/swaps/shared/settings-warning-modal/settings-warning-modal.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { PriceImpactService } from '@app/core/services/price-impact/price-impact.service';
import { CrossChainTrade, OnChainTrade } from 'rubic-sdk';
import { TuiDialogService } from '@taiga-ui/core';

export interface ItSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  deadline: number; // in minutes
  disableMultihops: boolean;
  autoRefresh: boolean;
  showReceiverAddress: boolean;
}

export interface CcrSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  showReceiverAddress: boolean;
}

export interface SettingsForm {
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: FormGroup<ItSettingsForm>;
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

  public defaultCcrSettings: CcrSettingsForm;

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
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService
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
      autoRefresh: Boolean(this.authService?.user?.address),
      showReceiverAddress: false
    };
  }

  private getDefaultCCRSettings(slippageCcr?: number): CcrSettingsForm {
    return {
      autoSlippageTolerance: true,
      slippageTolerance:
        this.parseSlippage(slippageCcr) ?? this.defaultSlippageTolerance.crossChain,
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
        autoRefresh: new FormControl<boolean>(this.defaultItSettings.autoRefresh),
        showReceiverAddress: new FormControl<boolean>(this.defaultItSettings.showReceiverAddress)
      }),
      [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: new FormGroup<CcrSettingsForm>({
        autoSlippageTolerance: new FormControl<boolean>(
          this.defaultItSettings.autoSlippageTolerance
        ),
        slippageTolerance: new FormControl<number>(this.defaultCcrSettings.slippageTolerance),
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
      .subscribe(form => this.saveSettingsToLocalStorage(form));

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
    return JSON.stringify(formClone);
  }

  public async checkSlippageAndPriceImpact(
    swapProviderType: SWAP_PROVIDER_TYPE,
    trade: CrossChainTrade | OnChainTrade
  ): Promise<boolean> {
    const slippage =
      swapProviderType === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING
        ? this.crossChainRoutingValue.slippageTolerance
        : this.instantTradeValue.slippageTolerance;

    if (!trade.from.price.toNumber() || !trade.to.price.toNumber()) {
      await trade.from.getAndUpdateTokenPrice();
      await trade.to.getAndUpdateTokenPrice();
    }

    const priceImpact = PriceImpactService.calculatePriceImpact(
      trade.from.price.toNumber(),
      trade.to.price.toNumber(),
      trade.from.tokenAmount,
      trade.to.tokenAmount
    );

    const settingsChecks = {
      highSlippage: slippage > 5 && slippage,
      highPriceImpact: priceImpact > 30 && priceImpact
    };

    if (settingsChecks.highSlippage || settingsChecks.highPriceImpact) {
      return firstValueFrom(
        this.dialogService.open<boolean>(new PolymorpheusComponent(SettingsWarningModalComponent), {
          data: settingsChecks,
          size: 'm'
        })
      );
    }

    return true;
  }

  public saveSettingsToLocalStorage(
    form: ControlsValue<SettingsForm> = this.settingsForm.value
  ): void {
    this.storeService.setItem('settings', this.serializeForm(form));
  }
}

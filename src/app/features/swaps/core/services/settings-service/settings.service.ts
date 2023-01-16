/* eslint-disable rxjs/finnish */
import { Inject, Injectable } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { StoreService } from '@core/services/store/store.service';
import { firstValueFrom, Observable } from 'rxjs';
import { IframeService } from '@core/services/iframe/iframe.service';
import { copyObject } from '@shared/utils/utils';
import { AuthService } from '@core/services/auth/auth.service';
import { filter, first, switchMap, tap } from 'rxjs/operators';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { SettingsWarningModalComponent } from '@app/features/swaps/shared/components/settings-warning-modal/settings-warning-modal.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { PriceImpactService } from '@app/core/services/price-impact/price-impact.service';
import { CrossChainTrade, OnChainTrade } from 'rubic-sdk';
import { TuiDialogService } from '@taiga-ui/core';
import {
  CcrSettingsForm,
  CcrSettingsFormControls,
  ItSettingsForm,
  ItSettingsFormControls,
  SettingsForm,
  SettingsFormControls
} from '@features/swaps/core/services/settings-service/models/settings-form-controls';
import { FormControl, FormGroup } from '@angular/forms';
import { QueryParamsService } from '@core/services/query-params/query-params.service';

@Injectable()
export class SettingsService {
  private readonly defaultSlippageTolerance = {
    instantTrades: 2,
    crossChain: 4
  };

  public defaultItSettings = this.getDefaultITSettings();

  public defaultCcrSettings = this.getDefaultCCRSettings();

  public settingsForm = this.createForm();

  private ccrShowReceiverAddressUserValue: boolean;

  public get instantTrade(): FormGroup<ItSettingsFormControls> {
    return this.settingsForm.controls[SWAP_PROVIDER_TYPE.INSTANT_TRADE];
  }

  public get instantTradeValue(): ItSettingsForm {
    return this.settingsForm.controls[SWAP_PROVIDER_TYPE.INSTANT_TRADE].getRawValue();
  }

  public get instantTradeValueChanges(): Observable<ItSettingsForm> {
    return this.settingsForm.get(SWAP_PROVIDER_TYPE.INSTANT_TRADE).valueChanges;
  }

  public get crossChainRouting(): FormGroup<CcrSettingsFormControls> {
    return this.settingsForm.controls[SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING];
  }

  public get crossChainRoutingValue(): CcrSettingsForm {
    return this.settingsForm.controls[SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING].getRawValue();
  }

  public get crossChainRoutingValueChanges(): Observable<CcrSettingsForm> {
    return this.settingsForm.get(SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING).valueChanges;
  }

  constructor(
    private readonly storeService: StoreService,
    private readonly iframeService: IframeService,
    private readonly authService: AuthService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly queryParamsService: QueryParamsService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService
  ) {
    this.initSubscriptions();
    this.subscribeOnQueryParams();
  }

  public subscribeOnQueryParams(): void {
    this.queryParamsService.queryParams$.pipe(first(Boolean)).subscribe(queryParams => {
      if (queryParams.iframe) {
        const slippage = {
          slippageIt: queryParams.slippageIt ? parseFloat(queryParams.slippageIt) : null,
          slippageCcr: queryParams.slippageCcr ? parseFloat(queryParams.slippageCcr) : null
        };

        this.defaultItSettings = this.getDefaultITSettings(slippage.slippageIt);
        this.instantTrade.patchValue(this.defaultItSettings);

        this.defaultCcrSettings = this.getDefaultCCRSettings(slippage.slippageCcr);
        this.crossChainRouting.patchValue(this.defaultCcrSettings);
      }
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

  private createForm(): FormGroup<SettingsFormControls> {
    return new FormGroup<SettingsFormControls>({
      [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: new FormGroup<ItSettingsFormControls>({
        autoSlippageTolerance: new FormControl<boolean>(
          this.defaultItSettings.autoSlippageTolerance
        ),
        slippageTolerance: new FormControl<number>(this.defaultItSettings.slippageTolerance),
        deadline: new FormControl<number>(this.defaultItSettings.deadline),
        disableMultihops: new FormControl<boolean>(this.defaultItSettings.disableMultihops),
        autoRefresh: new FormControl<boolean>(this.defaultItSettings.autoRefresh),
        showReceiverAddress: new FormControl<boolean>(this.defaultItSettings.showReceiverAddress)
      }),
      [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: new FormGroup<CcrSettingsFormControls>({
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
        switchMap(() => this.settingsForm.valueChanges)
      )
      .subscribe(() => this.saveSettingsToLocalStorage());

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
  private serializeForm(form: SettingsForm): string {
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

  public saveSettingsToLocalStorage(form: SettingsForm = this.settingsForm.getRawValue()): void {
    this.storeService.setItem('settings', this.serializeForm(form));
  }
}

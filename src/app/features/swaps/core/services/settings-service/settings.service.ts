/* eslint-disable rxjs/finnish */
import { Injectable } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { StoreService } from '@core/services/store/store.service';
import { firstValueFrom, Observable } from 'rxjs';
import { IframeService } from '@core/services/iframe/iframe.service';
import { AuthService } from '@core/services/auth/auth.service';
import { filter, first, switchMap, tap } from 'rxjs/operators';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { SettingsWarningModalComponent } from '@app/features/swaps/shared/components/settings-warning-modal/settings-warning-modal.component';
import { CrossChainTrade, OnChainTrade } from 'rubic-sdk';
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
import { ModalService } from '@app/core/modals/services/modal.service';

@Injectable()
export class SettingsService {
  private readonly defaultSlippageTolerance = {
    instantTrades: 1,
    crossChain: 2
  };

  public defaultItSettings: ItSettingsForm;

  public defaultCcrSettings: CcrSettingsForm;

  public settingsForm: FormGroup<SettingsFormControls>;

  private ccrShowReceiverAddressUserValue: boolean;

  public get instantTrade(): FormGroup<ItSettingsFormControls> {
    return this.settingsForm.controls[SWAP_PROVIDER_TYPE.INSTANT_TRADE];
  }

  public get instantTradeValue(): ItSettingsForm {
    return this.settingsForm.get(SWAP_PROVIDER_TYPE.INSTANT_TRADE).value;
  }

  public get instantTradeValueChanges(): Observable<ItSettingsForm> {
    return this.settingsForm.get(SWAP_PROVIDER_TYPE.INSTANT_TRADE).valueChanges;
  }

  public get crossChainRouting(): FormGroup<CcrSettingsFormControls> {
    return this.settingsForm.controls[SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING];
  }

  public get crossChainRoutingValue(): CcrSettingsForm {
    return this.settingsForm.get(SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING).value;
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
    private readonly dialogService: ModalService
  ) {
    this.defaultItSettings = this.getDefaultITSettings();
    this.defaultCcrSettings = this.getDefaultCCRSettings();

    this.createForm();
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
        this.defaultCcrSettings = this.getDefaultCCRSettings(slippage.slippageCcr);

        this.instantTrade.patchValue({
          slippageTolerance: this.defaultItSettings.slippageTolerance
        });
        this.crossChainRouting.patchValue({
          slippageTolerance: this.defaultCcrSettings.slippageTolerance
        });
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

  private createForm(): void {
    this.settingsForm = new FormGroup<SettingsFormControls>({
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
          if (!this.iframeService.isIframe) {
            const itData = this.storeService.getItem('RUBIC_SETTINGS_INSTANT_TRADE');
            if (itData) {
              this.settingsForm.patchValue({ [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: itData });
            }

            const ccrData = this.storeService.getItem('RUBIC_SETTINGS_CROSS_CHAIN_ROUTING');
            if (ccrData) {
              this.settingsForm.patchValue({ [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: ccrData });
            }
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

    const priceImpact = trade.getTradeInfo().priceImpact;

    const settingsChecks = {
      highSlippage: slippage > 5 && slippage,
      highPriceImpact: priceImpact > 30 && priceImpact
    };

    if (settingsChecks.highSlippage || settingsChecks.highPriceImpact) {
      return firstValueFrom(
        this.dialogService.showDialog<SettingsWarningModalComponent, boolean>(
          SettingsWarningModalComponent,
          {
            data: settingsChecks,
            size: 'l',
            fitContent: true
          }
        )
      );
    }

    return true;
  }

  public saveSettingsToLocalStorage(form: SettingsForm = this.settingsForm.getRawValue()): void {
    this.storeService.setItem(
      'RUBIC_SETTINGS_INSTANT_TRADE',
      JSON.parse(JSON.stringify(form[SWAP_PROVIDER_TYPE.INSTANT_TRADE]))
    );
    this.storeService.setItem(
      'RUBIC_SETTINGS_CROSS_CHAIN_ROUTING',
      JSON.parse(JSON.stringify(form[SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]))
    );
  }
}

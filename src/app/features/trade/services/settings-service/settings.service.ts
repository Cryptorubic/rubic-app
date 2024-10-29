/* eslint-disable rxjs/finnish */
import { Injectable } from '@angular/core';
import { StoreService } from '@core/services/store/store.service';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { filter, switchMap, tap } from 'rxjs/operators';
import { BLOCKCHAIN_NAME, CrossChainTrade, OnChainTrade } from 'rubic-sdk';
import { FormControl, FormGroup } from '@angular/forms';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { ModalService } from '@app/core/modals/services/modal.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import {
  CcrSettingsForm,
  CcrSettingsFormControls,
  ItSettingsForm,
  ItSettingsFormControls,
  SettingsForm,
  SettingsFormControls
} from '@features/trade/services/settings-service/models/settings-form-controls';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { SettingsWarningModalComponent } from '@features/trade/components/settings-warning-modal/settings-warning-modal.component';

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
    private readonly authService: AuthService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly queryParamsService: QueryParamsService,
    private readonly dialogService: ModalService
  ) {
    this.defaultItSettings = this.getDefaultITSettings(this.queryParamsService.slippageIt);
    this.defaultCcrSettings = this.getDefaultCCRSettings(this.queryParamsService.slippageCcr);

    this.createForm();
    this.initSubscriptions();
  }

  private getDefaultITSettings(slippageIt?: number): ItSettingsForm {
    return {
      autoSlippageTolerance: true,
      slippageTolerance:
        this.parseSlippage(slippageIt) ?? this.defaultSlippageTolerance.instantTrades,
      deadline: 20,
      disableMultihops: false,
      autoRefresh: Boolean(this.authService?.user?.address),
      showReceiverAddress: false,
      useMevBotProtection: false
    };
  }

  private getDefaultCCRSettings(slippageCcr?: number): CcrSettingsForm {
    return {
      autoSlippageTolerance: true,
      slippageTolerance:
        this.parseSlippage(slippageCcr) ?? this.defaultSlippageTolerance.crossChain,
      showReceiverAddress: false,
      useMevBotProtection: false
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
        showReceiverAddress: new FormControl<boolean>(this.defaultItSettings.showReceiverAddress),
        useMevBotProtection: new FormControl<boolean>(this.defaultItSettings.useMevBotProtection)
      }),
      [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: new FormGroup<CcrSettingsFormControls>({
        autoSlippageTolerance: new FormControl<boolean>(
          this.defaultItSettings.autoSlippageTolerance
        ),
        slippageTolerance: new FormControl<number>(this.defaultCcrSettings.slippageTolerance),
        showReceiverAddress: new FormControl<boolean>(this.defaultCcrSettings.showReceiverAddress),
        useMevBotProtection: new FormControl<boolean>(this.defaultCcrSettings.useMevBotProtection)
      })
    });
  }

  private initSubscriptions(): void {
    this.authService.currentUser$
      .pipe(
        filter(user => Boolean(user?.address)),
        tap(() => {
          const itData = this.storeService.getItem('RUBIC_OPTIONS_INSTANT_TRADE');
          if (itData) {
            this.settingsForm.patchValue({ [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: itData });
          }

          const ccrData = this.storeService.getItem('RUBIC_OPTIONS_CROSS_CHAIN_ROUTING');
          if (ccrData) {
            this.settingsForm.patchValue({ [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: ccrData });
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
    const tradeSlippage = trade.getTradeInfo().slippage;
    const settingsChecks = {
      highSlippage: slippage >= 10 ? slippage : false,
      highPriceImpact: this.isHighPriceImpact(trade) ? priceImpact : false
    };

    if ((settingsChecks.highSlippage || settingsChecks.highPriceImpact) && tradeSlippage > 0) {
      return firstValueFrom(
        this.dialogService.showDialog<SettingsWarningModalComponent, boolean>(
          SettingsWarningModalComponent,
          {
            data: settingsChecks,
            size: 's',
            fitContent: true
          }
        )
      );
    }

    return true;
  }

  private isHighPriceImpact(trade: CrossChainTrade<unknown> | OnChainTrade): boolean {
    const priceImpact = trade.getTradeInfo().priceImpact;
    if (
      trade.from.blockchain === BLOCKCHAIN_NAME.ZETACHAIN ||
      trade.to.blockchain === BLOCKCHAIN_NAME.ZETACHAIN
    ) {
      return priceImpact >= 15;
    }
    if (
      trade.from.blockchain === BLOCKCHAIN_NAME.SOLANA ||
      trade.to.blockchain === BLOCKCHAIN_NAME.SOLANA
    ) {
      return priceImpact >= 10;
    }
    return priceImpact >= 5;
  }

  public saveSettingsToLocalStorage(form: SettingsForm = this.settingsForm.getRawValue()): void {
    this.storeService.setItem(
      'RUBIC_OPTIONS_INSTANT_TRADE',
      JSON.parse(JSON.stringify(form[SWAP_PROVIDER_TYPE.INSTANT_TRADE]))
    );
    this.storeService.setItem(
      'RUBIC_OPTIONS_CROSS_CHAIN_ROUTING',
      JSON.parse(JSON.stringify(form[SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]))
    );
  }
}

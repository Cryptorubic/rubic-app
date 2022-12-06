import { ChangeDetectionStrategy, Component, OnInit, Self } from '@angular/core';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { filter, startWith, takeUntil } from 'rxjs/operators';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';
import { combineLatest } from 'rxjs';
import { TargetNetworkAddressService } from '@features/swaps/shared/components/target-network-address/services/target-network-address.service';
import { FormControl, FormGroup } from '@angular/forms';
import { IframeSettingsFormControls } from '@features/swaps/features/swaps-form/components/swaps-settings/iframe-settings/models/iframe-settings-form-controls';
import {
  CcrSettingsForm,
  CcrSettingsFormControls,
  ItSettingsFormControls
} from '@features/swaps/core/services/settings-service/models/settings-form-controls';

@Component({
  selector: 'app-iframe-settings',
  templateUrl: './iframe-settings.component.html',
  styleUrls: ['./iframe-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class IframeSettingsComponent implements OnInit {
  public iframeSettingsForm: FormGroup<IframeSettingsFormControls>;

  public slippageTolerance: number;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly swapService: SwapsService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.setForm();
  }

  private setForm(): void {
    const itSettingsForm = this.settingsService.instantTradeValue;
    const ccrSettingsForm = this.settingsService.crossChainRoutingValue;

    const settingsForm =
      this.swapService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE
        ? itSettingsForm
        : ccrSettingsForm;

    this.iframeSettingsForm = new FormGroup<IframeSettingsFormControls>({
      autoSlippageTolerance: new FormControl<boolean>(settingsForm.autoSlippageTolerance),
      slippageTolerance: new FormControl<number>(settingsForm.slippageTolerance),
      disableMultihops: new FormControl<boolean>(itSettingsForm.disableMultihops),
      autoRefresh: new FormControl<boolean>(itSettingsForm.autoRefresh),
      showReceiverAddress: new FormControl<boolean>(settingsForm.showReceiverAddress)
    });
    this.slippageTolerance = this.iframeSettingsForm.value.slippageTolerance;

    this.setFormChanges();

    this.targetNetworkAddressService.isAddressRequired$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAddressRequired => {
        if (isAddressRequired) {
          this.iframeSettingsForm.controls.showReceiverAddress.disable({ emitEvent: false });
        } else {
          this.iframeSettingsForm.controls.showReceiverAddress.enable({ emitEvent: false });
        }
      });
  }

  private setFormChanges(): void {
    const itSettingsForm = this.settingsService.instantTrade;
    const ccrSettingsForm = this.settingsService.crossChainRouting;

    this.iframeSettingsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateSettingsForm(itSettingsForm, SWAP_PROVIDER_TYPE.INSTANT_TRADE);
      this.updateSettingsForm(ccrSettingsForm, SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING);
    });

    combineLatest([
      itSettingsForm.valueChanges,
      this.swapService.swapMode$.pipe(
        filter(swapMode => swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE)
      )
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([settings]) => {
        if (this.swapService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE) {
          this.iframeSettingsForm.patchValue(settings, { emitEvent: false });
          this.slippageTolerance = settings.slippageTolerance;
          this.updateSettingsForm(ccrSettingsForm, SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING);
        }
      });

    combineLatest([
      ccrSettingsForm.valueChanges.pipe(startWith(ccrSettingsForm.value)),
      this.swapService.swapMode$
    ])
      .pipe(
        filter(
          ([_, swapProviderType]) => swapProviderType === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(([settings]: [CcrSettingsForm, SWAP_PROVIDER_TYPE]) => {
        this.iframeSettingsForm.patchValue(settings, { emitEvent: false });
        this.slippageTolerance = settings.slippageTolerance;
        this.updateSettingsForm(itSettingsForm, SWAP_PROVIDER_TYPE.INSTANT_TRADE);
      });
  }

  private updateSettingsForm(
    settingsForm: FormGroup<ItSettingsFormControls> | FormGroup<CcrSettingsFormControls>,
    swapMode: SWAP_PROVIDER_TYPE
  ): void {
    const settings = this.iframeSettingsForm.value;
    const slippageTolerance = settings.autoSlippageTolerance
      ? this.getDefaultSlippageBySwapMode(swapMode)
      : settings.slippageTolerance;

    settingsForm.patchValue({
      ...settings,
      slippageTolerance
    });
  }

  public toggleAutoSlippageTolerance(): void {
    if (!this.iframeSettingsForm.value.autoSlippageTolerance) {
      this.slippageTolerance = this.getDefaultSlippageBySwapMode();
      this.iframeSettingsForm.patchValue({
        autoSlippageTolerance: true,
        slippageTolerance: this.slippageTolerance
      });
    } else {
      this.iframeSettingsForm.patchValue({
        autoSlippageTolerance: false
      });
    }
  }

  public onSlippageToleranceChange(slippageTolerance: number): void {
    this.slippageTolerance = slippageTolerance;
    this.iframeSettingsForm.patchValue({
      autoSlippageTolerance: false,
      slippageTolerance: this.slippageTolerance
    });
  }

  public getDefaultSlippageBySwapMode(
    swapMode: SWAP_PROVIDER_TYPE = this.swapService.swapMode
  ): number {
    switch (swapMode) {
      case SWAP_PROVIDER_TYPE.INSTANT_TRADE: {
        return this.settingsService.defaultItSettings.slippageTolerance;
      }
      case SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING: {
        return this.settingsService.defaultCcrSettings.slippageTolerance;
      }
      default: {
        return 1;
      }
    }
  }
}

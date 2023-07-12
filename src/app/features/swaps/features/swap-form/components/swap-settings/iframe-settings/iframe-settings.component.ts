import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  Self
} from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';

@Component({
  selector: 'app-iframe-settings',
  templateUrl: './iframe-settings.component.html',
  styleUrls: ['./iframe-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService, TargetNetworkAddressService]
})
export class IframeSettingsComponent {
  private readonly settingsService = this.context.content.i.get(SettingsService);

  private readonly swapService = this.context.content.i.get(SwapTypeService);

  private readonly cdr = this.context.content.i.get(ChangeDetectorRef);

  private get form(): FormGroup {
    return this.swapService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE
      ? this.onChainForm
      : this.crossChainForm;
  }

  public readonly onChainForm = this.settingsService.instantTrade;

  public readonly crossChainForm = this.settingsService.crossChainRouting;

  public readonly isCrossChain =
    this.swapService.swapMode === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;

  public autoSlippageTolerance = this.form.controls.autoSlippageTolerance.value;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) readonly context: { content: { i: Injector } },
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService
  ) {
    this.form.controls.slippageTolerance.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.form.getRawValue().autoSlippageTolerance) {
          this.form.patchValue({
            autoSlippageTolerance: false
          });
        }
      });

    this.disablingToggleReceiverAddress();
  }

  public toggleAutoSlippageTolerance(): void {
    const autoSlippage = this.form.getRawValue().autoSlippageTolerance;

    if (autoSlippage) {
      this.form.patchValue({
        autoSlippageTolerance: false
      });
    } else {
      this.form.patchValue({
        slippageTolerance: this.isCrossChain
          ? this.settingsService.defaultCcrSettings.slippageTolerance
          : this.settingsService.defaultItSettings.slippageTolerance,
        autoSlippageTolerance: true
      });
    }
    this.cdr.detectChanges();
  }

  private disablingToggleReceiverAddress(): void {
    this.targetNetworkAddressService.isAddressRequired$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAddressRequired => {
        if (isAddressRequired) {
          this.crossChainForm.controls.showReceiverAddress.disable({ emitEvent: false });
        } else {
          this.crossChainForm.controls.showReceiverAddress.enable({ emitEvent: false });
        }
      });
  }
}

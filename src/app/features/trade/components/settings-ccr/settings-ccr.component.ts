import { Component, ChangeDetectionStrategy, Self } from '@angular/core';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { startWith } from 'rxjs/operators';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';

@Component({
  selector: 'app-settings-ccr',
  templateUrl: './settings-ccr.component.html',
  styleUrls: ['./settings-ccr.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SettingsCcrComponent {
  private get defaultSlippageTolerance(): number {
    return this.settingsService.defaultCcrSettings.slippageTolerance;
  }

  public crossChainRoutingForm = this.settingsService.crossChainRouting;

  public readonly formValue$ = this.crossChainRoutingForm.valueChanges.pipe(
    startWith(this.crossChainRoutingForm.value)
  );

  constructor(
    private readonly settingsService: SettingsService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public toggleAutoSlippageTolerance(): void {
    if (!this.crossChainRoutingForm.value.autoSlippageTolerance) {
      this.crossChainRoutingForm.patchValue({
        autoSlippageTolerance: true,
        slippageTolerance: this.defaultSlippageTolerance
      });
    } else {
      this.crossChainRoutingForm.patchValue({
        autoSlippageTolerance: false
      });
    }
  }

  public onSlippageToleranceChange(slippageTolerance: number): void {
    const currentSlippage = this.crossChainRoutingForm.controls.slippageTolerance.value;
    const newSlippage = Number(slippageTolerance) || this.defaultSlippageTolerance;
    if (currentSlippage !== newSlippage) {
      this.crossChainRoutingForm.patchValue({
        autoSlippageTolerance: false,
        slippageTolerance: newSlippage
      });
    }
  }
}

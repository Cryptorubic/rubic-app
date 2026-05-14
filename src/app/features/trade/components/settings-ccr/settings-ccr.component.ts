import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { map, startWith } from 'rxjs/operators';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { FormsTogglerService } from '../../services/forms-toggler/forms-toggler.service';
import { MAIN_FORM_TYPE } from '../../services/forms-toggler/models';

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

  public readonly showReceiverAddressRadio$ = this.formsTogglerService.selectedForm$.pipe(
    map(form => form === MAIN_FORM_TYPE.SWAP_FORM)
  );

  constructor(
    private readonly settingsService: SettingsService,
    private readonly formsTogglerService: FormsTogglerService
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

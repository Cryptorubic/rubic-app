import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map, startWith } from 'rxjs/operators';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { FormsTogglerService } from '../../services/forms-toggler/forms-toggler.service';
import { MAIN_FORM_TYPE } from '../../services/forms-toggler/models';

@Component({
  selector: 'app-settings-it',
  templateUrl: './settings-it.component.html',
  styleUrls: ['./settings-it.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsItComponent {
  private get defaultSlippageTolerance(): number {
    return this.settingsService.defaultItSettings.slippageTolerance;
  }

  public instantTradeForm = this.settingsService.instantTrade;

  public readonly formValue$ = this.instantTradeForm.valueChanges.pipe(
    startWith(this.instantTradeForm.value)
  );

  public readonly showReceiverAddressRadio$ = this.formsTogglerService.selectedForm$.pipe(
    map(form => form === MAIN_FORM_TYPE.SWAP_FORM)
  );

  constructor(
    private readonly settingsService: SettingsService,
    private readonly formsTogglerService: FormsTogglerService
  ) {}

  public toggleAutoSlippageTolerance(): void {
    if (!this.instantTradeForm.value.autoSlippageTolerance) {
      this.instantTradeForm.patchValue({
        autoSlippageTolerance: true,
        slippageTolerance: this.defaultSlippageTolerance
      });
    } else {
      this.instantTradeForm.patchValue({
        autoSlippageTolerance: false
      });
    }
  }

  public onSlippageToleranceChange(slippageString: number): void {
    const currentSlippage = this.instantTradeForm.controls.slippageTolerance.value;
    const newSlippage = Number(slippageString) || this.defaultSlippageTolerance;
    if (currentSlippage !== newSlippage) {
      this.instantTradeForm.patchValue({
        autoSlippageTolerance: false,
        slippageTolerance: newSlippage
      });
    }
  }
}

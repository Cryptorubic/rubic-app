import { ChangeDetectionStrategy, Component } from '@angular/core';
import { startWith } from 'rxjs/operators';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { FormsTogglerService } from '../../services/forms-toggler/forms-toggler.service';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';

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

  constructor(
    private readonly settingsService: SettingsService,
    private readonly formsTogglerService: FormsTogglerService,
    private readonly queryParamsService: QueryParamsService
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

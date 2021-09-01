import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import {
  CcrSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';

@Component({
  selector: 'app-settings-ccr',
  templateUrl: './settings-ccr.component.html',
  styleUrls: ['./settings-ccr.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsCcrComponent implements OnInit {
  private defaultSlippageTolerance = 1;

  public crossChainRoutingForm: FormGroup<CcrSettingsForm>;

  public slippageTolerance: number;

  constructor(private readonly settingsService: SettingsService) {}

  public ngOnInit(): void {
    this.setForm();
  }

  private setForm(): void {
    const formValue = this.settingsService.crossChainRoutingValue;
    this.crossChainRoutingForm = new FormGroup<CcrSettingsForm>({
      autoSlippageTolerance: new FormControl<boolean>(formValue.autoSlippageTolerance),
      slippageTolerance: new FormControl<number>(formValue.slippageTolerance),
      autoRefresh: new FormControl<boolean>(formValue.autoRefresh)
    });
    this.slippageTolerance = formValue.slippageTolerance;
    this.setFormChanges();
  }

  private setFormChanges(): void {
    this.crossChainRoutingForm.valueChanges.subscribe(settings => {
      this.settingsService.crossChainRouting.patchValue({ ...settings });
    });
    this.settingsService.crossChainRoutingValueChanges.subscribe(settings => {
      this.crossChainRoutingForm.patchValue({ ...settings }, { emitEvent: false });
      this.slippageTolerance = settings.slippageTolerance;
    });
  }

  public toggleAutoSlippageTolerance(): void {
    if (!this.crossChainRoutingForm.value.autoSlippageTolerance) {
      this.slippageTolerance = this.defaultSlippageTolerance;
      this.crossChainRoutingForm.patchValue({
        autoSlippageTolerance: true,
        slippageTolerance: this.slippageTolerance
      });
    } else {
      this.crossChainRoutingForm.patchValue({
        autoSlippageTolerance: false
      });
    }
  }

  public onSlippageToleranceChange(slippageTolerance: number): void {
    this.slippageTolerance = slippageTolerance;
    this.crossChainRoutingForm.patchValue({
      autoSlippageTolerance: false,
      slippageTolerance: this.slippageTolerance
    });
  }
}

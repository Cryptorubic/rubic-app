import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  ItSettingsForm,
  SettingsService
} from '@features/swaps/core/services/settings-service/settings.service';
import { AbstractControl, FormControl, FormGroup } from '@ngneat/reactive-forms';
import { TUI_NUMBER_FORMAT } from '@taiga-ui/core';

@Component({
  selector: 'app-settings-it',
  templateUrl: './settings-it.component.html',
  styleUrls: ['./settings-it.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TUI_NUMBER_FORMAT,
      useValue: { decimalSeparator: '.', thousandSeparator: ',' }
    }
  ]
})
export class SettingsItComponent implements OnInit {
  private readonly defaultSlippageTolerance: number;

  public instantTradeForm: FormGroup<ItSettingsForm>;

  public slippageTolerance: number;

  constructor(private readonly settingsService: SettingsService) {
    this.defaultSlippageTolerance = this.settingsService.defaultItSettings.slippageTolerance;
  }

  public ngOnInit(): void {
    this.setForm();
  }

  private setForm(): void {
    const form = this.settingsService.instantTradeValue;
    this.instantTradeForm = new FormGroup<ItSettingsForm>({
      autoSlippageTolerance: new FormControl<boolean>(form.autoSlippageTolerance),
      slippageTolerance: new FormControl<number>(form.slippageTolerance),
      deadline: new FormControl<number>(form.deadline),
      disableMultihops: new FormControl<boolean>(form.disableMultihops),
      autoRefresh: new FormControl<boolean>(form.autoRefresh),
      showReceiverAddress: new FormControl<boolean>(form.showReceiverAddress)
    });
    this.slippageTolerance = form.slippageTolerance;
    this.setFormChanges(this.settingsService.instantTrade);
  }

  private setFormChanges(form: AbstractControl<ItSettingsForm>): void {
    this.instantTradeForm.valueChanges.subscribe(settings => {
      form.patchValue({ ...settings });
    });
    form.valueChanges.subscribe(settings => {
      this.instantTradeForm.patchValue({ ...settings }, { emitEvent: false });
      this.slippageTolerance = settings.slippageTolerance;
    });
  }

  public toggleAutoSlippageTolerance(): void {
    if (!this.instantTradeForm.value.autoSlippageTolerance) {
      this.slippageTolerance = this.defaultSlippageTolerance;
      this.instantTradeForm.patchValue({
        autoSlippageTolerance: true,
        slippageTolerance: this.slippageTolerance
      });
    } else {
      this.instantTradeForm.patchValue({
        autoSlippageTolerance: false
      });
    }
  }

  public onSlippageToleranceChange(slippageTolerance: number): void {
    this.slippageTolerance = slippageTolerance || this.defaultSlippageTolerance;
    this.instantTradeForm.patchValue({
      autoSlippageTolerance: false,
      slippageTolerance: this.slippageTolerance
    });
  }
}

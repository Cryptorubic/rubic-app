import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@ngneat/reactive-forms';
import {
  BridgeSettingsForm,
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';

export interface IframeSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  disableMultihops: boolean;
  rubicOptimisation: boolean;
  autoRefresh: boolean;

  tronAddress: string;
}

@Component({
  selector: 'app-iframe-settings',
  templateUrl: './iframe-settings.component.html',
  styleUrls: ['./iframe-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class IframeSettingsComponent implements OnInit {
  private defaultSlippageTolerance = 1;

  public iframeSettingsForm: FormGroup<IframeSettingsForm>;

  public slippageTolerance: number;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.setForm();
  }

  private setForm(): void {
    const itSettingsForm = this.settingsService.settingsForm.controls.INSTANT_TRADE;
    const bridgeSettingsForm = this.settingsService.settingsForm.controls.BRIDGE;

    this.iframeSettingsForm = new FormGroup<IframeSettingsForm>({
      autoSlippageTolerance: new FormControl<boolean>(itSettingsForm.value.autoSlippageTolerance),
      slippageTolerance: new FormControl<number>(itSettingsForm.value.slippageTolerance),
      disableMultihops: new FormControl<boolean>(itSettingsForm.value.disableMultihops),
      rubicOptimisation: new FormControl<boolean>(itSettingsForm.value.rubicOptimisation),
      autoRefresh: new FormControl<boolean>(itSettingsForm.value.autoRefresh),
      tronAddress: new FormControl<string>(bridgeSettingsForm.value.tronAddress)
    });
    this.slippageTolerance = itSettingsForm.value.slippageTolerance;
    this.setFormChanges(itSettingsForm, bridgeSettingsForm);
  }

  private setFormChanges(
    itSettingsForm: AbstractControl<ItSettingsForm>,
    bridgeSettingsForm: AbstractControl<BridgeSettingsForm>
  ): void {
    this.iframeSettingsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(settings => {
      const { tronAddress, ...itSettings } = settings;
      itSettingsForm.patchValue({ ...itSettings });
      bridgeSettingsForm.patchValue({ tronAddress });
    });

    itSettingsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(settings => {
      this.iframeSettingsForm.patchValue({ ...settings }, { emitEvent: false });
      this.slippageTolerance = settings.slippageTolerance;
    });

    bridgeSettingsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(settings => {
      this.iframeSettingsForm.patchValue({ ...settings }, { emitEvent: false });
    });
  }

  public setAutoSlippageTolerance(value: boolean): void {
    if (value) {
      this.slippageTolerance = this.defaultSlippageTolerance;
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
}

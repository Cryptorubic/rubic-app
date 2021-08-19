import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@ngneat/reactive-forms';
import {
  BridgeSettingsForm,
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { Subscription } from 'rxjs';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeSettingsComponent implements OnInit, OnDestroy {
  private defaultSlippageTolerance = 1;

  public iframeSettingsForm: FormGroup<IframeSettingsForm>;

  public slippageTolerance: number;

  private $iframeFormSubscription: Subscription;

  private $itFormSubscription: Subscription;

  private $bridgeFormSubscription: Subscription;

  constructor(private readonly settingsService: SettingsService) {}

  ngOnInit(): void {
    this.setForm();
  }

  ngOnDestroy(): void {
    this.$iframeFormSubscription.unsubscribe();
    this.$itFormSubscription.unsubscribe();
    this.$itFormSubscription.unsubscribe();
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
    this.$iframeFormSubscription = this.iframeSettingsForm.valueChanges.subscribe(settings => {
      const { tronAddress, ...itSettings } = settings;
      itSettingsForm.patchValue({ ...itSettings });
      bridgeSettingsForm.patchValue({ tronAddress });
    });

    this.$itFormSubscription = itSettingsForm.valueChanges.subscribe(settings => {
      this.iframeSettingsForm.patchValue({ ...settings }, { emitEvent: false });
      this.slippageTolerance = settings.slippageTolerance;
    });

    this.$bridgeFormSubscription = bridgeSettingsForm.valueChanges.subscribe(settings => {
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

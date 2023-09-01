import { Component, OnInit, ChangeDetectionStrategy, Self } from '@angular/core';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { CcrSettingsFormControls } from '@features/swaps/core/services/settings-service/models/settings-form-controls';

@Component({
  selector: 'app-settings-ccr',
  templateUrl: './settings-ccr.component.html',
  styleUrls: ['./settings-ccr.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SettingsCcrComponent implements OnInit {
  public readonly defaultSlippageTolerance: number;

  public crossChainRoutingForm: FormGroup<CcrSettingsFormControls>;

  public slippageTolerance: number;

  public readonly minimumSlippageTolerance = 2;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.defaultSlippageTolerance = this.settingsService.defaultCcrSettings.slippageTolerance;
  }

  public ngOnInit(): void {
    this.setForm();
  }

  private setForm(): void {
    const formValue = this.settingsService.crossChainRoutingValue;
    this.crossChainRoutingForm = new FormGroup<CcrSettingsFormControls>({
      autoSlippageTolerance: new FormControl<boolean>(formValue.autoSlippageTolerance),
      slippageTolerance: new FormControl<number>(formValue.slippageTolerance),
      showReceiverAddress: new FormControl<boolean>(formValue.showReceiverAddress)
    });
    this.slippageTolerance = formValue.slippageTolerance;
    this.setFormChanges();

    this.targetNetworkAddressService.isAddressRequired$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAddressRequired => {
        if (isAddressRequired) {
          this.crossChainRoutingForm.controls.showReceiverAddress.disable({ emitEvent: false });
        } else {
          this.crossChainRoutingForm.controls.showReceiverAddress.enable({ emitEvent: false });
        }
      });
  }

  private setFormChanges(): void {
    this.crossChainRoutingForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(settings => {
      this.settingsService.crossChainRouting.patchValue({ ...settings });
    });

    this.settingsService.crossChainRoutingValueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
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
    this.slippageTolerance =
      slippageTolerance < this.minimumSlippageTolerance
        ? this.minimumSlippageTolerance
        : slippageTolerance;
    this.crossChainRoutingForm.patchValue({
      autoSlippageTolerance: false,
      slippageTolerance: this.slippageTolerance
    });
  }
}

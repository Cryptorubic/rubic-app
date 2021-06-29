import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  BridgeSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-settings-bridge',
  templateUrl: './settings-bridge.component.html',
  styleUrls: ['./settings-bridge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsBridgeComponent implements OnInit {
  public bridgeForm: FormGroup<BridgeSettingsForm>;

  constructor(private readonly settingsService: SettingsService) {}

  ngOnInit(): void {
    const form = this.settingsService.settingsForm.controls.BRIDGE;

    this.bridgeForm = new FormGroup<BridgeSettingsForm>({
      tronAddress: new FormControl<string>(
        form.value.tronAddress,
        Validators.pattern(/^T[1-9A-HJ-NP-Za-km-z]{33}$/)
      )
    });

    this.bridgeForm.valueChanges.subscribe(settings => {
      if (settings.tronAddress !== form.value.tronAddress && this.bridgeForm.valid) {
        this.settingsService.settingsForm.controls.BRIDGE.setValue(settings);
      }
    });

    form.valueChanges.subscribe(settings => {
      this.bridgeForm.setValue(
        {
          ...settings
        },
        {
          emitEvent: false
        }
      );
    });
  }
}

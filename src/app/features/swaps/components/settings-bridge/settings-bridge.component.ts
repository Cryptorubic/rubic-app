import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  BridgeSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';

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
      tronAddress: new FormControl<string>(form.value.tronAddress)
    });

    this.bridgeForm.valueChanges.subscribe(settings => {
      this.settingsService.settingsForm.controls.BRIDGE.setValue(settings);
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

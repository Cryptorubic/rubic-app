import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  BridgeSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { FormGroup } from '@ngneat/reactive-forms';

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

    this.bridgeForm = new FormGroup<BridgeSettingsForm>({});

    this.bridgeForm.valueChanges.subscribe();

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

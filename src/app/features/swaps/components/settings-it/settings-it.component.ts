import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';

@Component({
  selector: 'app-settings-it',
  templateUrl: './settings-it.component.html',
  styleUrls: ['./settings-it.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsItComponent implements OnInit {
  private readonly defaultSlippage = 0.1;

  public get autoSlippage(): boolean {
    return this.instantTradeForm.get(['slippageTolerance']).value === this.defaultSlippage;
  }

  public set autoSlippage(_value: boolean) {
    this.instantTradeForm.get(['slippageTolerance']).setValue(this.defaultSlippage);
  }

  public instantTradeForm: FormGroup<ItSettingsForm>;

  constructor(private readonly settingsService: SettingsService) {}

  ngOnInit(): void {
    const form = this.settingsService.settingsForm.controls.INSTANT_TRADE;

    this.instantTradeForm = new FormGroup<ItSettingsForm>({
      slippageTolerance: new FormControl<number>(form.value.slippageTolerance),
      deadline: new FormControl<number>(form.value.deadline),
      disableMultihops: new FormControl<boolean>(form.value.disableMultihops),
      rubicOptimisation: new FormControl<boolean>(form.value.rubicOptimisation)
    });

    this.instantTradeForm.valueChanges.subscribe(settings => {
      this.settingsService.settingsForm.controls.INSTANT_TRADE.setValue(settings);
    });

    form.valueChanges.subscribe(settings => {
      this.instantTradeForm.setValue(
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

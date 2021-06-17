import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  SettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { FormGroup } from '@ngneat/reactive-forms';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';

@Component({
  selector: 'app-settings-it',
  templateUrl: './settings-it.component.html',
  styleUrls: ['./settings-it.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsItComponent {
  private readonly defaultSlippage = 0.1;

  public get autoSlippage(): boolean {
    return this.instantTradeForm.get(['slippageTolerance']).value === this.defaultSlippage;
  }

  public set autoSlippage(value: boolean) {
    this.instantTradeForm.get(['slippageTolerance']).setValue(this.defaultSlippage);
  }

  public instantTradeForm: FormGroup<SettingsForm>;

  constructor(private readonly settingsService: SettingsService) {
    this.instantTradeForm = this.settingsService.settingsForm.getControl(
      SWAP_PROVIDER_TYPE.INSTANT_TRADE
    ) as any;
    this.settingsService.settingsForm.controls.INSTANT_TRADE.valueChanges.subscribe(form => {
      this.instantTradeForm.patchValue({
        ...form
      });
    });
  }
}

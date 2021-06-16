import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

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

  public instantTradeForm: FormGroup;

  public bridgeForm: FormGroup;

  constructor() {
    this.instantTradeForm = new FormGroup({
      slippageTolerance: new FormControl(this.defaultSlippage),
      deadline: new FormControl(20),
      expertMode: new FormControl(),
      disableMultihops: new FormControl(),
      rubicOptimisation: new FormControl()
    });
  }
}

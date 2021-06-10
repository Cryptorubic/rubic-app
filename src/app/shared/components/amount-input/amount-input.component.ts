import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-amount-input',
  templateUrl: './amount-input.component.html',
  styleUrls: ['./amount-input.component.scss']
})
export class AmountInputComponent {
  @Input() public loading: boolean;

  @Input() public disabled: boolean;

  public readonly form: FormGroup;

  constructor() {
    this.loading = true;
    this.disabled = false;
    const value = new BigNumber('53123.1235956').toString(10);
    this.form = new FormGroup({
      usd: new FormControl('33.12'),
      tokens: new FormControl(value)
    });
  }
}

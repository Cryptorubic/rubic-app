import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { IToken } from 'src/app/shared/models/tokens/IToken';
import BigNumber from 'bignumber.js';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-token-amount-input',
  templateUrl: './token-amount-input.component.html',
  styleUrls: ['./token-amount-input.component.scss']
})
export class TokenAmountInputComponent implements OnInit {
  @Input() placeholder = '0.0';

  @Input() token?: IToken;

  @Input() amount = '';

  @Input() minAmount?: number;

  @Input() maxAmount?: number;

  @Output() amountChange = new EventEmitter<string>();

  public readonly DEFAULT_DECIMALS = 8;

  public amountControl: FormControl;

  constructor() {}

  ngOnInit(): void {
    this.setAmountFormControl();
  }

  private setAmountFormControl(): void {
    this.amountControl = new FormControl(this.amount);
    const validators = [];
    if (this.minAmount !== undefined) {
      validators.push(Validators.min(this.minAmount));
    }
    if (this.maxAmount !== undefined) {
      validators.push(Validators.max(this.maxAmount));
    }
    this.amountControl.setValidators(validators);
  }

  public onAmountChange(newAmount: string): void {
    this.amount = newAmount;
    this.amountChange.emit(this.amount);
  }

  public onUserBalanceMaxButtonClick(): void {
    this.amount = this.token.userBalance.toString();
    this.amountChange.emit(this.amount);
  }

  public getUsdPrice(): string {
    return new BigNumber(this.amount || 0).multipliedBy(this.token?.price ?? 0).toFixed();
  }
}

import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { FormControl, Validators } from '@angular/forms';
import { TokenAmount } from '../../models/tokens/TokenAmount';

@Component({
  selector: 'app-token-amount-input',
  templateUrl: './token-amount-input.component.html',
  styleUrls: ['./token-amount-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokenAmountInputComponent implements OnInit, OnChanges {
  @Input() placeholder = '0.0';

  @Input() token?: TokenAmount;

  @Input() set amount(value: BigNumber) {
    if (value && !value.eq(this.amountControl.value)) {
      this.amountControl.setValue(value.toFixed());
    }
  }

  @Input() minAmount?: number;

  @Input() maxAmount?: number;

  @Output() amountChange = new EventEmitter<string>();

  public readonly DEFAULT_DECIMALS = 8;

  public amountControl = new FormControl('');

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setAmountControlValidators();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.minAmount || changes.maxAmount) {
      this.setAmountControlValidators();
      this.cdr.markForCheck();
    }
  }

  private setAmountControlValidators(): void {
    const validators = [];
    if (this.minAmount !== undefined) {
      validators.push(Validators.min(this.minAmount));
    }
    if (this.maxAmount !== undefined) {
      validators.push(Validators.max(this.maxAmount));
    }
    this.amountControl.setValidators(validators);
  }

  public onUserBalanceMaxButtonClick(): void {
    const amount = this.token.amount.toString();
    this.amountControl.setValue(amount);
    this.amountChange.emit(amount);
  }

  public getUsdPrice(): BigNumber {
    return new BigNumber(this.amountControl.value || 0).multipliedBy(this.token?.price ?? 0);
  }
}

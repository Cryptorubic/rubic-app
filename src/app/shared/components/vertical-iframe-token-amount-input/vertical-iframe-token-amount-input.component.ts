import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';
import { FormControl } from '@angular/forms';
import { BIG_NUMBER_FORMAT } from 'src/app/shared/constants/formats/BIG_NUMBER_FORMAT';

@Component({
  selector: 'app-vertical-iframe-token-amount-input',
  templateUrl: './vertical-iframe-token-amount-input.component.html',
  styleUrls: ['./vertical-iframe-token-amount-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerticalIframeTokenAmountInputComponent {
  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Input() formService: FormService;

  @Input() placeholder = '0.0';

  @Input() token?: TokenAmount;

  @Input() set amount(value: BigNumber) {
    if (value && !value.isNaN() && !value.eq(this.amount)) {
      this.amountControl.setValue(value.toFixed());
    }
  }

  get amount() {
    return new BigNumber(this.amountControl.value.split(',').join('') || 0);
  }

  get usdPrice(): BigNumber {
    return this.amount.multipliedBy(this.token?.price ?? 0);
  }

  @Output() amountChange = new EventEmitter<string>();

  public readonly DEFAULT_DECIMALS = 18;

  public amountControl = new FormControl('');

  constructor() {}

  public onUserBalanceMaxButtonClick(): void {
    const amount = this.token.amount.toFormat(BIG_NUMBER_FORMAT);
    this.amountControl.setValue(amount);
  }

  public emitAmountChange(amount: string): void {
    this.amountControl.setValue(amount, { emitViewToModelChange: false });
    this.amountChange.emit(amount.split(',').join(''));
  }
}

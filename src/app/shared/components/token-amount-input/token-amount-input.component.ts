import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { FormControl } from '@angular/forms';
import { BIG_NUMBER_FORMAT } from 'src/app/shared/constants/formats/BIG_NUMBER_FORMAT';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { TokenAmount } from '../../models/tokens/TokenAmount';

@Component({
  selector: 'app-token-amount-input',
  templateUrl: './token-amount-input.component.html',
  styleUrls: ['./token-amount-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokenAmountInputComponent {
  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Input() formService: FormService;

  @Input() placeholder = '0.0';

  @Input() token?: TokenAmount;

  @Input() toTokenSelected: boolean;

  @Input() maxGasFee: BigNumber;

  @Input() set amount(value: BigNumber) {
    if (value && !value.isNaN() && !value.eq(this.amount)) {
      this.amountControl.setValue(value.toFixed());
    }
  }

  get amount() {
    return new BigNumber(this.amountControl.value.split(',').join('') || 0);
  }

  @Output() amountChange = new EventEmitter<string>();

  public readonly DEFAULT_DECIMALS = 18;

  public amountControl = new FormControl('');

  constructor(private readonly cdr: ChangeDetectorRef) {}

  public onUserBalanceMaxButtonClick(): void {
    const { amount, address } = this.token;
    if (address === NATIVE_TOKEN_ADDRESS) {
      const maxAmount = amount.minus(this.maxGasFee);
      console.log(this.maxGasFee.toString(10), maxAmount.toString(10));
      this.amountControl.setValue(maxAmount.gt(0) ? maxAmount.toFormat(BIG_NUMBER_FORMAT) : 0);
    } else {
      this.amountControl.setValue(amount);
    }
  }

  public getUsdPrice(): BigNumber {
    return this.amount.multipliedBy(this.token?.price ?? 0);
  }

  public emitAmountChange(amount: string): void {
    this.amountControl.setValue(amount, { emitViewToModelChange: false });
    this.amountChange.emit(amount.split(',').join(''));
  }
}

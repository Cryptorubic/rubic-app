import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { BehaviorSubject } from 'rxjs';

import { ErrorTypeEnum } from '../../enums/error-type.enum';

@Component({
  selector: 'app-withdraw-button-container',
  templateUrl: './withdraw-button-container.component.html',
  styleUrls: ['./withdraw-button-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithdrawButtonContainerComponent implements OnInit {
  @Input() needLogin: boolean;

  @Input() needChangeNetwork: boolean;

  @Input() balance: BigNumber;

  @Input() set amount(value: string) {
    this._amount = new BigNumber(value ? value.split(',').join('') : NaN);
    if (this.balance) {
      this.checkAmountAndBalance(this._amount, this.balance);
    }
  }

  @Output() onWithdraw = new EventEmitter<void>();

  @Output() onLogin = new EventEmitter<void>();

  @Output() onChangeNetwork = new EventEmitter<void>();

  private _amount: BigNumber;

  public errorType$ = new BehaviorSubject<ErrorTypeEnum | null>(ErrorTypeEnum.EMPTY_AMOUNT);

  public readonly errorTypeEnum = ErrorTypeEnum;

  constructor() {}

  ngOnInit() {
    console.log('');
  }

  private checkAmountAndBalance(amount: BigNumber, balance: BigNumber): void {
    if (amount.isNaN()) {
      this.errorType$.next(ErrorTypeEnum.EMPTY_AMOUNT);
      return;
    }

    if (balance.lt(amount)) {
      this.errorType$.next(ErrorTypeEnum.INSUFFICIENT_BALANCE);
      return;
    }

    this.errorType$.next(null);
  }
}

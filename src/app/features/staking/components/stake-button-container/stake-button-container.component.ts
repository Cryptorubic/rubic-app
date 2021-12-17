import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { STAKE_LIMIT_MAX, STAKE_LIMIT_MIN } from '../../constants/STACKING_LIMITS';
import BigNumber from 'bignumber.js';
import { BehaviorSubject } from 'rxjs';

import { ErrorTypeEnum } from '../../enums/error-type.enum';

@Component({
  selector: 'app-stake-button-container',
  templateUrl: './stake-button-container.component.html',
  styleUrls: ['./stake-button-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeButtonContainerComponent {
  @Input() needLogin: boolean;

  @Input() balance: BigNumber | number;

  @Input() set amount(value: string) {
    this._amount = new BigNumber(value ? value.split(',').join('') : NaN);
    if (this.balance) {
      this.checkAmountAndBalance(this._amount, this.balance as BigNumber);
    }
  }

  @Output() onConfirmStake = new EventEmitter<void>();

  @Output() onLogin = new EventEmitter<void>();

  private _amount: BigNumber;

  public errorType$ = new BehaviorSubject<ErrorTypeEnum | null>(ErrorTypeEnum.EMPTY_AMOUNT);

  public readonly errorTypeEnum = ErrorTypeEnum;

  constructor() {}

  private checkAmountAndBalance(amount: BigNumber, balance: BigNumber): void {
    if (amount.isNaN()) {
      this.errorType$.next(ErrorTypeEnum.EMPTY_AMOUNT);
    }

    if (balance.lt(amount)) {
      this.errorType$.next(ErrorTypeEnum.INSUFFICIENT_BALANCE);
    }

    if (amount.gt(new BigNumber(STAKE_LIMIT_MAX)) || amount.lt(new BigNumber(STAKE_LIMIT_MIN))) {
      this.errorType$.next(ErrorTypeEnum.LIMIT);
    } else {
      this.errorType$.next(null);
    }
  }
}

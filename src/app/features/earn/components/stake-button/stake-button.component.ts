import {
  ChangeDetectionStrategy,
  EventEmitter,
  Component,
  Output,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';

export enum StakeError {
  INSUFFICIENT_BALANCE_RBC = 'INSUFFICIENT_BALANCE_RBC',
  EMPTY_AMOUNT = 'EMPTY_AMOUNT',
  LESS_THEN_MINIMUM = 'LESS_THEN_MINIMUM',
  NEED_APPROVE = 'NEED_APPROVE',
  NULL = 'NULL'
}

@Component({
  selector: 'app-stake-button',
  templateUrl: './stake-button.component.html',
  styleUrls: ['./stake-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeButtonComponent implements OnChanges {
  @Input() rbcAmount: BigNumber;

  @Input() minRbcAmount: number;

  @Input() needLogin: boolean;

  @Input() needSwitchNetwork: boolean;

  @Input() approveLoading: boolean = false;

  @Input() stakeLoading: boolean = false;

  @Input() rbcBalance: BigNumber;

  @Input() rbcAllowance: BigNumber;

  @Output() public readonly onLogin = new EventEmitter<void>();

  @Output() public readonly onSwitchNetwork = new EventEmitter<void>();

  @Output() public readonly onApprove = new EventEmitter<void>();

  @Output() public readonly onStake = new EventEmitter<void>();

  public readonly errors = StakeError;

  public error: StakeError = StakeError.EMPTY_AMOUNT;

  public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log({ changes });
    // debugger;

    if (changes.rbcAllowance && changes.rbcAllowance.currentValue) {
      if (changes.rbcAllowance.currentValue.lt(10000000)) {
        this.error = StakeError.NEED_APPROVE;
      }
    } else {
      if (changes.rbcAmount && changes.rbcAmount.currentValue) {
        if (!changes?.rbcAmount?.currentValue?.toNumber()) {
          this.error = StakeError.EMPTY_AMOUNT;
          return;
        }
        if (changes.rbcAmount.currentValue.lt(this.minRbcAmount)) {
          this.error = StakeError.LESS_THEN_MINIMUM;
          return;
        }
        if (this.rbcBalance.lt(changes.rbcAmount.currentValue)) {
          this.error = StakeError.INSUFFICIENT_BALANCE_RBC;
          return;
        } else {
          this.error = StakeError.NULL;
          return;
        }
      }
    }
  }
}

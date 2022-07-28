import { ChangeDetectionStrategy, EventEmitter, Component, Output, Input } from '@angular/core';
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
export class StakeButtonComponent {
  @Input() rbcAmount: BigNumber;

  @Input() minRbcAmount: number;

  @Input() needLogin: boolean;

  @Input() needSwitchNetwork: boolean;

  @Input() approveLoading: boolean = false;

  @Input() stakeLoading: boolean = false;

  @Input() rbcBalance: BigNumber;

  @Input() rbcAllowance: BigNumber;

  @Input() error: StakeError;

  @Output() public readonly onLogin = new EventEmitter<void>();

  @Output() public readonly onSwitchNetwork = new EventEmitter<void>();

  @Output() public readonly onApprove = new EventEmitter<void>();

  @Output() public readonly onStake = new EventEmitter<void>();

  public readonly errors = StakeError;

  public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

  constructor() {}
}

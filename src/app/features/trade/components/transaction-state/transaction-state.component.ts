import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TransactionStep, transactionStep } from '@features/trade/models/transaction-steps';
import { StepsType } from './models/types';

@Component({
  selector: 'app-transaction-state',
  templateUrl: './transaction-state.component.html',
  styleUrls: ['./transaction-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionStateComponent {
  public steps: StepsType[];

  public type: 'bridge' | 'swap';

  @Input({ required: true }) set state(value: TransactionStep) {
    this.setStepStates(value);
  }

  @Input({ required: true }) set transactionData(value: {
    type: 'bridge' | 'swap';
    needApprove: boolean;
    needPermit2Approve: boolean;
  }) {
    const steps: TransactionStep[] = [];
    this.type = value.type;
    if (value.needPermit2Approve) {
      steps.push(transactionStep.approveOnPermit2);
    }
    if (value.needApprove) {
      steps.push(transactionStep.approvePending);
    }
    if (value.type === 'swap') {
      steps.push(transactionStep.swapRequest, transactionStep.sourcePending);
    } else {
      steps.push(
        transactionStep.swapRequest,
        transactionStep.sourcePending,
        transactionStep.destinationPending
      );
    }
    steps.push(transactionStep.success);
    this.steps = steps.map(el => ({
      status: 'default',
      key: el,
      value: TransactionStateComponent.getLabel(el, this.type)
    }));
  }

  public static getLabel(state: TransactionStep, type: 'bridge' | 'swap'): string {
    const map: Record<TransactionStep, string> = {
      idle: 'Swap',
      error: 'Error',
      approveOnPermit2: 'Manage permit approve',
      approveReady: 'Approve',
      approvePending: 'Manage allowance',
      swapReady: 'Swap',
      swapRequest: 'Transaction Sign',
      sourcePending:
        type === 'swap' ? 'Waiting for transaction' : 'Waiting for complete in source chain',
      destinationPending: 'Waiting for complete in target chain',
      success: 'Success swap',
      inactive: 'Inactive'
    };
    return map[state];
  }

  private setStepStates(value: TransactionStep): void {
    const stateIndex = this.steps.findIndex(el => el.key === value);
    this.steps = this.steps.map((step, index) => {
      if (
        index < stateIndex ||
        value === transactionStep.success ||
        value === transactionStep.error
      ) {
        return { ...step, status: 'fullfilled' };
      }

      if (index === stateIndex) {
        return { ...step, status: 'pending' };
      }

      return { ...step, status: 'default' };
    });
  }
}

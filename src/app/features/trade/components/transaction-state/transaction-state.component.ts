import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TransactionStep, transactionStep } from '@features/trade/models/transaction-steps';

type StepState = 'fullfilled' | 'pending' | '';

@Component({
  selector: 'app-transaction-state',
  templateUrl: './transaction-state.component.html',
  styleUrls: ['./transaction-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionStateComponent {
  public steps: { key: TransactionStep; value: string }[];

  public type: 'bridge' | 'swap';

  public stepsStates: StepState[] = [];

  @Input({ required: true }) set state(value: TransactionStep) {
    const stateIndex = this.steps.findIndex(el => el.key === value);
    this.stepsStates = this.steps.map((_, index) => {
      if (
        index < stateIndex ||
        value === transactionStep.success ||
        value === transactionStep.error
      ) {
        return 'fullfilled';
      }
      if (index === stateIndex) {
        return 'pending';
      }
      return '';
    });
  }

  @Input({ required: true }) set transactionData(value: {
    type: 'bridge' | 'swap';
    needApprove: boolean;
  }) {
    const steps: TransactionStep[] = [];
    this.type = value.type;
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
      key: el,
      value: TransactionStateComponent.getLabel(el, this.type)
    }));
  }

  public static getLabel(state: TransactionStep, type: 'bridge' | 'swap'): string {
    const map: Record<TransactionStep, string> = {
      idle: 'Swap',
      error: 'Error',
      approveReady: 'Approve',
      approvePending: 'Manage allowance',
      swapReady: 'Swap',
      swapRequest: 'Transaction Sign',
      sourcePending:
        type === 'swap' ? 'Waiting for transaction' : 'Waiting for complete in source chain',
      destinationPending: 'Waiting for complete in target chain',
      success: 'Success swap'
    };
    return map[state];
  }
}

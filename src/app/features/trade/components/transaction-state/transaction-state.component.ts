import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TransactionStep, transactionStep } from '@features/trade/models/transaction-steps';

@Component({
  selector: 'app-transaction-state',
  templateUrl: './transaction-state.component.html',
  styleUrls: ['./transaction-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionStateComponent {
  public steps: { key: TransactionStep; value: string }[];

  public type: 'bridge' | 'swap';

  public stateIndex: number = 0;

  @Input({ required: true }) set state(value: TransactionStep) {
    this.stateIndex = this.steps.findIndex(el => el.key === value);
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
    this.steps = steps.map(el => ({
      key: el,
      value: TransactionStateComponent.getLabel(el)
    }));
  }

  public static getLabel(state: TransactionStep): string {
    const map: Record<TransactionStep, string> = {
      idle: 'Swap',
      error: 'Error',
      approveReady: 'Approve',
      approvePending: 'Manage allowance',
      swapReady: 'Swap',
      swapRequest: 'Transaction Sign',
      sourcePending: 'Waiting for transaction',
      destinationPending: 'Waiting for complete in target chain',
      success: 'Success swap'
    };
    return map[state];
  }
}

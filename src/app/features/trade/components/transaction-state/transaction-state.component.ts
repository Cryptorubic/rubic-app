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
    if (value.type === 'swap') {
      if (value.needApprove) {
        steps.push(transactionStep.approveRequest);
        steps.push(transactionStep.approvePending);
      }
      steps.push(
        transactionStep.swapRequest,
        transactionStep.sourcePending,
        transactionStep.success
      );
    } else {
      if (value.needApprove) {
        steps.push(transactionStep.approveRequest);
        steps.push(transactionStep.approvePending);
      }
      steps.push(
        transactionStep.swapRequest,
        transactionStep.sourcePending,
        transactionStep.destinationPending,
        transactionStep.success
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
      error: 'error',
      approveReady: 'Approve',
      approveRequest: 'Sign Transaction',
      approvePending: 'Approve processing',
      swapReady: 'Swap',
      swapRequest: 'Sign Transaction',
      sourcePending: 'Transaction in process',
      destinationPending: 'Pending on target network',
      success: 'Success swap'
    };
    return map[state];
  }
}

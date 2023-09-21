import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TransactionStep, transactionStep } from '@features/trade/models/transaction-steps';

@Component({
  selector: 'app-transaction-state',
  templateUrl: './transaction-state.component.html',
  styleUrls: ['./transaction-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionStateComponent {
  public steps: string[];

  public type: 'bridge' | 'swap';

  public stateIndex: number = 0;

  @Input({ required: true }) set state(value: TransactionStep) {}

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
    this.steps = steps.map(el => TransactionStateComponent.getLabel(el));
  }

  public static getLabel(state: TransactionStep): string {
    const map: Record<TransactionStep, string> = {
      idle: 'Swap',
      error: 'error',
      approveReady: 'Approve',
      approveRequest: 'Sign approve',
      approvePending: 'Approve processing',
      swapReady: 'Swap',
      swapRequest: 'Sign swap',
      sourcePending: 'Pending on source network',
      destinationPending: 'Pending on target network',
      success: 'Success swap'
    };
    return map[state];
  }
}

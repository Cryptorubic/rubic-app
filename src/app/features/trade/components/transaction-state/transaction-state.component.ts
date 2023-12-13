import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TransactionStep, transactionStep } from '@features/trade/models/transaction-steps';
import { BehaviorSubject } from 'rxjs';

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

  private _stepsStates$: BehaviorSubject<StepState[]> = new BehaviorSubject([]);

  public stepsStates$ = this._stepsStates$.asObservable();

  @Input({ required: true }) set state(value: TransactionStep) {
    const stateIndex = this.steps.findIndex(el => el.key === value);
    const stepsStates: StepState[] = this.steps.map((_, index) => {
      const lastStep = this.steps[this.steps.length - 1].key;
      if (index < stateIndex || value === lastStep) {
        return 'fullfilled';
      }
      if (index === stateIndex) {
        return 'pending';
      }
      return '';
    });

    this._stepsStates$.next(stepsStates);
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

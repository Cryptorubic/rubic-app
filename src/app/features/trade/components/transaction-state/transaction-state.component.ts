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
    needAuthWallet: boolean;
  }) {
    const steps: TransactionStep[] = [];
    this.type = value.type;
    if (value.needAuthWallet) {
      steps.push(transactionStep.authWalletPending);
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
      approveReady: 'Approve',
      approvePending: 'Manage allowance',
      authWalletPending: 'Signing message',
      authWalletReady: 'Wallet authorized',
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
    const stateIdx = this.steps.findIndex(el => el.key === value);
    const successStateIdx = this.steps.findIndex(el => el.key === transactionStep.success);

    this.steps = this.steps.map((step, index) => {
      if (value === transactionStep.error) {
        if (step.key === transactionStep.success) return { ...step, status: 'failed' };
        // every step before success supposed to be succeeded
        if (index < successStateIdx) return { ...step, status: 'fullfilled' };
      }
      if (index < stateIdx || value === transactionStep.success) {
        return { ...step, status: 'fullfilled' };
      }
      if (index === stateIdx) return { ...step, status: 'pending' };

      return { ...step, status: 'default' };
    });
  }
}

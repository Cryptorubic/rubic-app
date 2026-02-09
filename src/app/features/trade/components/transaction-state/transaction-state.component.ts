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
    needTrustlineAfterSwap: boolean;
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
        ...(value.needTrustlineAfterSwap
          ? [transactionStep.trustlinePending, transactionStep.destinationPending]
          : [transactionStep.destinationPending])
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
      trustlinePending: 'Waiting for trustline',
      trustlineReady: 'Trustline added',
      swapReady: 'Swap',
      swapRequest: 'Transaction Sign',
      swapRetry: 'Swap Retry',
      sourcePending:
        type === 'swap' ? 'Waiting for transaction' : 'Waiting for complete in source chain',
      destinationPending: 'Waiting for complete in target chain',
      success: 'Success swap',
      inactive: 'Inactive'
    };
    return map[state];
  }

  private setStepStates(value: TransactionStep): void {
    value = value === transactionStep.swapRetry ? transactionStep.swapRequest : value;
    const stateIdx = this.steps.findIndex(el => el.key === value);

    const isSrcChainLastStep = (el: StepsType): boolean => {
      return this.type === 'swap'
        ? el.key === transactionStep.success
        : el.key === transactionStep.sourcePending;
    };

    const srcChainSuccessIdx = this.steps.findIndex(el => isSrcChainLastStep(el));

    this.steps = this.steps.map((step, index) => {
      if (value === transactionStep.error) {
        if (isSrcChainLastStep(step)) return { ...step, status: 'failed' };
        // every step before success supposed to be succeeded
        if (index < srcChainSuccessIdx) return { ...step, status: 'fullfilled' };
      }
      if (index < stateIdx || value === transactionStep.success) {
        return { ...step, status: 'fullfilled' };
      }
      if (index === stateIdx) return { ...step, status: 'pending' };

      return { ...step, status: 'default' };
    });
  }
}

import { SourceTxStatus } from '@features/history/models/source-tx-status';
import { DestinationTxStatus } from '@features/history/models/destination-tx-status';
import { TuiStatus } from '@taiga-ui/kit';

export interface TxStatus {
  appearance: TuiStatus;
  label: string;
}

export const txStatusMapping: Record<SourceTxStatus | DestinationTxStatus, TxStatus> = {
  pending: { appearance: 'info', label: 'Pending' },
  success: { appearance: 'success', label: 'Success' },
  completed: { appearance: 'success', label: 'Success' },
  not_found: { appearance: 'warning', label: 'Not Found' },
  fail: { appearance: 'error', label: 'Failed' },
  revert: { appearance: 'primary', label: 'Revert' },
  reverted: { appearance: 'success', label: 'Reverted' },
  long_pending: { appearance: 'info', label: 'Pending' },
  ready_to_claim: { appearance: 'primary', label: 'Claim' },
  waiting_for_refund_trustline: { appearance: 'primary', label: 'Refund' },
  failed: { appearance: 'error', label: 'Failed' }
};

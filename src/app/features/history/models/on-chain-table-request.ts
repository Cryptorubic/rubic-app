import { TableKey } from '@features/history/models/table-key';
import { SourceTxStatus } from '@features/history/models/source-tx-status';

export interface OnChainTableRequest {
  address: string;
  page: number;
  pageSize: number;
  ordering: TableKey | `-${TableKey}`;
  status?: SourceTxStatus;
}

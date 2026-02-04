import { TableKey } from '@features/history/models/table-key';
import { SourceTxStatus } from '@features/history/models/source-tx-status';
import { Integrator } from '@app/features/history/models/integrator';

export interface OnChainTableRequest {
  address: string;
  page: number;
  pageSize: number;
  ordering: TableKey | `-${TableKey}`;
  status?: SourceTxStatus;
  integrator: Integrator;
}

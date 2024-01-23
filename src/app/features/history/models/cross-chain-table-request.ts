import { TableKey } from '@features/history/models/table-key';
import { SourceTxStatus } from '@features/history/models/source-tx-status';
import { DestinationTxStatus } from '@features/history/models/destination-tx-status';

export interface CrossChainTableRequest {
  address: string;
  page: number;
  pageSize: number;
  ordering: TableKey | `-${TableKey}`;
  trade_status?: DestinationTxStatus;
  source_tx_status?: SourceTxStatus;
}

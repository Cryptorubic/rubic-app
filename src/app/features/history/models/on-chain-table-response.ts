import { SourceTxStatus } from '@features/history/models/source-tx-status';
import { DestinationTxStatus } from '@features/history/models/destination-tx-status';
import { HistoryRequestToken } from '@features/history/models/history-request-token';
import { HistoryRequestTx } from '@features/history/models/history-request-tx';
import { BackendBlockchain } from '@cryptorubic/core';

export interface OnChainTableResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    user_address: string;
    transaction: HistoryRequestTx<SourceTxStatus>;
    network: BackendBlockchain;
    provider: string;
    from_amount: string;
    to_amount: string;
    from_token: HistoryRequestToken;
    to_token: HistoryRequestToken;
    volume_in_usd: number;
    created_at: string;
    via_rubic_proxy: true;
    status: DestinationTxStatus;
  }[];
}

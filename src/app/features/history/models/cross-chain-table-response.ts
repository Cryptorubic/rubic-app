import { ToBackendCrossChainProviders } from '@core/services/backend/cross-chain-routing-api/constants/to-backend-cross-chain-providers';
import { SourceTxStatus } from '@features/history/models/source-tx-status';
import { DestinationTxStatus } from '@features/history/models/destination-tx-status';
import { HistoryRequestToken } from '@features/history/models/history-request-token';
import { HistoryRequestTx } from '@features/history/models/history-request-tx';
import { BackendBlockchain } from '@cryptorubic/sdk';

export interface CrossChainTableResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    user_address: string;
    provider: ToBackendCrossChainProviders;
    from_network: BackendBlockchain;
    to_network: BackendBlockchain;
    source_transaction: HistoryRequestTx<SourceTxStatus>;
    dest_transaction: HistoryRequestTx<SourceTxStatus>;
    from_token: HistoryRequestToken;
    to_token: HistoryRequestToken;
    from_amount: string;
    to_amount: string;
    volume_in_usd: number;
    created_at: string;
    via_rubic_proxy: true;
    status: DestinationTxStatus;
    changenow_id: string;
  }[];
}

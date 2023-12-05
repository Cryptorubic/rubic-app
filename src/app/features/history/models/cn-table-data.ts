import { HistoryBlockchain, HistoryToken } from '@features/history/models/data-types';
import { TxStatus } from '@features/history/models/tx-status-mapping';

export interface CnTableData {
  fromToken: HistoryToken;
  toToken: HistoryToken;

  fromBlockchain: HistoryBlockchain;
  toBlockchain: HistoryBlockchain;

  status: TxStatus;
  date: string;
  receiverAddress: string;
}

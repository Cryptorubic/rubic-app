import { ProviderInfo } from '@features/trade/models/provider-info';
import { HistoryBlockchain, HistoryToken, HistoryTx } from '@features/history/models/data-types';

export interface CrossChainTableData {
  fromToken: HistoryToken;
  toToken: HistoryToken;

  fromBlockchain: HistoryBlockchain;
  toBlockchain: HistoryBlockchain;

  fromTx: HistoryTx;
  toTx: HistoryTx;

  date: string;
  provider: ProviderInfo;

  receiver: string;

  /* used to copy transaction id in table */
  changenowId?: string;
}

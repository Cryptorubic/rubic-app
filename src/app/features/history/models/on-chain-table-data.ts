import { ProviderInfo } from '@features/trade/models/provider-info';
import { HistoryBlockchain, HistoryToken, HistoryTx } from '@features/history/models/data-types';

export interface OnChainTableData {
  fromToken: HistoryToken;
  toToken: HistoryToken;

  blockchain: HistoryBlockchain;

  tx: HistoryTx;

  date: string;
  provider: ProviderInfo;
}

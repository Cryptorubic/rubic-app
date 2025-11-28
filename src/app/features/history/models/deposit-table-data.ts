import { ProviderInfo } from '@app/features/trade/models/provider-info';
import { HistoryBlockchain, HistoryToken } from '@features/history/models/data-types';
import { TxStatus } from '@features/history/models/tx-status-mapping';
import { CrossChainTradeType, OnChainTradeType } from '@cryptorubic/core';

export interface DepositTableData {
  fromToken: HistoryToken;
  toToken: HistoryToken;

  fromBlockchain: HistoryBlockchain;
  toBlockchain: HistoryBlockchain;

  id: string;

  status: TxStatus;
  date: string;
  receiverAddress: string;
  tradeType: CrossChainTradeType | OnChainTradeType;
  providerInfo: ProviderInfo;
}

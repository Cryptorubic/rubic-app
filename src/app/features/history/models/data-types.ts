import BigNumber from 'bignumber.js';
import { BlockchainName } from '@cryptorubic/core';
import { TxStatus } from '@features/history/models/tx-status-mapping';

export interface HistoryToken {
  symbol: string;
  image: string;
  amount: BigNumber;
}

export interface HistoryBlockchain {
  name: BlockchainName;
  label: string;
  color: string;
  image: string;
}

export interface HistoryTx {
  hash: string | null;
  status: TxStatus;
  explorerLink: string | null;
}

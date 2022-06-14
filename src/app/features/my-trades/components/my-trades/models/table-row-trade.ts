import { TRANSACTION_STATUS } from '@shared/models/blockchain/transaction-status';
import { TableProvider } from '@shared/models/my-trades/table-trade';
import BigNumber from 'bignumber.js';

export type TableRowKey = 'Status' | 'FromTo' | 'Provider' | 'Sent' | 'Expected' | 'Date';

export type TableRowKeyValue = {
  translateKey: string;
  value: TableRowKey;
};

export interface TableRowTrade {
  hash: string;

  Status: TRANSACTION_STATUS;
  FromTo: string;
  Provider: TableProvider;
  Sent: BigNumber;
  Expected: BigNumber;
  Date: Date;

  inProgress: boolean;
}

export interface TableRowsData {
  totalCount: number;
  rowTrades: TableRowTrade[];
}

import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';
import { TableProvider } from 'src/app/shared/models/my-trades/TableTrade';
import BigNumber from 'bignumber.js';

export type TableRowKey = 'Status' | 'FromTo' | 'Provider' | 'Sent' | 'Expected' | 'Date';

export interface TableRow {
  Status: TRANSACTION_STATUS;
  FromTo: string;
  Provider: TableProvider;
  Sent: BigNumber;
  Expected: BigNumber;
  Date: Date;

  inProgress: boolean;
}

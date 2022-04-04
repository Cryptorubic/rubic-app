import { TableRowKeyValue } from '@features/my-trades/components/my-trades/models/table-row-trade';

export const COLUMNS: TableRowKeyValue[] = [
  {
    translateKey: 'tradesTable.columns.status',
    value: 'Status'
  },
  {
    translateKey: 'tradesTable.columns.from',
    value: 'FromTo'
  },
  {
    translateKey: 'tradesTable.columns.provider',
    value: 'Provider'
  },
  {
    translateKey: 'tradesTable.columns.send',
    value: 'Sent'
  },
  {
    translateKey: 'tradesTable.columns.expected',
    value: 'Expected'
  },
  {
    translateKey: 'tradesTable.columns.date',
    value: 'Date'
  }
];

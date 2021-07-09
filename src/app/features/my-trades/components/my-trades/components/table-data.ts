import {
  TableRow,
  TableRowKey
} from 'src/app/features/my-trades/components/my-trades/models/TableRow';
import { defaultSort, TuiComparator } from '@taiga-ui/addon-table';
import BigNumber from 'bignumber.js';
import { TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';
import { ScannerLinkPipe } from 'src/app/shared/pipes/scanner-link.pipe';
import { MyTradesService } from 'src/app/features/my-trades/services/my-trades.service';
import { EventEmitter, Output } from '@angular/core';
import { TRANSACTION_STATUS } from '../../../../../shared/models/blockchain/TRANSACTION_STATUS';

export abstract class TableData {
  @Output() onReceivePolygonBridgeTrade = new EventEmitter<TableTrade>();

  protected constructor(
    protected readonly myTradesService: MyTradesService,
    protected readonly scannerLinkPipe: ScannerLinkPipe
  ) {}

  protected sortBy(key: TableRowKey, direction: -1 | 1): TuiComparator<TableRow> {
    return (a, b) => {
      let sort;
      if (key === 'Sent' || key === 'Expected') {
        sort = (x: BigNumber, y: BigNumber) => x.comparedTo(y);
      } else {
        sort = defaultSort;
      }
      return direction * sort(a[key], b[key]);
    };
  }

  public getTableTrade(tableRow: TableRow): TableTrade {
    return this.myTradesService.getTableTradeByDate(tableRow.Date);
  }

  public getTransactionLink(trade: TableTrade): string {
    if (!trade) {
      return '';
    }
    return this.scannerLinkPipe.transform(
      trade.transactionHash,
      trade.fromToken.blockchain,
      ADDRESS_TYPE.TRANSACTION
    );
  }

  public getTranslationStatusKey(status: TRANSACTION_STATUS): string {
    switch (status) {
      case TRANSACTION_STATUS.COMPLETED:
        return 'tradesTable.statuses.completed';
      case TRANSACTION_STATUS.PENDING:
        return 'tradesTable.statuses.pending';
      case TRANSACTION_STATUS.CANCELLED:
        return 'tradesTable.statuses.cancelled';
      case TRANSACTION_STATUS.REJECTED:
        return 'tradesTable.statuses.rejected';
      case TRANSACTION_STATUS.DEPOSIT_IN_PROGRESS:
        return 'tradesTable.statuses.depositInProgress';
      case TRANSACTION_STATUS.WITHDRAW_IN_PROGRESS:
        return 'tradesTable.statuses.withdrawInProgress';
      case TRANSACTION_STATUS.WAITING_FOR_DEPOSIT:
        return 'tradesTable.statuses.waitingForDeposit';
      case TRANSACTION_STATUS.WAITING_FOR_RECEIVING:
        return 'tradesTable.statuses.waitingForReceiving';
      default:
        return '';
    }
  }
}

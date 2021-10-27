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
import { Directive, EventEmitter, inject, Output } from '@angular/core';
import { DEFAULT_TOKEN_IMAGE } from 'src/app/shared/constants/tokens/DEFAULT_TOKEN_IMAGE';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class AbstractTableDataComponent {
  @Output() onReceivePolygonBridgeTrade = new EventEmitter<TableTrade>();

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  // Injected services
  private readonly myTradesService = inject(MyTradesService);

  private readonly scannerLinkPipe = inject(ScannerLinkPipe);

  private readonly tokensService = inject(TokensService);

  protected constructor() {}

  protected sortBy(key: TableRowKey, direction: -1 | 1): TuiComparator<TableRow> {
    return (a, b) => {
      let sort;
      if (key === 'Sent' || key === 'Expected') {
        sort = (x: BigNumber, y: BigNumber) => {
          x = x.isFinite() ? x : new BigNumber(0);
          y = y.isFinite() ? y : new BigNumber(0);
          return x.comparedTo(y);
        };
      } else {
        sort = defaultSort;
      }
      return direction * sort(a[key] as BigNumber, b[key] as BigNumber);
    };
  }

  public getTableTrade(tableRow: TableRow): TableTrade {
    return this.myTradesService.getTableTradeByDate(tableRow.Date);
  }

  public getTransactionLink(trade: TableTrade): string {
    if (!trade) {
      return '';
    }
    return (
      trade.transactionHashScanUrl ||
      this.scannerLinkPipe.transform(
        trade.transactionHash,
        trade.fromToken.blockchain,
        ADDRESS_TYPE.TRANSACTION
      )
    );
  }

  public onTokenImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }
}

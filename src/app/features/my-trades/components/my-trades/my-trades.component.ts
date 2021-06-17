import { Component, OnInit } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BLOCKCHAINS } from 'src/app/shared/constants/blockchain/BLOCKCHAINS';
import { BehaviorSubject, combineLatest, Observable, Subject, zip } from 'rxjs';
import { defaultSort, TuiComparator } from '@taiga-ui/addon-table';
import { debounceTime, filter, map, share, startWith, switchMap } from 'rxjs/operators';
import { isPresent } from '@taiga-ui/cdk';
import { InstantTradesApiService } from '../../../../core/services/backend/instant-trades-api/instant-trades-api.service';
import { InstantTradesTradeData } from '../../../swaps-page-old/models/trade-data';
import SwapToken from '../../../../shared/models/tokens/SwapToken';
import { BridgeApiService } from '../../../../core/services/backend/bridge-api/bridge-api.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { BridgeTableTrade } from '../../../bridge/models/BridgeTableTrade';

interface TableToken {
  image: string;
  amount: number;
  blockchain: BLOCKCHAIN_NAME;
  symbol: string;
}

interface TableTrade {
  status: string;
  fromToken: TableToken;
  toToken: TableToken;
  date: Date;
}

type TableRowKey = 'Status' | 'From' | 'To' | 'Sent' | 'Expected' | 'Date';

interface TableRow {
  Status: string;
  From: string;
  To: string;
  Sent: number;
  Expected: number;
  Date: Date;
}

@Component({
  selector: 'app-my-trades',
  templateUrl: './my-trades.component.html',
  styleUrls: ['./my-trades.component.scss']
})
export class MyTradesComponent implements OnInit {
  public BLOCKCHAINS = BLOCKCHAINS;

  private tableTrades: TableTrade[];

  private readonly tableData$ = new Subject<TableRow[]>();

  public readonly columns: TableRowKey[] = ['Status', 'From', 'To', 'Sent', 'Expected', 'Date'];

  public readonly sorters: Record<TableRowKey, TuiComparator<TableRow>> = {
    Status: () => 0,
    From: () => 0,
    To: () => 0,
    Sent: () => 0,
    Expected: () => 0,
    Date: () => 0
  };

  public readonly sorter$ = new BehaviorSubject<TuiComparator<TableRow>>(this.sorters.Date);

  public readonly direction$ = new BehaviorSubject<-1 | 1>(-1);

  public readonly page$ = new Subject<number>();

  public readonly size$ = new Subject<number>();

  private readonly request$ = combineLatest([
    this.sorter$.pipe(map(sorter => this.getTableRowKey(sorter, this.sorters))),
    this.direction$,
    this.page$.pipe(startWith(0)),
    this.size$.pipe(startWith(10)),
    this.tableData$
  ]).pipe(
    // zero time debounce for a case when both key and direction change
    debounceTime(0),
    startWith(null),
    map(query => query && this.getData(...query)),
    share()
  );

  public readonly loading$ = this.request$.pipe(map(value => !value));

  public readonly visibleData$ = this.request$.pipe(
    filter(isPresent),
    map(tableRow => tableRow.filter(isPresent)),
    startWith([])
  );

  public readonly total$ = this.request$.pipe(
    filter(isPresent),
    map(({ length }) => length),
    startWith(1)
  );

  public walletAddress: Observable<string>;

  constructor(
    private instantTradesApiService: InstantTradesApiService,
    private bridgeApiService: BridgeApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const trades = zip(this.getBridgeTransactions(), this.getTradesTransactions());

    trades.subscribe(data => {
      const arrData = data.flat();
      this.tableTrades = arrData;
      const tableData = [];
      this.tableTrades.forEach(trade => {
        tableData.push({
          Status: trade.status,
          From: trade.fromToken.blockchain,
          To: trade.toToken.blockchain,
          Sent: trade.fromToken.amount,
          Expected: trade.toToken.amount,
          Date: trade.date
        });
      });
      this.tableData$.next(tableData);
    });
  }

  public getBridgeTransactions(): Observable<TableTrade[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => this.bridgeApiService.getTransactions(user?.address)),
      map(transactions => transactions.map(transaction => this.prepareBridgeData(transaction)))
    );
  }

  public getTradesTransactions(): Observable<TableTrade[]> {
    return this.instantTradesApiService
      .fetchSwaps()
      .pipe(
        map((transactions: InstantTradesTradeData[]) =>
          transactions.map(trade => this.prepareData(trade))
        )
      );
  }

  public prepareData(trade: InstantTradesTradeData): TableTrade {
    return {
      status: trade.status.toLowerCase(),
      fromToken: this.transformToTableToken(
        trade.token.from.image,
        trade.fromAmount,
        trade.blockchain,
        trade.token.from.symbol
      ),
      toToken: this.transformToTableToken(
        trade.token.to.image,
        trade.fromAmount,
        trade.blockchain,
        trade.token.to.symbol
      ),
      date: trade.date
    };
  }

  public prepareBridgeData(trade: BridgeTableTrade): TableTrade {
    return {
      status: trade.status,
      fromToken: this.transformToTableToken(
        trade.tokenImage,
        trade.fromAmount,
        trade.fromBlockchain,
        trade.fromSymbol
      ),
      toToken: this.transformToTableToken(
        trade.tokenImage,
        trade.toAmount,
        trade.toBlockchain,
        trade.toSymbol
      ),
      date: new Date(trade.updateTime)
    };
  }

  public transformToTableToken(image, amount, blockchain, symbol): TableToken {
    return {
      image,
      amount,
      blockchain,
      symbol
    };
  }

  private getTableRowKey(
    sorter: TuiComparator<TableRow>,
    dictionary: Record<TableRowKey, TuiComparator<TableRow>>
  ): TableRowKey {
    const pair = Object.entries(dictionary).find(
      (item): item is [TableRowKey, TuiComparator<TableRow>] => item[1] === sorter
    );
    return pair ? pair[0] : 'Date';
  }

  private getData(
    key: TableRowKey,
    direction: -1 | 1,
    page: number,
    size: number,
    tableData: TableRow[]
  ): ReadonlyArray<TableRow | null> {
    const start = page * size;
    const end = start + size;
    return [...tableData]
      .sort(this.sortBy(key, direction))
      .map((user, index) => (index >= start && index < end ? user : null));
  }

  private sortBy(key: TableRowKey, direction: -1 | 1): TuiComparator<TableRow> {
    return (a, b) => direction * defaultSort(a[key], b[key]);
  }

  public getTableTrade(tableRow: TableRow): TableTrade {
    if (!this.tableTrades.find(trade => trade.date === tableRow.Date)) {
      console.log(tableRow);
      console.log(this.tableTrades);
    }
    return this.tableTrades.find(trade => trade.date === tableRow.Date);
  }
}

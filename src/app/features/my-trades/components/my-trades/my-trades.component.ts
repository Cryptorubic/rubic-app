import { Component, OnInit } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { BLOCKCHAINS } from 'src/app/shared/constants/blockchain/BLOCKCHAINS';
import { BehaviorSubject, combineLatest, Subject, timer } from 'rxjs';
import { defaultSort, TuiComparator } from '@taiga-ui/addon-table';
import { debounceTime, filter, map, share, startWith } from 'rxjs/operators';
import { isPresent } from '@taiga-ui/cdk';
import { InstantTradesApiService } from '../../../../core/services/backend/instant-trades-api/instant-trades-api.service';
import { TradeData } from '../../../../shared/components/tokens-table/models/tokens-table-data';
import { InstantTradesTradeData } from '../../../swaps-page-old/models/trade-data';
import { InstantTradesResponseApi } from '../../../../core/services/backend/instant-trades-api/types/trade-api';

interface TableToken extends BlockchainToken {
  image: string;
  amount: number;
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

// example
const ethToken: TableToken = {
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: NATIVE_TOKEN_ADDRESS,
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  image: 'http://dev-api.rubic.exchange/media/token_images/cg_logo_ETH_ethereum_4jp3DKD.png',
  amount: 50
};

const bscToken: TableToken = {
  blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  address: NATIVE_TOKEN_ADDRESS,
  name: 'Binance',
  symbol: 'BNB',
  decimals: 18,
  image:
    'https://dev-api.rubic.exchange/media/token_images/cg_logo_bnb_binance-coin-logo_7bZIPmd.png',
  amount: 50
};

@Component({
  selector: 'app-my-trades',
  templateUrl: './my-trades.component.html',
  styleUrls: ['./my-trades.component.scss']
})
export class MyTradesComponent implements OnInit {
  public BLOCKCHAINS = BLOCKCHAINS;

  private readonly tableTrades: TableTrade[] = [
    {
      status: 'Waiting for deposit',
      fromToken: bscToken,
      toToken: ethToken,
      date: new Date(Date.now())
    },
    {
      status: 'Completed',
      fromToken: ethToken,
      toToken: bscToken,
      date: new Date(Date.now() - 60000)
    },
    {
      status: 'Cancelled',
      fromToken: ethToken,
      toToken: bscToken,
      date: new Date(Date.now() - 3600000)
    }
  ];

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

  constructor(private instantTradesApiService: InstantTradesApiService) {}

  ngOnInit(): void {
    // mock request
    // timer(1500).subscribe(() => {
    //   if (this.tableTrades.length) {
    //     for (let i = 0; i < 20; ++i) {
    //       this.tableTrades.push(this.tableTrades[i % 3]);
    //     }
    //     const tableData = [];
    //     this.tableTrades.forEach(trade => {
    //       tableData.push({
    //         Status: trade.status,
    //         From: trade.fromToken.blockchain,
    //         To: trade.toToken.blockchain,
    //         Sent: trade.fromToken.amount,
    //         Expected: trade.toToken.amount,
    //         Date: trade.date
    //       });
    //     });
    //     console.log(tableData);
    //     this.tableData$.next(tableData);
    //   } else {
    //     this.tableData$.next([]);
    //   }
    // });

    this.instantTradesApiService
      .fetchSwaps()
      .pipe(map((trades: InstantTradesTradeData[]) => trades.map(trade => this.prepareData(trade))))
      .subscribe(data => {
        if (data.length > 0) {
          this.tableData$.next(data);
        } else {
          this.tableData$.next([]);
        }
      });
  }

  public prepareData(trade: InstantTradesTradeData) {
    return {
      Status: trade.status,
      From: trade.token.from.blockchain,
      To: trade.token.to.blockchain,
      Sent: 4234,
      Expected: 324,
      Date: new Date()
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

  public getTableTrade(tableRow: any): TableTrade {
    return this.tableTrades.find(trade => trade.date === tableRow.Date);
  }
}

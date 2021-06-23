import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription, zip } from 'rxjs';
import { defaultSort, TuiComparator } from '@taiga-ui/addon-table';
import { debounceTime, filter, map, share, startWith, takeWhile } from 'rxjs/operators';
import { isPresent } from '@taiga-ui/cdk';
import { InstantTradesApiService } from 'src/app/core/services/backend/instant-trades-api/instant-trades-api.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { List } from 'immutable';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { WalletsModalComponent } from 'src/app/core/header/components/header/components/wallets-modal/wallets-modal.component';
import { TuiDialogService, TuiNotification, TuiNotificationsService } from '@taiga-ui/core';
import { MyTradesService } from 'src/app/features/my-trades/services/my-trades.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { TableProvider, TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';
import { TRADES_PROVIDERS } from 'src/app/features/my-trades/constants/TRADES_PROVIDERS';
import { BLOCKCHAINS } from 'src/app/features/my-trades/constants/BLOCKCHAINS';
import BigNumber from 'bignumber.js';

type TableRowKey = 'Status' | 'FromTo' | 'Provider' | 'Sent' | 'Expected' | 'Date';

interface TableRow {
  Status: TRANSACTION_STATUS;
  FromTo: string;
  Provider: TableProvider;
  Sent: BigNumber;
  Expected: BigNumber;
  Date: Date;

  inProgress: boolean;
}

@Component({
  selector: 'app-my-trades',
  templateUrl: './my-trades.component.html',
  styleUrls: ['./my-trades.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyTradesComponent implements OnInit, OnDestroy {
  public TRANSACTION_STATUS = TRANSACTION_STATUS;

  public BLOCKCHAINS = BLOCKCHAINS;

  public TRADES_PROVIDERS = TRADES_PROVIDERS;

  private tableTrades: TableTrade[];

  private readonly tableData$ = new BehaviorSubject<TableRow[]>(null);

  public readonly columns: TableRowKey[] = [
    'Status',
    'FromTo',
    'Provider',
    'Sent',
    'Expected',
    'Date'
  ];

  public readonly sorters: Record<TableRowKey, TuiComparator<any>> = {
    Status: () => 0,
    FromTo: () => 0,
    Provider: () => 0,
    Sent: (a: BigNumber, b: BigNumber) => a.comparedTo(b),
    Expected: (a: BigNumber, b: BigNumber) => a.comparedTo(b),
    Date: () => 0
  };

  public readonly sorter$ = new BehaviorSubject<TuiComparator<TableRow>>(this.sorters.Date);

  public readonly direction$ = new BehaviorSubject<-1 | 1>(-1);

  public readonly page$ = new Subject<number>();

  public readonly size$ = new Subject<number>();

  private request$ = combineLatest([
    this.sorter$.pipe(map(sorter => this.getTableRowKey(sorter, this.sorters))),
    this.direction$,
    this.page$.pipe(startWith(0)),
    this.size$.pipe(startWith(10)),
    this.tableData$.pipe(filter(isPresent))
  ]).pipe(
    // zero time debounce for a case when both key and direction change
    debounceTime(0),
    map(query => query && this.getData(...query)),
    share()
  );

  public readonly loading$ = new BehaviorSubject<boolean>(true);

  public loadingStatus: 'refreshing' | 'stopped' | '' = 'refreshing';

  public readonly visibleData$ = this.request$.pipe(
    filter(isPresent),
    map(visibleTableData => {
      setTimeout(() => {
        this.loading$.next(false);
        this.loadingStatus = 'stopped';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.loadingStatus = '';
          this.cdr.detectChanges();
        }, 1000);
      });

      return visibleTableData.filter(isPresent);
    }),
    startWith([])
  );

  public readonly total$ = this.request$.pipe(
    filter(isPresent),
    map(({ length }) => length),
    startWith(1)
  );

  private tokens: List<TokenAmount>;

  public walletAddress: string;

  private userSubscription$: Subscription;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly myTradesService: MyTradesService,
    private readonly instantTradesApiService: InstantTradesApiService,
    private readonly bridgeApiService: BridgeApiService,
    private readonly tokensService: TokensService,
    private readonly authService: AuthService,
    private readonly translate: TranslateService,
    private readonly notificationsService: TuiNotificationsService,
    private errorsService: ErrorsService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  ngOnInit(): void {
    this.userSubscription$ = combineLatest([
      this.authService.getCurrentUser().pipe(filter(user => user !== undefined)),
      this.tokensService.tokens.pipe(takeWhile(tokens => tokens.size === 0, true))
    ]).subscribe(([user, tokens]) => {
      this.tokens = tokens;
      this.walletAddress = user?.address || null;

      this.setTableData();
    });
  }

  ngOnDestroy(): void {
    this.userSubscription$.unsubscribe();
  }

  private setTableData(): void {
    this.loading$.next(true);
    this.loadingStatus = 'refreshing';
    this.cdr.detectChanges();

    if (!this.walletAddress) {
      this.tableData$.next([]);
      return;
    }

    if (!this.tokens.size) {
      return;
    }

    zip(
      this.getBridgeTransactions(),
      this.instantTradesApiService.getUserTrades(this.walletAddress)
    ).subscribe(data => {
      this.tableTrades = data.flat();
      const tableData: TableRow[] = [];
      this.tableTrades.forEach(trade => {
        tableData.push({
          Status: trade.status,
          FromTo: trade.fromToken.blockchain + trade.toToken.blockchain,
          Provider: trade.provider,
          Sent: new BigNumber(trade.fromToken.amount),
          Expected: new BigNumber(trade.toToken.amount),
          Date: trade.date,

          inProgress: false
        });
      });
      this.tableData$.next(tableData);
    });
  }

  private getBridgeTransactions(): Observable<TableTrade[]> {
    return this.bridgeApiService
      .getUserTrades(this.walletAddress)
      .pipe(
        map(transactions => transactions.map(transaction => this.prepareBridgeData(transaction)))
      );
  }

  private prepareBridgeData(trade: TableTrade): TableTrade {
    let fromSymbol = trade.fromToken.symbol;
    let toSymbol = trade.toToken.symbol;
    if (
      trade.fromToken.blockchain === BLOCKCHAIN_NAME.POLYGON ||
      trade.toToken.blockchain === BLOCKCHAIN_NAME.POLYGON
    ) {
      fromSymbol = this.tokens.find(
        token =>
          token.blockchain === trade.fromToken.blockchain &&
          token.address.toLowerCase() === fromSymbol.toLowerCase()
      ).symbol;
      toSymbol = this.tokens.find(
        token =>
          token.blockchain === trade.toToken.blockchain &&
          token.address.toLowerCase() === toSymbol.toLowerCase()
      ).symbol;
    }

    return {
      ...trade,
      fromToken: {
        ...trade.fromToken,
        symbol: fromSymbol
      },
      toToken: {
        ...trade.toToken,
        symbol: fromSymbol
      }
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
    return (a, b) => {
      let sort;
      if (key === 'Sent' || key === 'Expected') {
        sort = this.sorters[key];
      } else {
        sort = defaultSort;
      }
      return direction * sort(a[key], b[key]);
    };
  }

  public refreshTable(): void {
    if (!this.loading$.getValue()) {
      this.setTableData();
    }
  }

  public showConnectWalletModal(): void {
    this.dialogService
      .open(new PolymorpheusComponent(WalletsModalComponent, this.injector), { size: 's' })
      .subscribe();
  }

  public getTableTrade(tableRow: TableRow): TableTrade {
    return this.tableTrades.find(trade => trade.date.getTime() === tableRow.Date.getTime());
  }

  public receivePolygonBridgeTrade(trade: TableTrade): void {
    let tableData = this.tableData$.getValue().map(tableTrade => {
      if (tableTrade.Date.getTime() === trade.date.getTime()) {
        return {
          ...tableTrade,
          inProgress: true
        };
      }
      return tableTrade;
    });
    this.tableData$.next(tableData);

    let tradeInProgressSubscription$: Subscription;
    const onTransactionHash = () => {
      tradeInProgressSubscription$ = this.notificationsService
        .show(this.translate.instant('bridgePage.progressMessage'), {
          label: 'Trade in progress',
          status: TuiNotification.Info,
          autoClose: false
        })
        .subscribe();
    };

    this.myTradesService
      .depositPolygonBridgeTradeAfterCheckpoint(trade.transactionHash, onTransactionHash)
      .subscribe(
        _receipt => {
          tradeInProgressSubscription$.unsubscribe();
          this.notificationsService
            .show(this.translate.instant('bridgePage.successMessage'), {
              label: 'Successful trade',
              status: TuiNotification.Success,
              autoClose: 15000
            })
            .subscribe();

          this.refreshTable();
        },
        err => {
          tradeInProgressSubscription$?.unsubscribe();
          this.errorsService.catch$(err);

          tableData = this.tableData$.getValue().map(tableTrade => ({
            ...tableTrade,
            inProgress: false
          }));
          this.tableData$.next(tableData);
        }
      );
  }
}

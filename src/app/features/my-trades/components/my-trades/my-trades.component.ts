import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { WalletsModalComponent } from 'src/app/core/header/components/header/components/wallets-modal/wallets-modal.component';
import { TuiDialogService, TuiNotification, TuiNotificationsService } from '@taiga-ui/core';
import { MyTradesService } from 'src/app/features/my-trades/services/my-trades.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import BigNumber from 'bignumber.js';
import { TableRow } from 'src/app/features/my-trades/components/my-trades/models/TableRow';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { defaultSort } from '@taiga-ui/addon-table';
import { RefreshButtonStatus } from 'src/app/shared/components/rubic-refresh-button/rubic-refresh-button.component';

const DESKTOP_WIDTH = 1240;

@Component({
  selector: 'app-my-trades',
  templateUrl: './my-trades.component.html',
  styleUrls: ['./my-trades.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyTradesComponent implements OnInit, OnDestroy {
  public readonly tableData$ = new BehaviorSubject<TableRow[]>(undefined);

  public loading = true;

  public loadingStatus: RefreshButtonStatus;

  public isDesktop: boolean;

  public walletAddress: string;

  private userSubscription$: Subscription;

  private isDataUpdatingSubscription$: Subscription;

  private tableTradesSubscription$: Subscription;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly myTradesService: MyTradesService,
    private readonly authService: AuthService,
    private readonly translate: TranslateService,
    private readonly notificationsService: TuiNotificationsService,
    private readonly errorsService: ErrorsService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly tokensService: TokensService
  ) {}

  ngOnInit(): void {
    this.isDesktop = window.innerWidth >= DESKTOP_WIDTH;
    this.loadingStatus = 'refreshing';

    this.userSubscription$ = this.authService.getCurrentUser().subscribe(user => {
      this.walletAddress = user?.address || null;
    });

    this.isDataUpdatingSubscription$ = this.myTradesService.isDataUpdating$.subscribe(() => {
      this.loading = true;
      this.loadingStatus = 'refreshing';
      this.cdr.detectChanges();
    });

    this.tableTradesSubscription$ = this.myTradesService.tableTrades$.subscribe(tableTrades => {
      if (tableTrades) {
        this.updateTableData(tableTrades);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription$.unsubscribe();
    this.isDataUpdatingSubscription$.unsubscribe();
    this.tableTradesSubscription$.unsubscribe();
  }

  private updateTableData(tableTrades: TableTrade[]): void {
    let tableData: TableRow[] = [];
    tableTrades.forEach(trade => {
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
    tableData = tableData.sort((a, b) => defaultSort(a.Date, b.Date) * -1);
    this.tableData$.next(tableData);

    setTimeout(() => {
      this.loading = false;
      this.loadingStatus = 'stopped';
      this.cdr.detectChanges();
    });
  }

  public refreshTable(): void {
    if (!this.loading) {
      this.loading = true;
      this.loadingStatus = 'refreshing';
      this.myTradesService.updateTableTrades();
    }
  }

  public showConnectWalletModal(): void {
    this.dialogService
      .open(new PolymorpheusComponent(WalletsModalComponent, this.injector), { size: 's' })
      .subscribe();
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
          label: this.translate.instant('notifications.tradeInProgress'),
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
              label: this.translate.instant('notifications.successfulTradeTitle'),
              status: TuiNotification.Success,
              autoClose: 15000
            })
            .subscribe();

          this.refreshTable();

          this.tokensService.recalculateUsersBalance();
        },
        err => {
          tradeInProgressSubscription$?.unsubscribe();

          tableData = this.tableData$.getValue().map(tableTrade => ({
            ...tableTrade,
            inProgress: false
          }));
          this.tableData$.next(tableData);

          this.errorsService.catch$(err);
        }
      );
  }

  @HostListener('window:resize')
  private onResize() {
    this.isDesktop = window.innerWidth >= DESKTOP_WIDTH;
  }
}

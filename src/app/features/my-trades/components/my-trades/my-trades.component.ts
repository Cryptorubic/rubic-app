import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnInit
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TuiNotification } from '@taiga-ui/core';
import { MyTradesService } from 'src/app/features/my-trades/services/my-trades.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import BigNumber from 'bignumber.js';
import { TableRow } from 'src/app/features/my-trades/components/my-trades/models/TableRow';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { defaultSort } from '@taiga-ui/addon-table';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { CounterNotificationsService } from 'src/app/core/services/counter-notifications/counter-notifications.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { first, takeUntil } from 'rxjs/operators';
import { WalletsModalService } from 'src/app/core/wallets/services/wallets-modal.service';
import { WINDOW } from '@ng-web-apis/common';

const DESKTOP_WIDTH = 1240;

@Component({
  selector: 'app-my-trades',
  templateUrl: './my-trades.component.html',
  styleUrls: ['./my-trades.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class MyTradesComponent implements OnInit {
  public readonly tableData$ = new BehaviorSubject<TableRow[]>(undefined);

  public loading = true;

  public isDesktop: boolean;

  public walletAddress: string;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly myTradesService: MyTradesService,
    private readonly authService: AuthService,
    private readonly translate: TranslateService,
    private readonly errorsService: ErrorsService,
    private readonly walletsModalService: WalletsModalService,
    private readonly tokensService: TokensService,
    private readonly notificationsService: NotificationsService,
    private readonly counterNotificationsService: CounterNotificationsService,
    private readonly destroy$: TuiDestroyService,
    @Inject(WINDOW) private readonly window: Window
  ) {}

  ngOnInit(): void {
    this.counterNotificationsService.resetCounter();
    this.isDesktop = this.window.innerWidth >= DESKTOP_WIDTH;

    this.authService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.walletAddress = user?.address || null;
        this.loading = true;

        if (this.walletAddress) {
          this.myTradesService
            .updateTableTrades()
            .pipe(first())
            .subscribe(trades => {
              this.updateTableData(trades);
            });
        } else {
          this.tableData$.next([]);
          this.loading = false;
        }

        this.cdr.detectChanges();
      });
  }

  private updateTableData(tableTrades: TableTrade[]): void {
    let tableData: TableRow[] = [];
    tableTrades.forEach(trade => {
      tableData.push({
        Status: trade.status,
        FromTo: trade.fromToken?.blockchain + trade.toToken.blockchain,
        Provider: trade.provider,
        Sent: new BigNumber(trade.fromToken?.amount),
        Expected: new BigNumber(trade.toToken.amount),
        Date: trade.date,

        inProgress: false
      });
    });
    tableData = tableData.sort((a, b) => defaultSort(a.Date, b.Date) * -1);
    this.tableData$.next(tableData);

    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  public refreshTable(): void {
    this.loading = true;
    this.myTradesService
      .updateTableTrades()
      .pipe(first())
      .subscribe(trades => this.updateTableData(trades));
  }

  public showConnectWalletModal(): void {
    this.walletsModalService.open$();
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
      tradeInProgressSubscription$ = this.notificationsService.show(
        this.translate.instant('bridgePage.progressMessage'),
        {
          label: this.translate.instant('notifications.tradeInProgress'),
          status: TuiNotification.Info,
          autoClose: false
        }
      );
    };

    this.myTradesService
      .depositPolygonBridgeTradeAfterCheckpoint(trade.transactionHash, onTransactionHash)
      .subscribe(
        async _receipt => {
          tradeInProgressSubscription$.unsubscribe();
          this.notificationsService.show(this.translate.instant('bridgePage.successMessage'), {
            label: this.translate.instant('notifications.successfulTradeTitle'),
            status: TuiNotification.Success,
            autoClose: 15000
          });

          this.refreshTable();

          await this.tokensService.calculateUserTokensBalances();
        },
        err => {
          tradeInProgressSubscription$?.unsubscribe();

          tableData = this.tableData$.getValue().map(tableTrade => ({
            ...tableTrade,
            inProgress: false
          }));
          this.tableData$.next(tableData);

          this.errorsService.catch(err);
        }
      );
  }

  @HostListener('window:resize')
  private onResize() {
    this.isDesktop = this.window.innerWidth >= DESKTOP_WIDTH;
  }
}

import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { List } from 'immutable';
import date from 'date-and-time';
import { finalize, first } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { MetamaskError } from 'src/app/shared/models/errors/provider/MetamaskError';
import { NetworkErrorComponent } from 'src/app/shared/components/network-error/network-error.component';
import { MessageBoxComponent } from 'src/app/shared/components/message-box/message-box.component';
import { TRADE_STATUS } from 'src/app/core/services/backend/bridge-api/models/TRADE_STATUS';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import { BridgeService } from '../../services/bridge.service';
import { BridgeTableTrade } from '../../models/BridgeTableTrade';
import { TRADE_STATUS } from '../../../../core/services/backend/bridge-api/models/TRADE_STATUS';

interface ITableTransactionWithState extends BridgeTableTrade {
  opened: boolean;
  inProgress?: boolean;
}

const TRANSACTION_PAGE_SIZE = 5;

enum SORT_FIELD {
  STATUS = 'Status',
  FROM = 'From',
  TO = 'To',
  SEND = 'Send',
  GET = 'Get',
  DATE = 'Date'
}

@Component({
  selector: 'app-bridge-table',
  templateUrl: './bridge-table.component.html',
  styleUrls: ['./bridge-table.component.scss']
})
export class BridgeTableComponent implements OnInit, OnDestroy {
  public Blockchains = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
      label: 'Ethereum',
      img: 'eth.png'
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
      label: 'Binance Smart Chain',
      img: 'bnb.svg'
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
      label: 'Polygon',
      img: 'polygon.svg'
    },
    [BLOCKCHAIN_NAME.TRON]: {
      label: 'TRON',
      img: 'tron.svg'
    }
  };

  public BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  public TRADE_STATUS = TRADE_STATUS;

  public SORT_FIELD = SORT_FIELD;

  public readonly WAITING_FOR_RECEIVING_STATUS = 'Waiting for receiving';

  public transactions: List<ITableTransactionWithState>;

  /**
   * Contains transactions, which are shown to user. Updated through 'show more' button.
   */
  public visibleTransactions: List<ITableTransactionWithState> = List([]);

  private transactionPages = 1;

  private _transactionsSubscription$: Subscription;

  public tableInitLoading = true;

  public updateProcess = '';

  public sortOptions: {
    field: SORT_FIELD;
    downDirection: boolean;
  };

  public sortFields = Object.values(SORT_FIELD);

  public selectedSortField: SORT_FIELD;

  public isShowMoreActive = true;

  private readonly minDesktopWidth = 1024;

  public isDesktop: boolean;

  public tradeInProgress: boolean = false;

  public tradeSuccessId: string;

  constructor(
    private bridgeService: BridgeService,
    private dialog: MatDialog,
    private readonly translateService: TranslateService
  ) {}

  private static sortByDate(a: string, b: string): number {
    const date1 = new Date(date.transform(a, 'D-M-YYYY H:m', 'YYYY/MM/DD HH:mm:ss'));
    const date2 = new Date(date.transform(b, 'D-M-YYYY H:m', 'YYYY/MM/DD HH:mm:ss'));
    return date.subtract(date2, date1).toMilliseconds();
  }

  private static sortByNumber(a: number, b: number): number {
    return b - a;
  }

  public static capitalize(value: string): string {
    return value[0].toUpperCase() + value.slice(1);
  }

  ngOnInit(): void {
    this._transactionsSubscription$ = this.bridgeService.transactions.subscribe(transactions => {
      if (!transactions) {
        return;
      }

      this.transactions = transactions
        .sort((a, b) => BridgeTableComponent.sortByDate(a.updateTime, b.updateTime))
        .map(tx => ({
          ...tx,
          opened: false
        }));
      this.visibleTransactions = this.transactions.slice(0, TRANSACTION_PAGE_SIZE);

      this.sortOptions = {
        field: null,
        downDirection: null
      };
      this.sortTransactions(SORT_FIELD.DATE);

      this.checkIsShowMoreActive();
    });

    this.checkIsDesktop();
  }

  ngOnDestroy() {
    this._transactionsSubscription$.unsubscribe();
  }

  public updateTransactionsList() {
    if (!this.updateProcess) {
      this.updateProcess = 'progress';
      this.bridgeService.updateTransactionsList().finally(() => {
        this.updateProcess = 'stop';
        setTimeout(() => {
          this.updateProcess = '';
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        }, 1200);
      });
    }
  }

  public sortTransactions(field: SORT_FIELD) {
    if (field === this.sortOptions.field) {
      this.sortOptions.downDirection = !this.sortOptions.downDirection;
      this.visibleTransactions = this.visibleTransactions.reverse();
    } else {
      switch (field) {
        case SORT_FIELD.STATUS:
          this.visibleTransactions = this.visibleTransactions.sort((a, b) =>
            a.status > b.status ? -1 : 1
          );
          break;
        case SORT_FIELD.FROM:
          this.visibleTransactions = this.visibleTransactions.sort((a, b) =>
            a.fromBlockchain > b.fromBlockchain ? -1 : 1
          );
          break;
        case SORT_FIELD.TO:
          this.visibleTransactions = this.visibleTransactions.sort((a, b) =>
            a.toBlockchain > b.toBlockchain ? -1 : 1
          );
          break;
        case SORT_FIELD.SEND:
          this.visibleTransactions = this.visibleTransactions.sort((a, b) =>
            BridgeTableComponent.sortByNumber(parseFloat(a.fromAmount), parseFloat(b.fromAmount))
          );
          break;
        case SORT_FIELD.GET:
          this.visibleTransactions = this.visibleTransactions.sort((a, b) =>
            BridgeTableComponent.sortByNumber(parseFloat(a.toAmount), parseFloat(b.toAmount))
          );
          break;
        case SORT_FIELD.DATE:
          this.visibleTransactions = this.visibleTransactions.sort((a, b) =>
            BridgeTableComponent.sortByDate(a.updateTime, b.updateTime)
          );
          break;
        default:
          break;
      }

      this.sortOptions = {
        field,
        downDirection: true
      };
      this.selectedSortField = field;
    }
  }

  public getArrowImg(field: SORT_FIELD) {
    if (field !== this.sortOptions.field) {
      return 'assets/images/bridge/Arrows.svg';
    }
    return `assets/images/bridge/${
      this.sortOptions.downDirection ? 'Arrows-down.svg' : 'Arrows-up.svg'
    }`;
  }

  private checkIsShowMoreActive(): void {
    this.isShowMoreActive = this.visibleTransactions.size < this.transactions.size;
  }

  public addNextTransactionPage(): void {
    this.transactionPages++;
    const end = this.transactionPages * TRANSACTION_PAGE_SIZE;
    this.visibleTransactions = this.transactions.slice(0, end);

    const sortField = this.sortOptions.field;
    this.sortOptions = {
      field: null,
      downDirection: null
    };
    this.sortTransactions(sortField);

    this.checkIsShowMoreActive();
  }

  public depositPolygonBridgeTransaction(transaction: BridgeTableTrade): void {
    if (
      transaction.status !== this.WAITING_FOR_RECEIVING_STATUS ||
      transaction.fromBlockchain !== BLOCKCHAIN_NAME.POLYGON
    ) {
      return;
    }

    const burnTransactionHash = transaction.transactionHash;
    this.setTransactionInProgress(burnTransactionHash, true);
    const onTransactionHash = () => {
      this.tradeInProgress = true;
    };
    this.bridgeService
      .depositPolygonTradeAfterCheckpoint(burnTransactionHash, onTransactionHash)
      .pipe(
        first(),
        finalize(() => {
          this.tradeInProgress = false;
          this.setTransactionInProgress(burnTransactionHash, false);
        })
      )
      .subscribe(
        (res: string) => {
          this.tradeSuccessId = res;
        },
        err => {
          if (!(err instanceof RubicError)) {
            err = new RubicError(this.translateService);
          }
          let data: any = { title: 'Error', descriptionText: err.comment };
          if (err instanceof MetamaskError) {
            data.title = 'Warning';
          }
          if (err instanceof NetworkError) {
            data = {
              title: 'Error',
              descriptionComponentClass: NetworkErrorComponent,
              descriptionComponentInputs: { networkError: err }
            };
          }
          this.dialog.open(MessageBoxComponent, {
            width: '400px',
            data
          });
        }
      );
  }

  private setTransactionInProgress(transactionHash: string, inProgress: boolean): void {
    this.transactions = this.transactions.map(tx => {
      if (tx.transactionHash === transactionHash) {
        return {
          ...tx,
          inProgress
        };
      }
      return tx;
    });
    const end = this.transactionPages * TRANSACTION_PAGE_SIZE;
    this.visibleTransactions = this.transactions.slice(0, end);
  }

  @HostListener('window:resize', ['$event'])
  private checkIsDesktop(): void {
    this.isDesktop = window.innerWidth > this.minDesktopWidth;
  }
}

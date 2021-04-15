import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { List } from 'immutable';
import date from 'date-and-time';
import { BridgeService } from 'src/app/features/bridge-page/services/bridge.service';
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { RubicError } from '../../../../shared/models/errors/RubicError';
import { MetamaskError } from '../../../../shared/models/errors/provider/MetamaskError';
import { NetworkError } from '../../../../shared/models/errors/provider/NetworkError';
import { NetworkErrorComponent } from '../../../../shared/components/network-error/network-error.component';
import { MessageBoxComponent } from '../../../../shared/components/message-box/message-box.component';
import { BridgeTableTrade } from '../../models/BridgeTableTrade';

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
    }
  };

  public BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  public SORT_FIELD = SORT_FIELD;

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

  constructor(private bridgeService: BridgeService, private dialog: MatDialog) {}

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
      transaction.status !== 'Waiting for deposit' ||
      transaction.fromBlockchain !== BLOCKCHAIN_NAME.POLYGON
    ) {
      return;
    }

    this.transactions = this.transactions.map(tx => {
      if (tx.transactionHash === transaction.transactionHash) {
        return {
          ...tx,
          inProgress: true
        };
      }
      return tx;
    });

    const burnTransactionHash = transaction.transactionHash;
    const onTransactionHash = () => {
      this.tradeInProgress = true;
    };

    this.bridgeService
      .depositPolygonTradeAfterCheckpoint(burnTransactionHash, onTransactionHash)
      .pipe(first())
      .subscribe(
        (res: string) => {
          this.tradeSuccessId = res;
          this.tradeInProgress = false;
        },
        err => {
          this.tradeInProgress = false;
          if (!(err instanceof RubicError)) {
            err = new RubicError();
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

  @HostListener('window:resize', ['$event'])
  private checkIsDesktop(): void {
    this.isDesktop = window.innerWidth > this.minDesktopWidth;
  }
}

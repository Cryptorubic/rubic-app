import { Component, HostListener } from '@angular/core';
import { List } from 'immutable';
import date from 'date-and-time';
import { BridgeService } from 'src/app/features/bridge-page/services/bridge.service';
import { BridgeTableTransaction } from '../../models/BridgeTableTransaction';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';

interface ITableTransactionWithState extends BridgeTableTransaction {
  opened: boolean;
}

const TRANSACTION_PAGE_SIZE = 5;

@Component({
  selector: 'app-bridge-table',
  templateUrl: './bridge-table.component.html',
  styleUrls: ['./bridge-table.component.scss']
})
export class BridgeTableComponent {
  public Blockchains = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
      label: 'Ethereum',
      img: 'eth.png',
      symbolPropName: 'ethSymbol'
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
      label: 'Binance Smart Chain',
      img: 'bnb.svg',
      symbolPropName: 'bscSymbol'
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
      label: 'Polygon',
      img: 'polygon.svg',
      symbolPropName: 'bscSymbol'
    }
  };

  private transactionBlockchain = {
    ETH: BLOCKCHAIN_NAME.ETHEREUM,
    BSC: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    POL: BLOCKCHAIN_NAME.POLYGON
  };

  /**
   * Transactions are sorted by date first.
   */
  public transactions: List<ITableTransactionWithState>;

  /**
   * Contains transactions, which are shown to user. Updated through 'show more' button.
   */
  public visibleTransactions: List<ITableTransactionWithState> = List([]);

  private transactionPages = 1;

  public tableInitLoading = true;

  public updateProcess = '';

  public sort = { fieldName: 'date', downDirection: true }; // Date is default to sort by

  public selectedOption = 'Date'; // Capitalized sort.fieldName

  public options = ['Status', 'From', 'To', 'Spent', 'Expected', 'Date'];

  public isShowMoreActive = true;

  private minDesktopWidth = 1024;

  public isDesktop: boolean;

  constructor(private bridgeService: BridgeService) {
    bridgeService.transactions.subscribe(transactions => {
      this.transactions = transactions.map(tx => ({
        ...tx,
        fromNetwork: this.transactionBlockchain[tx.fromNetwork],
        toNetwork: this.transactionBlockchain[tx.toNetwork],
        opened: false
      }));
      this.sort = { fieldName: null, downDirection: null };
      this.onSortClick('date');

      this.visibleTransactions = this.transactions.slice(0, TRANSACTION_PAGE_SIZE);
      this.checkIsShowMoreActive();
    });

    this.checkIfDesktop();
  }

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

  public onUpdate() {
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

  public onSortClick(fieldName: string) {
    fieldName = fieldName.toLowerCase();

    if (fieldName === this.sort.fieldName) {
      this.sort.downDirection = !this.sort.downDirection;
      this.transactions = this.transactions.reverse();
    } else {
      switch (fieldName) {
        case 'status':
          this.transactions = this.transactions.sort((a, b) => (a.status > b.status ? -1 : 1));
          break;
        case 'from':
          this.transactions = this.transactions.sort((a, b) =>
            a.fromNetwork > b.fromNetwork ? -1 : 1
          );
          break;
        case 'to':
          this.transactions = this.transactions.sort((a, b) =>
            a.toNetwork > b.toNetwork ? -1 : 1
          );
          break;
        case 'spent':
          this.transactions = this.transactions.sort((a, b) =>
            BridgeTableComponent.sortByNumber(a.actualFromAmount, b.actualFromAmount)
          );
          break;
        case 'expected':
          this.transactions = this.transactions.sort((a, b) =>
            BridgeTableComponent.sortByNumber(a.actualToAmount, b.actualToAmount)
          );
          break;
        case 'date':
          this.transactions = this.transactions.sort((a, b) =>
            BridgeTableComponent.sortByDate(a.updateTime, b.updateTime)
          );
          break;
        default:
          break;
      }

      this.sort.fieldName = fieldName;
      this.sort.downDirection = true;
      this.selectedOption = BridgeTableComponent.capitalize(this.sort.fieldName);
    }
  }

  public getArrow(fieldName: string) {
    fieldName = fieldName.toLowerCase();
    if (fieldName !== this.sort.fieldName) {
      return 'Arrows.svg';
    }
    return this.sort.downDirection ? 'Arrows-down.svg' : 'Arrows-up.svg';
  }

  public capitalize(word: string): string {
    return word[0].toUpperCase() + word.slice(1);
  }

  @HostListener('window:resize', ['$event'])
  private checkIfDesktop(): void {
    this.isDesktop = window.innerWidth > this.minDesktopWidth;
  }

  private checkIsShowMoreActive(): void {
    this.isShowMoreActive = this.visibleTransactions.size < this.transactions.size;
  }

  public addNextTransactionPage(): void {
    this.transactionPages++;
    const end = this.transactionPages * TRANSACTION_PAGE_SIZE;
    this.visibleTransactions = this.transactions.slice(0, end);
    this.checkIsShowMoreActive();
  }
}

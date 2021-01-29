import {Component, HostListener, OnInit} from '@angular/core';
import {BridgeService} from '../../services/bridge/bridge.service';
import {BridgeNetwork, ITableTransaction} from '../../services/bridge/types';
import {List} from 'immutable';
import date from 'date-and-time';

@Component({
  selector: 'app-bridge-table',
  templateUrl: './bridge-table.component.html',
  styleUrls: ['./bridge-table.component.scss']
})
export class BridgeTableComponent implements OnInit {

  public Blockchains = {
    [BridgeNetwork.ETHEREUM] : {
      label: 'Ethereum',
      img: 'eth.png',
      symbolPropName: 'ethSymbol'
    },
    [BridgeNetwork.BINANCE_SMART_CHAIN]: {
      label: 'Binance Smart Chain',
      img: 'bnb.svg',
      symbolPropName: 'bscSymbol'
    }
  };

  public transactions: List<ITableTransaction> = List([]);
  public updateProcess = '';
  public sort = { fieldName: 'date', downDirection: true }; // Date is default to sort by
  public selectedOption = 'Date'; // Capitalized sort.fieldName

  public options = ['Status', 'From', 'To', 'Spent', 'Expected', 'Date'];

  private minDesktopWidth = 1024;
  public isDesktop = true;

  constructor(private bridgeService: BridgeService) {
    bridgeService.transactions.subscribe(transactions => {
      console.log('update table');
      this.transactions = transactions;
      this.transactions.map((tx) => tx.opened = false);
      this.sort = { fieldName: null, downDirection: null};
      this.onSortClick('date');
    });

    this.checkIfDesktop();
  }

  private static sortByDate(a: string, b: string): number  {
    const date1 = new Date(date.transform(a, 'D-M-YYYY H:m', 'YYYY/MM/DD HH:mm:ss'));
    const date2 = new Date(date.transform(b, 'D-M-YYYY H:m', 'YYYY/MM/DD HH:mm:ss'));
    return date.subtract(date2, date1).toMilliseconds();
  }

  private static sortByNumber(a: number, b: number): number {
    return b - a;
  }

  ngOnInit() {
  }

  public onUpdate() {
    if (!this.updateProcess) {
      this.updateProcess = 'progress';
      this.bridgeService.updateTransactionsList().finally(() => {
        this.updateProcess = 'stop';
        setTimeout(() => this.updateProcess = '', 1200);
      });
    }
  }

  public onSortClick(fieldName: string) {
    fieldName = fieldName.toLowerCase();

    if (fieldName === this.sort.fieldName) {
      this.sort.downDirection = !this.sort.downDirection;
      this.transactions = this.transactions.reverse();
    } else  {
      switch (fieldName) {
        case 'status':
          this.transactions = this.transactions.sort((a, b) =>
              a.status > b.status ? -1 : 1);
          break;
        case 'from':
          this.transactions = this.transactions.sort((a, b) =>
              a.fromNetwork > b.fromNetwork ? -1 : 1);
          break;
        case 'to':
          this.transactions = this.transactions.sort((a, b) =>
              a.toNetwork > b.toNetwork ? -1 : 1);
          break;
        case 'spent':
          this.transactions = this.transactions.sort((a, b) =>
              BridgeTableComponent.sortByNumber(a.actualFromAmount, b.actualFromAmount));
          break;
        case 'expected':
          this.transactions = this.transactions.sort((a, b) =>
              BridgeTableComponent.sortByNumber(a.actualToAmount, b.actualToAmount));
          break;
        case 'date':
          this.transactions = this.transactions.sort((a, b) =>
              BridgeTableComponent.sortByDate(a.updateTime, b.updateTime));
          break;
      }

      this.sort.fieldName = fieldName;
      this.sort.downDirection = true;
      this.selectedOption = this.capitalize(this.sort.fieldName);
    }
  }

  public getArrow(fieldName: string) {
    fieldName = fieldName.toLowerCase();
    if (fieldName !== this.sort.fieldName) {
      return 'Arrows.svg';
    }
    return this.sort.downDirection ? 'Arrows-down.svg' : 'Arrows-up.svg';
  }

  @HostListener('window:resize', ['$event'])
  private checkIfDesktop(): void {
    this.isDesktop = window.innerWidth >= this.minDesktopWidth;
  }

  public capitalize(value: string): string {
    return value[0].toUpperCase() + value.slice(1);
  }
}

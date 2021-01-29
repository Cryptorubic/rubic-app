import {Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {List} from 'immutable';
import {InputToken} from './types';

@Component({
  selector: 'app-tokens-input',
  templateUrl: './tokens-input.component.html',
  styleUrls: ['./tokens-input.component.scss']
})
export class TokensInputComponent implements OnInit {
  private VISIBLE_TOKENS_NUMBER = 10;

  @Input() amountPlaceholder?: string = 'Enter Amount';
  @Input() listDisabled?: boolean = false;
  @Input() inputDisabled?: boolean = false;
  @Input() tokensList: List<InputToken> = List();
  @Input() selectedToken: InputToken;

  @Output() numberChanges = new EventEmitter<number>();
  @Output() tokenChanges = new EventEmitter<InputToken | null>();

  @ViewChild('tokenField') tokenField: ElementRef;
  @ViewChild('amountField') amountField: ElementRef;

  public amount;
  public query: string = "";
  public isOpenList: boolean = false;
  public visibleTokensList: List<InputToken> = this.tokensList.slice(0, this.VISIBLE_TOKENS_NUMBER);
  public bigNumberDirective: { decimals: number, min: number } = {decimals: 18, min: 0};

  private cutAmount() {
    if (this.amount && this.amount.includes('.')) {
      const startIndex = this.amount.indexOf('.') + 1;
      this.amount = this.amount.slice(0, startIndex + this.selectedToken.decimals);
    }
  }

  constructor() {
  }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tokensList && changes.tokensList.currentValue.size) {
      this.visibleTokensList = this.tokensList.slice(0, this.VISIBLE_TOKENS_NUMBER);
    }

    if (changes.selectedToken) {
      this.cutAmount();

      this.bigNumberDirective = {
        decimals: changes.selectedToken.currentValue.decimals,
        min: 10 ** (-changes.selectedToken.currentValue.decimals)
      }
    }
  }

  onNumberChanges(number) {
    this.numberChanges.emit(number);
  }

  onTokenChanges(token) {
    this.tokenChanges.emit(token);
  }

  public toggleListVisible(isOpen?: boolean) {
    if (isOpen === undefined) {
      this.isOpenList = !this.isOpenList;
    } else {
      this.isOpenList = isOpen;
    }

    if (this.isOpenList) {
      this.tokenField.nativeElement.focus();
    } else {
      this.amountField.nativeElement.focus();
    }
  }

  public searchToken(query) {
    this.query = query;

    if (!query) {
      this.visibleTokensList = this.tokensList.slice(0, this.VISIBLE_TOKENS_NUMBER);
    }

    const upQuery = query.toUpperCase();
    const tikerMatch = this.tokensList.filter(token => token.symbol.toUpperCase().includes(upQuery));
    const nameMatch = this.tokensList.filter(token =>
      !tikerMatch.includes(token) &&
      token.name.toUpperCase().includes(upQuery)
    );

    this.visibleTokensList = tikerMatch.concat(nameMatch).slice(0, this.VISIBLE_TOKENS_NUMBER);
  }

  public resetTokenAndClose() {
    this.isOpenList = false;
    this.query = "";
    this.onTokenChanges(null);
  }

  public selectToken(token: InputToken) {
    this.onTokenChanges(token);
    this.query = token.symbol;
    this.unshiftTokenToVisibleList(token);
    this.toggleListVisible(false);
  }

  private unshiftTokenToVisibleList(token: InputToken) {
    this.visibleTokensList = this.tokensList
        .filter(item => item.symbol !== token.symbol)
        .slice(0, 9)
        .unshift(token)
  }
}

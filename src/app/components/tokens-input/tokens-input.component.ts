import {Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {IBridgeToken} from '../../services/bridge/types';
import {is, List} from 'immutable';

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
  @Input() tokensList: List<IBridgeToken> = List();
  @Input() symbolNameProp: string = 'symbol';

  @Output() numberChanges = new EventEmitter<number>();
  @Output() tokenChanges = new EventEmitter<IBridgeToken>();

  @ViewChild('tokenField') tokenField: ElementRef;
  @ViewChild('amountField') amountField: ElementRef;

  public amount;
  public query: string = "";
  public isOpenList: boolean = false;
  private _selectedToken: IBridgeToken = null;
  public visibleTokensList: List<IBridgeToken> = this.tokensList.slice(0, this.VISIBLE_TOKENS_NUMBER);

  set selectedToken(token) {
    this._selectedToken = token;
    this.onTokenChanges(token);
  }

  get selectedToken() {
    return this._selectedToken;
  }

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tokensList && changes.tokensList.currentValue.size) {
      this.visibleTokensList = this.tokensList.slice(0, this.VISIBLE_TOKENS_NUMBER);
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
    const tikerMatch = this.tokensList.filter(token => token[this.symbolNameProp].toUpperCase().includes(upQuery));
    const nameMatch = this.tokensList.filter(token =>
      !tikerMatch.includes(token) &&
      token.name.toUpperCase().includes(upQuery)
    );

    this.visibleTokensList = tikerMatch.concat(nameMatch).slice(0, this.VISIBLE_TOKENS_NUMBER);
  }

  public resetTokenAndClose() {
    this.isOpenList = false;
    this.query = "";
    this.selectedToken = null;
  }

  public selectToken(token: IBridgeToken) {
    this.selectedToken = token;
    this.query = token[this.symbolNameProp];
    this.unshiftTokenToVisibleList(token);
    this.toggleListVisible(false);
  }

  private unshiftTokenToVisibleList(token: IBridgeToken) {
    this.visibleTokensList = this.tokensList
        .filter(item => item[this.symbolNameProp] !== token[this.symbolNameProp])
        .slice(0, 9)
        .unshift(token)
  }
}

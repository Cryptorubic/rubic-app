import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import IBridgeToken from '../../services/bridge/IBridgeToken';
import {List} from 'immutable';

@Component({
  selector: 'app-tokens-input',
  templateUrl: './tokens-input.component.html',
  styleUrls: ['./tokens-input.component.scss']
})
export class TokensInputComponent implements OnInit {
  @Input() amountPlaceholder?: string = 'Enter Amount';
  @Input() listDisabled?: boolean = false;
  @Input() inputDisabled?: boolean = false;
  @Input() tokensList: List<IBridgeToken>;

  @Output() numberChanges = new EventEmitter<number>();
  @Output() tokenChanges = new EventEmitter<string>();

  public amount;
  public visibleList: boolean = false;
  public selectedToken: IBridgeToken = null;

  onNumberChanges(number) {
    this.numberChanges.emit(number);
  }

  onTokenChanges(token) {
    this.tokenChanges.emit(token);
  }

  constructor() { }

  ngOnInit() {
  }

  public toggleListVisible(isOpen?: boolean) {
    if (isOpen === undefined) {
      this.visibleList = !this.visibleList;
    } else {
      this.visibleList = isOpen;
    }
  }

  public searchToken(e) {

  }

  public resetTokenAndClose() {

  }

  public selectToken(e) {

  }

}

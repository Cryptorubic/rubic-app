import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {List} from 'immutable';
import {InputToken, InputTokenShort} from './types';
import {TokenLabelComponent} from "./token-label/token-label.component";
import {InputDropdownComponent} from "../input-dropdown/input-dropdown.component";

interface TokenLabelData {
  token: InputTokenShort;
  selected?: boolean;
}

interface TokenDropdownData {
  inputs: TokenLabelData;
  id: string;
  symbol: string;
  name: string;
}

@Component({
  selector: 'app-tokens-input',
  templateUrl: './tokens-input.component.html',
  styleUrls: ['./tokens-input.component.scss']
})
export class TokensInputComponent implements OnInit, OnChanges {

  @Input() amountPlaceholder?: string = 'Enter Amount';
  @Input() listDisabled?: boolean = false;
  @Input() inputDisabled?: boolean = false;
  @Input() tokensList: List<InputToken> = List();
  @Input() selectedToken: InputToken;

  @Output() numberChanges = new EventEmitter<number>();
  @Output() tokenChanges = new EventEmitter<InputToken | null>();

  @ViewChild('app-input-dropdown') inputDropdown: InputDropdownComponent<TokenDropdownData>;

  public readonly tokenLabelComponentClass = TokenLabelComponent;
  public tokensInputData = List<TokenDropdownData>();
  public selectedTokenInputData: TokenDropdownData;
  public tokensSortOrder = ['symbol', 'name'];
  public VISIBLE_TOKENS_NUMBER = 10;

  public amount;
  public bigNumberDirective: { decimals: number, min: number } = {decimals: 18, min: 0};

  private cutAmount() {
    if (this.amount && this.amount.includes('.')) {
      const startIndex = this.amount.indexOf('.') + 1;
      this.amount = this.amount.slice(0, startIndex + this.selectedToken.decimals);
    }
  }

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    this.setTokensInputData();

    if (changes.selectedToken && changes.selectedToken.currentValue) {
      this.cutAmount();

      this.bigNumberDirective = {
        decimals: changes.selectedToken.currentValue.decimals,
        min: 10 ** (-changes.selectedToken.currentValue.decimals)
      }
    }
  }

  public onNumberChanges(number) {
    this.numberChanges.emit(number);
  }

  /**
   * Takes the components selected in input-dropdown.
   * Every token-component has `id`, which is actually the `address` of that token.
   */
  public onTokenChanges(tokenComponent) {
    this.tokenChanges.emit(this.tokensList.find(token => token.address === tokenComponent.id));
  }

  /**
   * Sets tokens' input data to pass to the input-dropdown and components' creator.
   */
  private setTokensInputData() {
    this.tokensInputData = this.tokensList.map(token =>
      ({ inputs: { token }, id: token.address, symbol: token.symbol, name: token.name })
    );

    if (this.selectedToken) {
      this.selectedTokenInputData = {
        inputs: { token: this.selectedToken, selected: true },
        id: this.selectedToken.address,
        symbol: this.selectedToken.symbol,
        name: this.selectedToken.name
      }
    } else {
      this.selectedTokenInputData = null;
    }
  }
}

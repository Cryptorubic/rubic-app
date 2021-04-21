import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { List } from 'immutable';
import BigNumber from 'bignumber.js';
import { InputTokenShort } from './types';
import { TokenLabelComponent } from './token-label/token-label.component';
import { InputDropdownComponent } from '../input-dropdown/input-dropdown.component';
import { DropdownComponentData } from '../input-dropdown/types';
import InputToken from '../../models/tokens/InputToken';

interface TokenLabelData {
  token: InputTokenShort;
  selected?: boolean;
}

interface TokenDropdownData extends DropdownComponentData {
  inputs: TokenLabelData;
  id: string;
  filterParameters: {
    symbol: string;
    name: string;
  };
  sortParameters: {
    rank: number;
  };
}

@Component({
  selector: 'app-tokens-input',
  templateUrl: './tokens-input.component.html',
  styleUrls: ['./tokens-input.component.scss']
})
export class TokensInputComponent implements OnChanges {
  @Input() amountPlaceholder?: string = 'Enter Amount';

  @Input() listDisabled?: boolean = false;

  @Input() inputDisabled?: boolean = false;

  @Input() tokensList: List<InputToken> = List();

  @Input() selectedToken: InputToken;

  /**
   * Will {@link selectedAmount} be rounded or not.
   */
  @Input() withRoundMode? = false;

  /**
   * How much decimal symbols will be left in {@link selectedAmount}, if it is greater than or equal to 1.
   */
  // eslint-disable-next-line no-magic-numbers
  @Input() selectedAmountRoundMode? = 5;

  /**
   * How much decimal symbols after zeroes will be left in {@link selectedAmount}, if it is less than 1.
   */
  // eslint-disable-next-line no-magic-numbers
  @Input() smallSelectedAmountRoundMode? = 6;

  get selectedAmount(): string {
    return this._selectedAmount;
  }

  @Input() set selectedAmount(value) {
    this._selectedAmount = value;

    if (this._selectedAmount?.includes('.')) {
      const startIndex = this._selectedAmount.indexOf('.') + 1;

      let decimalSymbols: number;
      if (this.withRoundMode) {
        if (new BigNumber(this._selectedAmount).isGreaterThanOrEqualTo(1)) {
          decimalSymbols = this.selectedAmountRoundMode;
        } else {
          let zerosAmount = 0;
          for (let i = startIndex; i < this._selectedAmount.length; ++i) {
            if (this._selectedAmount[i] === '0') {
              zerosAmount++;
            } else {
              break;
            }
          }
          decimalSymbols = zerosAmount + this.smallSelectedAmountRoundMode;
        }
        decimalSymbols = Math.min(decimalSymbols, this.selectedToken.decimals);
      } else {
        decimalSymbols = this.selectedToken?.decimals
          ? this.selectedToken.decimals
          : this.DEFAULT_DECIMAL_LENGTH;
      }

      this._selectedAmount = this._selectedAmount.slice(0, startIndex + decimalSymbols);
      if (this.withRoundMode && new BigNumber(this._selectedAmount).isEqualTo(0)) {
        this._selectedAmount = '0';
      }
    }
  }

  @Output() numberChanges = new EventEmitter<string>();

  @Output() tokenChanges = new EventEmitter<InputToken | null>();

  @ViewChild('app-input-dropdown') inputDropdown: InputDropdownComponent<TokenDropdownData>;

  private _selectedAmount: string;

  // eslint-disable-next-line no-magic-numbers
  public DEFAULT_DECIMAL_LENGTH = 8;

  public readonly tokenLabelComponentClass = TokenLabelComponent;

  public tokensDropdownData = List<TokenDropdownData>();

  public selectedTokenDropdownData: TokenDropdownData;

  public tokensFilterOrder = ['symbol', 'name'];

  public tokensSortOrder = ['rank'];

  public VISIBLE_TOKENS_NUMBER = 10;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tokensList || changes.selectedToken) {
      this.setTokensInputData();
    }
  }

  public onNumberChanges(numberAsString) {
    this._selectedAmount = numberAsString.split(',').join('');
    this.numberChanges.emit(this._selectedAmount);
  }

  /**
   * Takes the components selected in input-dropdown.
   * Every token-component has `id`, which is actually the `address` of that token.
   */
  public onTokenChanges(tokenComponent) {
    this.tokenChanges.emit(this.tokensList.find(token => token.address === tokenComponent?.id));
  }

  /**
   * Sets tokens' input data to pass to the input-dropdown and components' creator.
   */
  private setTokensInputData() {
    this.tokensDropdownData = this.tokensList.map(token => ({
      inputs: { token },
      id: token.address,
      filterParameters: { symbol: token.symbol, name: token.name },
      sortParameters: { rank: token.rank }
    }));

    if (this.selectedToken) {
      this.selectedTokenDropdownData = {
        inputs: { token: this.selectedToken, selected: true },
        id: this.selectedToken.address,
        filterParameters: {
          symbol: this.selectedToken.symbol,
          name: this.selectedToken.name
        },
        sortParameters: { rank: this.selectedToken.rank }
      };
    } else {
      this.selectedTokenDropdownData = null;
    }
  }
}

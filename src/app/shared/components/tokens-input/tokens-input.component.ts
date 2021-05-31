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
import { List } from 'immutable';
import BigNumber from 'bignumber.js';
import { InputTokenShort } from './types';
import { TokenLabelComponent } from './token-label/token-label.component';
import { InputDropdownComponent } from '../input-dropdown/input-dropdown.component';
import { DropdownComponentData } from '../input-dropdown/types';
import InputToken from '../../models/tokens/InputToken';
import { WithRoundPipe } from '../../pipes/with-round.pipe';

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
    customRank?: number;
    usersBalance?: number;
    rank: number;
  };
}

@Component({
  selector: 'app-tokens-input',
  templateUrl: './tokens-input.component.html',
  styleUrls: ['./tokens-input.component.scss']
})
export class TokensInputComponent implements OnChanges, OnInit {
  @Input() amountPlaceholder?: string = 'Enter amount';

  @Input() listDisabled?: boolean = false;

  @Input() amountInputDisabled?: boolean = false;

  @Input() tokensInputDisabled?: boolean = false;

  @Input() tokensList: List<InputToken> = List();

  @Input() selectedToken: InputToken;

  /**
   * Will {@link selectedAmount} be rounded or not.
   */
  @Input() withRoundMode? = false;

  /**
   * How much decimal symbols will be left in {@link selectedAmount}, if it is greater than or equal to 1.
   */
  @Input() minRound? = 5;

  /**
   * How much decimal symbols after zeroes will be left in {@link selectedAmount}, if it is less than 1.
   */
  @Input() maxRound? = 6;

  @Input() fullWidth?: boolean;

  get selectedAmount(): string {
    return this._selectedAmount;
  }

  @Input() set selectedAmount(value) {
    this._selectedAmount = this.withRoundPipe.transform(
      value,
      this.minRound,
      this.maxRound,
      this.selectedToken,
      'toClosestValue'
    );
    if (this.amountInputDisabled && new BigNumber(this._selectedAmount).eq(0)) {
      this._selectedAmount = '0';
    }
  }

  @Output() numberChanges = new EventEmitter<string>();

  @Output() tokenChanges = new EventEmitter<InputToken | null>();

  @ViewChild('appInputDropdown') inputDropdown: InputDropdownComponent<TokenDropdownData>;

  public readonly DEFAULT_DECIMAL_LENGTH = 8;

  public readonly VISIBLE_TOKENS_NUMBER = 10;

  private _selectedAmount: string;

  public readonly tokenLabelComponentClass = TokenLabelComponent;

  public tokensDropdownData = List<TokenDropdownData>();

  public selectedTokenDropdownData: TokenDropdownData;

  public tokensFilterOrder: string[];

  public tokensSortOrder: string[];

  public maxButtonPositionRight: number;

  public inputPaddingRight: number;

  constructor(private readonly withRoundPipe: WithRoundPipe) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tokensList || changes.selectedToken) {
      this.setTokensInputData();
    }
  }

  ngOnInit() {
    this.tokensFilterOrder = ['symbol', 'name'];
    this.tokensSortOrder = ['customRank', 'usersBalance', 'rank'];
  }

  public onNumberChanges(number: string | number) {
    this._selectedAmount = number.toString().split(',').join('');
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
      filterParameters: { ...token },
      sortParameters: { ...token }
    }));

    if (this.selectedToken) {
      this.selectedTokenDropdownData = {
        inputs: { token: this.selectedToken, selected: true },
        id: this.selectedToken.address,
        filterParameters: { ...this.selectedToken },
        sortParameters: { ...this.selectedToken }
      };
    } else {
      this.selectedTokenDropdownData = null;
    }
  }

  public resetInputElementsPositions(inputDropdownWidth: number): void {
    this.maxButtonPositionRight = inputDropdownWidth + 9;
    this.inputPaddingRight = this.maxButtonPositionRight + 43;
  }
}

import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Web3ServiceLEGACY } from '../../services/web3LEGACY/web3LEGACY.service';

export interface ITokenInfo {
  active?: boolean;
  address: string;
  image_link: string;
  token_short_title: string;
  token_title: string;
  decimals: number;
  isEther?: boolean;
}

@Component({
  selector: 'app-tokens-all-input',
  templateUrl: './tokens-all-input.component.html',
  styleUrls: ['./tokens-all-input.component.scss']
})
export class TokensAllInputComponent implements OnInit {
  @ViewChild('tokenField', { static: true }) tokenField: ElementRef;

  @ViewChild('amountField', { static: true }) amountField: ElementRef;

  @Input('tokenModel') public tokenModel: any;

  @Input('disabled') public disabled: boolean;

  @Input() public tokenGroup: any;

  @Input() private setToken: any;

  @Input() private isCustomAddress: boolean;

  @Input() private blockchain: string;

  @Input() public amountPlaceholder = true;

  @Input() public resetForm: EventEmitter<any>;

  @Input() private exclude;

  @Input() moveInput = false;

  @ViewChild('tokenForm', { static: true }) tokenForm;

  private _otherTokens: any;

  @Input() set otherTokens(newTokens: any[]) {
    const foundToken = newTokens.find(
      token =>
        this.tokenModel.token.address &&
        token.address.toLowerCase() === this.tokenModel.token.address.toLowerCase()
    );
    if (foundToken) {
      this.searchToken(foundToken.token_short_title);
      this.tokenModel.token = foundToken;
    } else {
      this.tokenModel.token = {};
      this.tokenName = '';
      this.searchToken('');
    }
    this._otherTokens = newTokens;
    this.visibleInput = false;
  }

  public visibleInput: boolean;

  public tokensList: ITokenInfo[] = [];

  public listIsOpened: boolean;

  public tokenName;

  private activeTokenIndex;

  @Output() public TokenChange = new EventEmitter<void>();

  private searchSubscriber;

  constructor(private web3Service: Web3ServiceLEGACY) {}

  get() {
    return this._otherTokens;
  }

  ngOnInit() {
    if (this.setToken) {
      this.setToken.subscribe(result => {
        if (result) {
          this.visibleInput = false;
          this.TokenChange.emit();
          this.tokenName = result.token.token_short_title;
        } else {
          setTimeout(() => {
            this.tokenName = '';
            this.searchToken('');
            this.listIsOpened = false;
          });
        }
      });
    }

    this.resetForm.subscribe(() => {
      this.tokenForm.resetForm();
      this.tokenForm.form.reset();
    });
  }

  public searchToken(q) {
    if (q === null || q === undefined) {
      return;
    }
    const resultsNumber = 10;
    this.listIsOpened = false;
    this.tokensList = [];
    this.activeTokenIndex = undefined;

    if (this.searchSubscriber) {
      this.searchSubscriber.unsubscribe();
    }

    // eslint-disable-next-line no-nested-ternary
    let tokensForSearch = !this._otherTokens
      ? this.blockchain
        ? window['coingecko_tokens'].filter(t => t.platform === this.blockchain)
        : window['coingecko_tokens']
      : this._otherTokens;

    tokensForSearch = tokensForSearch.filter(token => token.address !== this.exclude);

    const lowerCaseQuery = q.toLowerCase();
    const shortNameMatchTokens = tokensForSearch.filter(
      token =>
        token &&
        token.token_short_title.toLowerCase().includes(lowerCaseQuery) &&
        (this.blockchain || this.blockchain === token.platform)
    );

    if (lowerCaseQuery) {
      shortNameMatchTokens.sort(
        (token1, token2) => token1.token_short_title.length - token2.token_short_title.length
      );
    }

    const nameMatchTokens = tokensForSearch.filter(
      token =>
        token &&
        token.token_title.toLowerCase().includes(lowerCaseQuery) &&
        !token.token_short_title.toLowerCase().includes(lowerCaseQuery) &&
        (this.blockchain || this.blockchain === token.platform)
    );

    this.tokensList = shortNameMatchTokens
      .concat(nameMatchTokens)
      .slice(0, resultsNumber)
      .map(obj => ({ ...obj }));

    if (this.tokensList.length) {
      this.listIsOpened = true;
      this.selectToken(this.tokensList[0], 0, true);
    }
  }

  public showList() {
    if (this.tokensList.length) {
      this.listIsOpened = true;
    }
  }

  public hideAutoInput() {
    this.visibleInput = false;
    this.listIsOpened = false;
  }

  public showAutoInput() {
    if (!this.visibleInput) {
      this.searchToken(this.tokenName);
    }

    this.visibleInput = !this.visibleInput;
    setTimeout(() => {
      if (this.visibleInput) {
        this.tokenField.nativeElement.focus();
      } else {
        this.amountField.nativeElement.focus();
      }
    });
  }

  public selectToken(token, tokenIndex, withoutHide?: boolean) {
    if (!Number.isNaN(Number(this.activeTokenIndex))) {
      this.tokensList[this.activeTokenIndex].active = false;
    }
    token.active = true;
    this.activeTokenIndex = tokenIndex;
    if (withoutHide) {
      return;
    }
    this.tokenModel.token = token;
    this.listIsOpened = false;
    this.tokenName = token.token_short_title;

    if (this.tokenModel.token.decimals) {
      this.TokenChange.emit(this.tokenModel);
    } else {
      this.web3Service
        .getFullTokenInfo(this.tokenModel.token.address, this.blockchain)
        .then((res: any) => {
          this.tokenModel.token.decimals = res.decimals;
          this.TokenChange.emit();
        });
    }

    this.showAutoInput();
  }

  public keyDownResult(event) {
    if (event.code === 'Escape') {
      this.showAutoInput();
      return;
    }

    const listTokensNode = event.target.parentNode
      .querySelector('.form-field_input__ac_res')
      .querySelector('ul.ac_res_list');

    if (!this.tokensList.length) {
      return;
    }
    switch (event.code) {
      case 'ArrowUp': {
        let newPrevIndex = this.activeTokenIndex - 1;
        if (newPrevIndex < 0) {
          newPrevIndex = this.tokensList.length - 1;
        }
        this.selectToken(this.tokensList[newPrevIndex], newPrevIndex, true);
        break;
      }
      case 'ArrowDown': {
        let newNextIndex = this.activeTokenIndex + 1;
        if (newNextIndex > this.tokensList.length - 1) {
          newNextIndex = 0;
        }
        this.selectToken(this.tokensList[newNextIndex], newNextIndex, true);
        break;
      }
      case 'Enter':
        this.selectToken(this.tokensList[this.activeTokenIndex], this.activeTokenIndex);
        event.preventDefault();
        break;
      default:
        break;
    }

    setTimeout(() => {
      if (!listTokensNode) {
        return;
      }
      const activeItem = listTokensNode.querySelector('.active');
      const bottomPosition = activeItem.offsetTop + activeItem.offsetHeight;
      const maxBottomPosition = listTokensNode.scrollTop + listTokensNode.offsetHeight;
      const heightRange = maxBottomPosition - bottomPosition;
      if (heightRange < 0) {
        listTokensNode.scroll(0, listTokensNode.scrollTop - heightRange);
      } else if (activeItem.offsetTop < listTokensNode.scrollTop) {
        listTokensNode.scroll(0, activeItem.offsetTop);
      }
    });
  }

  public resetToken(): void {
    this.tokenName = '';
    this.tokenModel.token = {};
    this.TokenChange.emit();
  }
}

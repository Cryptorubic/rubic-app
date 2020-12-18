import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {Web3Service} from "../../services/web3/web3.service";

export interface ITokenInfo {
  active?: boolean;
  address: string;
  image_link: string;
  token_short_name: string;
  token_name: string;
  decimals: number;
  isEther?: boolean;
}

@Component({
  selector: 'app-tokens-all-input',
  templateUrl: './tokens-all-input.component.html',
  styleUrls: ['./tokens-all-input.component.scss'],
})
export class TokensAllInputComponent implements OnInit {
  @Input('tokenModel') public tokenModel: any;
  @Input('disabled') public disabled: boolean;
  @Input() public tokenGroup: any;
  @Input() private setToken: any;
  @Input() private isCustomAddress: boolean;
  @Input() private blockchain: string;
  @Input() public amountPlaceholder: boolean = true;
  @Input() public resetForm: EventEmitter<any>;

  @ViewChild('tokenForm') tokenForm;

  private _otherTokens: any;

  @Input() set otherTokens(value: string) {
    if (this._otherTokens !== value) {
      this._otherTokens = value;
      this.tokenName = '';
      this.searchToken('');
    }
  }
  get() {
    return this._otherTokens;
  }

  @ViewChild('tokenField') tokenField: ElementRef;
  @ViewChild('amountField') amountField: ElementRef;

  constructor(
      private web3Service: Web3Service
  ) {
    this.tokensList = [];
  }


  public visibleInput: boolean;
  public tokensList: ITokenInfo[];
  public listIsOpened: boolean;
  public tokenName;
  private activeTokenIndex;

  @Output() public TokenChange = new EventEmitter<string|false>();

  private searchSubscriber;

  ngOnInit() {
    if (this.setToken) {
      this.setToken.subscribe((result) => {
        if (result) {
          this.visibleInput = false;
          this.TokenChange.emit(result);
          this.tokenName = result.token.token_name + ' (' + result.token.token_short_name + ')';
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
    const resultsNumber = 10;
    this.listIsOpened = false;
    this.tokensList = [];
    this.activeTokenIndex = undefined;

    if (this.searchSubscriber) {
      this.searchSubscriber.unsubscribe();
    }

    const tokensForSearch = !this._otherTokens ? this.blockchain ? window['cmc_tokens'].filter((t) => {
      return t.platform === this.blockchain;
    }) : window['cmc_tokens'] : this._otherTokens;

    const lowerCaseQuery = q.toLowerCase();
    const shortNameMatchTokens = tokensForSearch.filter(token =>
        token
        && token.token_short_name
            .toLowerCase()
            .includes(lowerCaseQuery)
        && (this.blockchain || this.blockchain === token.platform)
    );
    const nameMatchTokens = tokensForSearch.filter(token =>
        token
        && token.token_name
            .toLowerCase()
            .includes(lowerCaseQuery)
        && !token.token_short_name
            .toLowerCase()
            .includes(lowerCaseQuery)
        && (this.blockchain || this.blockchain === token.platform)
    );

    this.tokensList = shortNameMatchTokens
        .concat(nameMatchTokens)
        .slice(0, resultsNumber)
        .map(obj => ({...obj}));


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
    if (!isNaN(this.activeTokenIndex)) {
      this.tokensList[this.activeTokenIndex].active = false;
    }
    token.active = true;
    this.activeTokenIndex = tokenIndex;
    if (withoutHide) {
      return;
    }
    this.tokenModel.token = token;
    this.listIsOpened = false;
    this.tokenName = token.token_name + ' (' + token.token_short_name + ')';
    this.web3Service.getFullTokenInfo(this.tokenModel.token.address, false, this.blockchain).then((res: any) => {
      this.tokenModel.token.decimals = res.decimals;
      this.TokenChange.emit(this.tokenModel);
    })
    this.showAutoInput();
  }

  public resetToken() {
    this.tokenName = '';
    this.tokenModel.token = {};
    this.TokenChange.emit(false);

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
      case 'ArrowUp':
        let newPrevIndex = this.activeTokenIndex - 1;
        if (newPrevIndex < 0) {
          newPrevIndex = this.tokensList.length - 1;
        }
        this.selectToken(this.tokensList[newPrevIndex], newPrevIndex, true);
        break;

      case 'ArrowDown':
        let newNextIndex = this.activeTokenIndex + 1;
        if (newNextIndex > this.tokensList.length - 1) {
          newNextIndex = 0;
        }
        this.selectToken(this.tokensList[newNextIndex], newNextIndex, true);
        break;
      case 'Enter':
        this.selectToken(
          this.tokensList[this.activeTokenIndex],
          this.activeTokenIndex,
        );
        event.preventDefault();
        break;
    }

    setTimeout(() => {
      if (!listTokensNode) {
        return;
      }
      const activeItem = listTokensNode.querySelector('.active');
      const bottomPosition = activeItem.offsetTop + activeItem.offsetHeight;
      const maxBottomPosition =
        listTokensNode.scrollTop + listTokensNode.offsetHeight;
      const heightRange = maxBottomPosition - bottomPosition;
      if (heightRange < 0) {
        listTokensNode.scroll(0, listTokensNode.scrollTop - heightRange);
      } else if (activeItem.offsetTop < listTokensNode.scrollTop) {
        listTokensNode.scroll(0, activeItem.offsetTop);
      }
    });
  }
}

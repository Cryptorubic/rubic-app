import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

export interface ITokenInfo {
  active?: boolean;
  address: string;
  image_link: string;
  token_short_title: string;
  token_title: string;
  decimals: number;
}

@Component({
  selector: 'app-coins-list',
  templateUrl: './coins-list.component.html',
  styleUrls: ['./coins-list.component.scss']
})
export class CoinsListComponent implements OnInit {
  @Input() public tokenModel: any;

  @Input() public tokenGroup: any;

  @Input() private setToken: any;

  @ViewChild('tokenField', { static: true }) tokenField: ElementRef;

  constructor() {
    this.tokensList = [];
  }

  public tokensList: ITokenInfo[];

  public listIsOpened: boolean;

  public tokenSymbol;

  private activeTokenIndex;

  @Output() TokenChange = new EventEmitter<string>();

  private searchSubscriber;

  ngOnInit() {
    this.tokenField.nativeElement.addEventListener('blur', () => {
      this.listIsOpened = false;
    });
  }

  public blurInput() {
    if (!this.tokenModel.token) {
      this.TokenChange.emit();
    }
  }

  public searchToken(q) {
    this.listIsOpened = false;

    if (!Number.isNaN(Number(this.activeTokenIndex)) && this.tokensList[this.activeTokenIndex]) {
      this.tokensList[this.activeTokenIndex].active = false;
    }

    this.tokenModel.token = undefined;

    if (!q.length) {
      this.blurInput();
    }

    this.tokensList = [];
    if (this.searchSubscriber) {
      this.searchSubscriber.unsubscribe();
    }

    if (q.length < 2) {
      return;
    }

    const result = [];

    let indexToken = 0;

    while (indexToken < window['coingecko_tokens'].length - 1 && result.length < 10) {
      const token = window['coingecko_tokens'][indexToken];
      const tokenTitle = token.token_title.toLowerCase();
      const tokenSymbol = token.token_short_title.toLowerCase();
      const seqrchQ = q.toLowerCase();

      const nameIndexMatch = tokenTitle.indexOf(seqrchQ) + 1;
      const symbolIndexMatch = tokenSymbol.indexOf(seqrchQ) + 1;

      if (nameIndexMatch || symbolIndexMatch) {
        result.push({ ...token });
      }
      indexToken++;
    }
    this.tokensList = result;

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

  public showAutoInput() {
    this.tokenField.nativeElement.focus();
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

    this.activeTokenIndex = undefined;
    this.tokenModel.token = token;
    this.listIsOpened = false;
    this.tokenSymbol = token.token_short_title;

    this.TokenChange.emit(token);

    this.showAutoInput();
  }

  public keyDownResult(event) {
    if (event.code === 'Escape') {
      this.showAutoInput();
      return;
    }

    const listTokensNode = event.target.parentNode.querySelector('ul.coins-list-control_list');

    if (!this.tokensList.length) {
      return;
    }
    switch (event.code) {
      case 'ArrowUp': {
        let newPrevIndex = this.activeTokenIndex - 1;
        if (newPrevIndex < 0) {
          newPrevIndex = this.tokensList.length - 1;
        } else if (this.activeTokenIndex === undefined) {
          return;
        }

        this.selectToken(this.tokensList[newPrevIndex], newPrevIndex, true);
        break;
      }
      case 'ArrowDown': {
        let newNextIndex = this.activeTokenIndex + 1;
        if (newNextIndex > this.tokensList.length - 1) {
          newNextIndex = 0;
        } else if (this.activeTokenIndex === undefined) {
          return;
        }
        this.selectToken(this.tokensList[newNextIndex], newNextIndex, true);
        break;
      }
      case 'Enter':
        if (this.activeTokenIndex === undefined) {
          return;
        }

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
}

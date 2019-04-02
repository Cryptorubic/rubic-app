import {Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {HttpService} from '../../services/http/http.service';


export interface ITokenInfo {
    active?: boolean;
    image_link: string;
    token_short_name: string;
    token_name: string;
    decimals: number;
}

@Component({
  selector: 'app-token-input',
  templateUrl: './token-input.component.html',
  styleUrls: ['./token-input.component.scss']
})
export class TokenInputComponent implements OnInit {

  constructor(
    private httpService: HttpService
  ) {
  }

  @Input('tokenModel') public tokenModel: any;
  @Input('updateModel') public updateModel: any;
  @Input() public tokenGroup: any;

  @ViewChild('tokenField') tokenField: ElementRef;
  @ViewChild('amountField') amountField: ElementRef;

  public amount;

  public visibleInput: boolean;
  public tokensList: ITokenInfo[];
  public listIsOpened: boolean;
  public tokenName;
  private activeTokenIndex;

  @Output() TokenChange = new EventEmitter<string>();


  private oldValue;

  ngOnInit() {
    let amount;
    if (this.updateModel) {
      this.updateModel.subscribe(() => {
        amount = this.tokenModel.amount;
        this.transformValue(amount);
      });
    }
    this.tokensList = [];
    if (!this.tokenModel.amount) {
      return;
    }
    amount = this.tokenModel.amount;
    this.transformValue(amount);
  }

  public searchToken(q) {
    this.listIsOpened = false;
    this.httpService.get('get_all_tokens/', {
      token_short_name: q
    }).subscribe((res: ITokenInfo[]) => {
      this.listIsOpened = true;
      this.tokensList = res;
      if (res.length) {
        this.selectToken(res[0], 0, true);
      }
    });
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
    this.activeTokenIndex = undefined;
    this.tokenModel.token = token;
    this.listIsOpened = false;
    this.tokenName = token.token_name + ' (' + token.token_short_name + ')';
    this.TokenChange.emit(this.tokenModel);
    this.showAutoInput();
  }

  public keyDownResult(event) {

    if (event.code === 'Escape') {
      this.showAutoInput();
      return;
    }

    const listTokensNode = event.target.parentNode.querySelector('.form-field_input__ac_res').querySelector('ul.ac_res_list');


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
        this.selectToken(this.tokensList[this.activeTokenIndex], this.activeTokenIndex);
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

  public transformValue(event) {
    const replaceRegExp = /(\d)(?=(\d{3})+(?!\d))/g;
    let value = event ? event.replace(/,/g, '') : undefined;


    if (!value) {
      this.oldValue = '';
    }

    if (isNaN(value)) {
      value = this.oldValue || '';
      this.amount = value.replace(replaceRegExp, '$1,');
    } else if (this.oldValue !== value) {
      this.oldValue = value;
    }

    this.tokenModel.amount = value;
    this.amount = value.replace(replaceRegExp, '$1,');
    this.amountField.nativeElement.value = this.amount;
    this.TokenChange.emit(this.tokenModel);
    setTimeout(() => {
      this.amount = value.replace(replaceRegExp, '$1,');
    });
  }

}

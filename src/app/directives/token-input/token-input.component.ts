import {Component, Directive, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {HttpService} from '../../services/http/http.service';
import {AbstractControl, NG_ASYNC_VALIDATORS} from '@angular/forms';
import {Validator} from 'codelyzer/walkerFactory/walkerFn';
import BigNumber from 'bignumber.js';


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
  selector: 'app-token-input',
  templateUrl: './token-input.component.html',
  styleUrls: ['./token-input.component.scss']
})
export class TokenInputComponent implements OnInit {

  @Input('tokenModel') public tokenModel: any;
  @Input('updateModel') public updateModel: any;
  @Input() public tokenGroup: any;

  @ViewChild('amountForm') public amountForm: any;


  @ViewChild('tokenField') tokenField: ElementRef;
  @ViewChild('amountField') amountField: ElementRef;

  constructor(
    private httpService: HttpService
  ) {
  }

  public amount;

  public visibleInput: boolean;
  public tokensList: ITokenInfo[];
  public listIsOpened: boolean;
  public tokenName;
  private activeTokenIndex;

  @Output() TokenChange = new EventEmitter<string>();


  private oldValue;
  private amountControl: AbstractControl;

  private searchSubscriber;


  ngOnInit() {
    let amount;

    this.tokenField.nativeElement.addEventListener('blur', () => {
      this.listIsOpened = false;
    });

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
    this.tokensList = [];
    if (this.searchSubscriber) {
      this.searchSubscriber.unsubscribe();
    }

    if (!q) {
      return;
    }
    this.searchSubscriber = this.httpService.get('get_all_tokens/', {
      token_short_name: q
    }).subscribe((res: ITokenInfo[]) => {
      this.listIsOpened = true;
      this.tokensList = res;
      this.tokensList.forEach((tok) => {
        tok.isEther = tok.address === '0x0000000000000000000000000000000000000000';
      });
      if (res.length) {
        this.selectToken(res[0], 0, true);
      }
    });
  }

  public showList() {
    if (this.tokensList.length) {
      this.listIsOpened = true;
    }
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
    let value = event ? event.replace(/,/g, '') : undefined;
    const withoutDotValue = (value !== undefined) ? value.replace(/^[0]+(.*)\.+$/, '$1') : '';

    if (isNaN(withoutDotValue)) {
      value = this.oldValue || '';
    } else if (this.oldValue !== value) {
      this.oldValue = value;
    }

    value = value || '';
    const splittedValue = value.split('.');

    const valueNumber = new BigNumber(value);

    let actualVal = !valueNumber.isNaN() ?
      valueNumber.toFormat({groupSeparator: ',', groupSize: 3, decimalSeparator: '.'}) : '';

    if ((splittedValue[1] !== undefined) && !splittedValue[1]) {
      actualVal += '.';
    }

    this.amountField.nativeElement.value = actualVal;

    setTimeout(() => {
      this.amountField.nativeElement.value = actualVal;

      this.amount = actualVal;

      const minErr = valueNumber.minus(Math.pow(10, -this.tokenModel.token.decimals)).toNumber() < 0;
      const maxErr = valueNumber.times(Math.pow(10, this.tokenModel.token.decimals)).minus(Math.pow(2, 256) - 1).toNumber() > 0;
      const decErr = splittedValue[1] && (splittedValue[1].length > this.tokenModel.token.decimals);

      setTimeout(() => {
        if (minErr || maxErr || decErr) {
          this.amountForm.controls.amountField.setErrors({
            min: minErr || null,
            max: maxErr || null,
            decimals: decErr || null
          });
          this.tokenModel.amount = '';
        } else {
          this.tokenModel.amount = !valueNumber.isNaN() ? (valueNumber.toString(10) || '') : '';
        }
        this.TokenChange.emit(this.tokenModel);
      });
    });
  }

}


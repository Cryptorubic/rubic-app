import { Component, Input, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BLOCKCHAIN_NAME } from '../../../services/blockchain/types/Blockchain';
import { TokenInfoBody } from './types';
import { OrderBookToken, OrderBookTokens, TradeInfo } from '../../../services/order-book/types';
import { OrderBookService } from '../../../services/order-book/order-book.service';

@Component({
  selector: 'app-order-book',
  templateUrl: './order-book.component.html',
  styleUrls: ['./order-book.component.scss']
})
export class OrderBookComponent {
  @Input()
  set blockchain(value: BLOCKCHAIN_NAME) {
    if (this._blockchain && this._blockchain !== value) {
      this.resetTokens();
    }
    this._blockchain = value;
    this.tradeInfo = { ...this.tradeInfo, blockchain: this._blockchain };

    setTimeout(() => {
      this.updateCustomTokenAddresses();
    });
  }

  get blockchain(): BLOCKCHAIN_NAME {
    return this._blockchain;
  }

  private _blockchain: BLOCKCHAIN_NAME;

  @Input()
  set tokens(value: OrderBookTokens) {
    this.tradeInfo.tokens = value;
  }

  @ViewChild('baseCustomToken') baseCustomToken: NgModel;

  @ViewChild('quoteCustomToken') quoteCustomToken: NgModel;

  get tradeInfo(): TradeInfo {
    return this._tradeInfo;
  }

  set tradeInfo(value) {
    this._tradeInfo = value;

    this.checkIfCreateTradeIsAvailable();
  }

  private _tradeInfo: TradeInfo;

  public isCreateTradeAvailable: boolean;

  public isCustomTokenSectionOpened = {
    base: false,
    quote: false
  };

  public customTokens = {
    base: {} as OrderBookToken,
    quote: {} as OrderBookToken
  };

  public isAdvancedSectionOpened: boolean = false;

  get areAdvancedOptionsValid(): boolean {
    return this._areAdvancedOptionsValid;
  }

  set areAdvancedOptionsValid(value) {
    this._areAdvancedOptionsValid = value;

    this.checkIfCreateTradeIsAvailable();
  }

  public _areAdvancedOptionsValid: boolean;

  constructor(private orderBookService: OrderBookService) {
    this.isCreateTradeAvailable = false;

    this.tradeInfo = {
      tokens: { base: {} as OrderBookToken, quote: {} as OrderBookToken }
    } as TradeInfo;
  }

  private resetTokens(): void {
    this.tradeInfo.tokens = {
      base: {
        ...this.tradeInfo.tokens.base,
        address: '',
        name: '',
        symbol: '',
        decimals: 8
      },
      quote: {
        ...this.tradeInfo.tokens.quote,
        address: '',
        name: '',
        symbol: '',
        decimals: 8
      }
    };
  }

  public addCustomToken(tokenPart: string, tokenBody: TokenInfoBody): void {
    this.customTokens[tokenPart] = { ...this.customTokens[tokenPart], ...tokenBody };
  }

  private updateCustomTokenAddresses(): void {
    this.baseCustomToken?.control.updateValueAndValidity();
    this.quoteCustomToken?.control.updateValueAndValidity();
  }

  public setCustomToken(tokenPart: string): void {
    this.tradeInfo = {
      ...this.tradeInfo,
      tokens: {
        ...this.tradeInfo.tokens,
        [tokenPart]: {
          ...this.tradeInfo.tokens[tokenPart],
          ...this.customTokens[tokenPart]
        }
      }
    };
  }

  public onAmountChanges(tokenPart: string, amount: string): void {
    this.tradeInfo = {
      ...this.tradeInfo,
      tokens: {
        ...this.tradeInfo.tokens,
        [tokenPart]: {
          ...this.tradeInfo.tokens[tokenPart],
          amount
        }
      }
    };
  }

  private checkIfCreateTradeIsAvailable(): void {
    this.isCreateTradeAvailable = !!(
      this._areAdvancedOptionsValid &&
      this.tradeInfo.tokens &&
      this.tradeInfo.tokens.base.address &&
      this.tradeInfo.tokens.base.amount &&
      this.tradeInfo.tokens.quote.address &&
      this.tradeInfo.tokens.quote.amount
    );
  }

  public async createTrade(): Promise<void> {
    try {
      await this.orderBookService.createOrder(this.tradeInfo);
    } catch (err) {
      console.log('err', err);
    }
  }
}

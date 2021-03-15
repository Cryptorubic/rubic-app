import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Token } from 'src/app/shared/models/tokens/Token';
import { OrderBookToken, TradeInfo } from 'src/app/core/services/order-book/types';
import { OrderBookService } from 'src/app/core/services/order-book/order-book.service';
import { List } from 'immutable';
import { Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import SwapToken from '../../../../../shared/models/tokens/SwapToken';
import { TradeTypeService } from '../../../../../core/services/swaps/trade-type-service/trade-type.service';
import { TokensService } from '../../../../../core/services/backend/tokens-service/tokens.service';
import { TradeParametersService } from '../../../../../core/services/swaps/trade-parameters-service/trade-parameters.service';

interface OrderBooksParameters {
  fromAmount: BigNumber;
  fromToken: SwapToken;
  toAmount: BigNumber;
  toToken: SwapToken;
}

@Component({
  selector: 'app-order-books-form',
  templateUrl: './order-books-form.component.html',
  styleUrls: ['./order-books-form.component.scss']
})
export class OrderBooksFormComponent implements OnInit, OnDestroy {
  public blockchain: BLOCKCHAIN_NAME;

  private blockchainSubscription$: Subscription;

  private _tradeParameters: OrderBooksParameters;

  private _tokens = List<SwapToken>([]);

  public availableBaseTokens = List<SwapToken>([]);

  public availableQuoteTokens = List<SwapToken>([]);

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

  get tradeParameters(): OrderBooksParameters {
    return this._tradeParameters;
  }

  set tradeParameters(value) {
    if (
      this._tradeParameters.fromToken?.address === value.fromToken?.address &&
      this._tradeParameters.fromAmount?.isEqualTo(value.fromAmount) &&
      this._tradeParameters.toToken?.address === value.toToken?.address &&
      this._tradeParameters.toAmount?.isEqualTo(value.toAmount)
    ) {
      return;
    }
    this._tradeParameters = value;

    this.tradeParametersService.setTradeParameters(this.blockchain, {
      ...this._tradeParameters
    });
  }

  get tokens(): List<SwapToken> {
    return this._tokens;
  }

  set tokens(value: List<SwapToken>) {
    this._tokens = value.filter(token => token.blockchain === this.blockchain);
    this.availableQuoteTokens = this._tokens.concat();
    this.availableBaseTokens = this._tokens.concat();
  }

  get baseToken(): SwapToken {
    return this.tradeParameters.fromToken;
  }

  set baseToken(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      fromToken: value
    };
    this.availableQuoteTokens = this.tokens.filter(token => token.address !== value?.address);
  }

  get quoteToken(): SwapToken {
    return this.tradeParameters.toToken;
  }

  set quoteToken(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      toToken: value
    };
    this.availableBaseTokens = this.tokens.filter(token => token.address !== value?.address);
  }

  get baseAmountAsString(): string {
    return !this.tradeParameters.fromAmount || this.tradeParameters.fromAmount?.isNaN()
      ? ''
      : this.tradeParameters.fromAmount.toFixed();
  }

  set baseAmountAsString(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      fromAmount: new BigNumber(value)
    };
  }

  get quoteAmountAsString(): string {
    return !this.tradeParameters.toAmount || this.tradeParameters.toAmount?.isNaN()
      ? ''
      : this.tradeParameters.toAmount.toFixed();
  }

  set quoteAmountAsString(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      toAmount: new BigNumber(value)
    };
  }

  get tradeInfo(): TradeInfo {
    return this._tradeInfo;
  }

  set tradeInfo(value) {
    this._tradeInfo = value;

    this.checkIfCreateTradeIsAvailable();
  }

  get areAdvancedOptionsValid(): boolean {
    return this._areAdvancedOptionsValid;
  }

  set areAdvancedOptionsValid(value) {
    this._areAdvancedOptionsValid = value;

    this.checkIfCreateTradeIsAvailable();
  }

  public _areAdvancedOptionsValid: boolean;

  @ViewChild('baseCustomToken') baseCustomToken: NgModel;

  @ViewChild('quoteCustomToken') quoteCustomToken: NgModel;

  constructor(
    private tradeTypeService: TradeTypeService,
    private tokensService: TokensService,
    private tradeParametersService: TradeParametersService,
    private orderBookService: OrderBookService
  ) {
    this.isCreateTradeAvailable = false;

    this.tradeInfo = {
      tokens: { base: {} as OrderBookToken, quote: {} as OrderBookToken }
    } as TradeInfo;
  }

  ngOnInit(): void {
    this.tokensService.tokens.subscribe(tokens => {
      this.tokens = tokens;
    });

    this.blockchainSubscription$ = this.tradeTypeService.getBlockchain().subscribe(blockchain => {
      this.blockchain = blockchain;
      this.tradeInfo = { ...this.tradeInfo, blockchain: this.blockchain };

      this.tokens = this.tokensService.tokens.getValue();

      this.updateCustomTokenAddresses();

      const tradeParameters = this.tradeParametersService.getTradeParameters(this.blockchain);

      this._tradeParameters = {
        fromToken: null,
        toToken: null,
        fromAmount: null,
        toAmount: null
      };

      this.baseToken = tradeParameters?.fromToken;
      this.quoteToken = tradeParameters?.toToken;
      this.baseAmountAsString = tradeParameters?.fromAmount?.toFixed(
        tradeParameters?.fromToken?.decimals
      );
    });
  }

  ngOnDestroy() {
    this.blockchainSubscription$.unsubscribe();
  }

  public revertTokens() {
    const { fromToken, toToken, fromAmount, toAmount } = this.tradeParameters;
    this.baseToken = toToken;
    this.quoteToken = fromToken;

    this.tradeParameters = {
      fromToken: toToken,
      toToken: fromToken,
      fromAmount: toAmount,
      toAmount: fromAmount
    };
  }

  public addCustomToken(tokenPart: string, tokenBody: Token): void {
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

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Token } from 'src/app/shared/models/tokens/Token';
import { List } from 'immutable';
import { Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { TradeParametersService } from 'src/app/core/services/swaps/trade-parameters-service/trade-parameters.service';
import { OrderBookFormToken } from 'src/app/core/services/order-book/types/tokens';
import { OrderBookTradeForm } from 'src/app/core/services/order-book/types/trade-form';
import { TradeParameters } from 'src/app/shared/models/swaps/TradeParameters';
import { OrderBooksFormService } from '../../services/order-book-form-service/order-books-form.service';

enum TRADE_STATE {
  TX_IN_PROGRESS = 'TX_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

@Component({
  selector: 'app-order-books-form',
  templateUrl: './order-books-form.component.html',
  styleUrls: ['./order-books-form.component.scss']
})
export class OrderBooksFormComponent implements OnInit, OnDestroy {
  public blockchain: BLOCKCHAIN_NAME;

  private blockchainSubscription$: Subscription;

  private _tradeParameters: TradeParameters;

  private _tokens = List<SwapToken>([]);

  public availableBaseTokens = List<SwapToken>([]);

  public availableQuoteTokens = List<SwapToken>([]);

  private _tradeForm: OrderBookTradeForm;

  private tradeFormSubscription$: Subscription;

  public isCustomTokenSectionOpened = {
    base: false,
    quote: false
  };

  public customToken = {
    base: {} as OrderBookFormToken,
    quote: {} as OrderBookFormToken
  };

  public tokensRate: BigNumber;

  public TRADE_STATE = TRADE_STATE;

  public selectedTradeState: TRADE_STATE;

  public transactionHash: string;

  get tradeParameters(): TradeParameters {
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

    this.tradeForm = {
      ...this.tradeForm,
      token: {
        base: {
          ...this.tradeForm.token.base,
          ...this._tradeParameters.fromToken,
          amount: this._tradeParameters.fromAmount
        },
        quote: {
          ...this.tradeForm.token.quote,
          ...this._tradeParameters.toToken,
          amount: this._tradeParameters.toAmount
        }
      }
    };

    this.calculateTokensRate();
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

  get tradeForm(): OrderBookTradeForm {
    return this._tradeForm;
  }

  set tradeForm(value) {
    this._tradeForm = {
      ...value,
      areAmountsAndTokensSet: !!(
        value.token.base?.address &&
        value.token.base?.amount.isGreaterThan(0) &&
        value.token.quote?.address &&
        value.token.quote?.amount.isGreaterThan(0)
      ),
      areOptionsValid: false
    };
    this.orderBookFormService.setTradeForm(this._tradeForm);
  }

  @ViewChild('baseCustomToken') baseCustomToken: NgModel;

  @ViewChild('quoteCustomToken') quoteCustomToken: NgModel;

  constructor(
    private tradeTypeService: TradeTypeService,
    private tokensService: TokensService,
    private tradeParametersService: TradeParametersService,
    private orderBookFormService: OrderBooksFormService
  ) {}

  ngOnInit(): void {
    // trade-form subscription
    this.tradeFormSubscription$ = this.orderBookFormService.getTradeForm().subscribe(tradeForm => {
      this._tradeForm = tradeForm;
      this.updateCustomTokensValidity();
    });

    // blockchain subscription
    this.blockchainSubscription$ = this.tradeTypeService.getBlockchain().subscribe(blockchain => {
      this.blockchain = blockchain;

      this.tradeForm = { ...this.tradeForm, blockchain: this.blockchain };
      this.updateCustomTokensValidity();

      this.tokens = this.tokensService.tokens.getValue();

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
      this.quoteAmountAsString = tradeParameters?.toAmount?.toFixed(
        tradeParameters?.toToken?.decimals
      );
    });

    // tokens subscription
    this.tokensService.tokens.subscribe(tokens => {
      this.tokens = tokens;

      const foundBaseToken = tokens.find(t => t.address === this.baseToken?.address);
      if (foundBaseToken) {
        this.baseToken = foundBaseToken;
      }

      const foundQuoteToken = tokens.find(t => t.address === this.quoteToken?.address);
      if (foundQuoteToken) {
        this.quoteToken = foundQuoteToken;
      }
    });
  }

  ngOnDestroy() {
    this.blockchainSubscription$.unsubscribe();
    this.tradeFormSubscription$.unsubscribe();
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

  public setCustomToken(tokenPart: string, tokenBody: Token): void {
    const token = this.tokens.find(t => t.address === tokenBody.address);
    this.customToken[tokenPart] = token
      ? { ...token }
      : { ...this.customToken[tokenPart], ...tokenBody };
  }

  private updateCustomTokensValidity(): void {
    this.baseCustomToken?.control.updateValueAndValidity();
    this.quoteCustomToken?.control.updateValueAndValidity();
  }

  public addCustomToken(tokenPart: string): void {
    if (tokenPart === 'base') {
      this.baseToken = { ...this.customToken.base };
    } else {
      this.quoteToken = { ...this.customToken.quote };
    }
  }

  private calculateTokensRate(): void {
    if (
      !(this.baseToken?.price && this.tradeForm.token.base?.amount.isGreaterThan(0)) ||
      !(this.quoteToken?.price && this.tradeForm.token.quote?.amount.isGreaterThan(0))
    ) {
      this.tokensRate = null;
      return;
    }

    const baseRate = this.tradeForm.token.base.amount.times(this.baseToken.price);
    const quoteRate = this.tradeForm.token.quote.amount.times(this.quoteToken.price);
    this.tokensRate = quoteRate.minus(baseRate).div(baseRate).times(100);
  }

  public createTrade(): void {
    this.orderBookFormService
      .createOrder(this.tradeForm, () => {
        this.selectedTradeState = TRADE_STATE.TX_IN_PROGRESS;
      })
      .then(transactionHash => {
        this.selectedTradeState = TRADE_STATE.COMPLETED;
        this.transactionHash = transactionHash;
      })
      .catch(err => {
        this.selectedTradeState = TRADE_STATE.ERROR;
        console.log('err', err);
      });
  }
}

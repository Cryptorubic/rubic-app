import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { TradeParameters } from 'src/app/shared/models/swaps/TradeParameters';
import { MatDialog } from '@angular/material/dialog';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { MessageBoxComponent } from 'src/app/shared/components/message-box/message-box.component';
import { Router } from '@angular/router';
import { OrderBookFormToken, OrderBookTradeForm } from '../../models/trade-form';
import { NetworkErrorComponent } from '../../../../bridge-page/components/network-error/network-error.component';
import { MetamaskError } from '../../../../../shared/models/errors/provider/MetamaskError';
import { OrderBooksFormService } from './services/order-books-form.service';

enum TRADE_STATUS {
  STARTED = 'STARTED',
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

  private _blockchainSubscription$: Subscription;

  private _tradeParameters: TradeParameters;

  private _tokens = List<SwapToken>([]);

  private _tokensSubscription$: Subscription;

  public availableBaseTokens = List<SwapToken>([]);

  public availableQuoteTokens = List<SwapToken>([]);

  private _tradeForm: OrderBookTradeForm;

  private _tradeFormSubscription$: Subscription;

  public isCustomTokenSectionOpened = {
    base: false,
    quote: false
  };

  public customToken = {
    base: {} as OrderBookFormToken,
    quote: {} as OrderBookFormToken
  };

  public tokensRate: BigNumber;

  public TRADE_STATUS = TRADE_STATUS;

  public selectedTradeState: TRADE_STATUS;

  public transactionHash: string;

  private createdUniqueLink: string;

  get tradeParameters(): TradeParameters {
    return this._tradeParameters;
  }

  set tradeParameters(value) {
    if (
      this._tradeParameters.fromToken?.address === value.fromToken?.address &&
      new BigNumber(this._tradeParameters.fromAmount).isEqualTo(value.fromAmount) &&
      this._tradeParameters.toToken?.address === value.toToken?.address &&
      new BigNumber(this._tradeParameters.toAmount).isEqualTo(value.toAmount)
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
    return this.tradeParameters?.fromToken;
  }

  set baseToken(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      fromToken: value
    };
    this.availableQuoteTokens = this.tokens.filter(token => token.address !== value?.address);
  }

  get quoteToken(): SwapToken {
    return this.tradeParameters?.toToken;
  }

  set quoteToken(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      toToken: value
    };
    this.availableBaseTokens = this.tokens.filter(token => token.address !== value?.address);
  }

  get baseAmount(): string {
    return this.tradeParameters.fromAmount;
  }

  set baseAmount(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      fromAmount: value
    };
  }

  get quoteAmount(): string {
    return this.tradeParameters.toAmount;
  }

  set quoteAmount(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      toAmount: value
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
        new BigNumber(value.token.base?.amount).isGreaterThan(0) &&
        value.token.quote?.address &&
        new BigNumber(value.token.quote?.amount).isGreaterThan(0)
      ),
      areOptionsValid: false
    };
    this.orderBookFormService.setTradeForm(this._tradeForm);
  }

  @ViewChild('baseCustomToken') baseCustomToken: NgModel;

  @ViewChild('quoteCustomToken') quoteCustomToken: NgModel;

  constructor(
    private router: Router,
    private tradeTypeService: TradeTypeService,
    private tokensService: TokensService,
    private tradeParametersService: TradeParametersService,
    private orderBookFormService: OrderBooksFormService,
    private changeDetectionRef: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // trade-form subscription
    this._tradeFormSubscription$ = this.orderBookFormService.getTradeForm().subscribe(tradeForm => {
      this._tradeForm = tradeForm;
      this.updateCustomTokensValidity();

      if (tradeForm.areOptionsValid) {
        this.changeDetectionRef.detectChanges();
      }
    });

    // blockchain subscription
    this._blockchainSubscription$ = this.tradeTypeService.getBlockchain().subscribe(blockchain => {
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
      this.baseAmount = tradeParameters?.fromAmount;
      this.quoteAmount = tradeParameters?.toAmount;
    });

    // tokens subscription
    this._tokensSubscription$ = this.tokensService.tokens.subscribe(tokens => {
      this.tokens = tokens;

      const foundBaseToken = this.tokens.find(
        t => t.address.toLowerCase() === this.baseToken?.address.toLowerCase()
      );
      if (foundBaseToken) {
        this.baseToken = foundBaseToken;
      }

      const foundQuoteToken = this.tokens.find(
        t => t.address.toLowerCase() === this.quoteToken?.address.toLowerCase()
      );
      if (foundQuoteToken) {
        this.quoteToken = foundQuoteToken;
      }
    });
  }

  ngOnDestroy() {
    this._blockchainSubscription$.unsubscribe();
    this._tradeFormSubscription$.unsubscribe();
    this._tokensSubscription$.unsubscribe();
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
    const token = this.tokens.find(
      t => t.address.toLowerCase() === tokenBody.address.toLowerCase()
    );
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
      !(
        this.baseToken?.price && new BigNumber(this.tradeForm.token.base?.amount).isGreaterThan(0)
      ) ||
      !(
        this.quoteToken?.price && new BigNumber(this.tradeForm.token.quote?.amount).isGreaterThan(0)
      )
    ) {
      this.tokensRate = null;
      return;
    }

    const baseRate = new BigNumber(this.tradeForm.token.base.amount).times(this.baseToken.price);
    const quoteRate = new BigNumber(this.tradeForm.token.quote.amount).times(this.quoteToken.price);
    this.tokensRate = quoteRate.minus(baseRate).div(baseRate).times(100);
  }

  public createTrade(): void {
    this.selectedTradeState = TRADE_STATUS.STARTED;

    this.orderBookFormService
      .createOrder(this.tradeForm, () => {
        this.selectedTradeState = TRADE_STATUS.TX_IN_PROGRESS;
      })
      .then(({ transactionHash, uniqueLink }) => {
        this.selectedTradeState = TRADE_STATUS.COMPLETED;
        this.transactionHash = transactionHash;
        this.createdUniqueLink = uniqueLink;
      })
      .catch((err: RubicError) => {
        this.selectedTradeState = TRADE_STATUS.ERROR;
        let data: any = { title: 'Error', descriptionText: err.comment };
        if (err instanceof MetamaskError) {
          data.title = 'Warning';
        }
        if (err instanceof NetworkError) {
          data = {
            title: 'Error',
            descriptionComponentClass: NetworkErrorComponent,
            descriptionComponentInputs: { networkError: err }
          };
        }
        this.dialog.open(MessageBoxComponent, {
          width: '400px',
          data
        });
      });
  }

  public navigateToTrade(): void {
    this.router.navigate(['trade', this.createdUniqueLink]);
  }
}

import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Token } from 'src/app/shared/models/tokens/Token';
import { List } from 'immutable';
import { Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { TradeTypeService } from 'src/app/core/services/swaps-old/trade-type-service/trade-type.service';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { TradeParametersService } from 'src/app/core/services/swaps-old/trade-parameters-service/trade-parameters.service';
import { TradeParameters } from 'src/app/shared/models/swaps/TradeParameters';
import { MatDialog } from '@angular/material/dialog';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import { Router } from '@angular/router';
import { OrderBookTradeForm } from '../../models/trade-form';
import { OrderBooksFormService } from './services/order-books-form.service';
import { TokenPart } from '../../../../../shared/models/order-book/tokens';
import { ErrorsOldService } from '../../../../../core/services/errors-old/errors-old.service';

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

  public availableFromTokens = List<SwapToken>([]);

  public availableToTokens = List<SwapToken>([]);

  private _tradeForm: OrderBookTradeForm;

  private _tradeFormSubscription$: Subscription;

  public customToken = {
    from: {} as SwapToken,
    to: {} as SwapToken
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
    const tokensParametersAreTheSame =
      this._tradeParameters?.fromToken?.address === value.fromToken?.address &&
      this._tradeParameters?.fromAmount === value.fromAmount &&
      this._tradeParameters?.toToken?.address === value.toToken?.address &&
      this._tradeParameters?.toAmount === value.toAmount;

    this._tradeParameters = value;

    this.tradeParametersService.setTradeParameters(this.blockchain, {
      ...this._tradeParameters
    });

    if (tokensParametersAreTheSame) {
      return;
    }

    this.tradeForm = {
      ...this.tradeForm,
      token: {
        from: {
          ...(this._tradeParameters.fromToken && this.tradeForm.token.from),
          ...this._tradeParameters.fromToken,
          amount: this._tradeParameters.fromAmount
        },
        to: {
          ...(this._tradeParameters.toToken && this.tradeForm.token.to),
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
    this.availableToTokens = this._tokens.concat();
    this.availableFromTokens = this._tokens.concat();
  }

  get fromToken(): SwapToken {
    return this.tradeParameters?.fromToken;
  }

  set fromToken(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      fromToken: value
    };
    this.availableToTokens = this.tokens.filter(token => token.address !== value?.address);
  }

  get toToken(): SwapToken {
    return this.tradeParameters?.toToken;
  }

  set toToken(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      toToken: value
    };
    this.availableFromTokens = this.tokens.filter(token => token.address !== value?.address);
  }

  get fromAmount(): string {
    return this.tradeParameters?.fromAmount;
  }

  set fromAmount(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      fromAmount: value
    };
  }

  get toAmount(): string {
    return this.tradeParameters?.toAmount;
  }

  set toAmount(value) {
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
        value.token.from?.address &&
        new BigNumber(value.token.from?.amount).isGreaterThan(0) &&
        value.token.to?.address &&
        new BigNumber(value.token.to?.amount).isGreaterThan(0)
      ),
      areOptionsValid: false
    };
    this.orderBookFormService.setTradeForm(this._tradeForm);
  }

  constructor(
    private router: Router,
    private tradeTypeService: TradeTypeService,
    private tokensService: TokensService,
    private tradeParametersService: TradeParametersService,
    private orderBookFormService: OrderBooksFormService,
    private changeDetectionRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private readonly errorsService: ErrorsOldService
  ) {}

  ngOnInit(): void {
    // trade-form subscription
    this._tradeFormSubscription$ = this.orderBookFormService.getTradeForm().subscribe(tradeForm => {
      this._tradeForm = tradeForm;

      if (tradeForm.areOptionsValid) {
        this.changeDetectionRef.detectChanges();
      }
    });

    // blockchain subscription
    this._blockchainSubscription$ = this.tradeTypeService.getBlockchain().subscribe(blockchain => {
      this.blockchain = blockchain;

      this.tradeForm = { ...this.tradeForm, blockchain: this.blockchain };

      this.tokens = this.tokensService.tokens.getValue();

      const tradeParameters = this.tradeParametersService.getTradeParameters(this.blockchain);

      this._tradeParameters = {
        ...tradeParameters,
        fromToken: null,
        toToken: null,
        fromAmount: null,
        toAmount: null
      };

      this.fromToken = tradeParameters?.fromToken;
      this.toToken = tradeParameters?.toToken;
      this.fromAmount = tradeParameters?.fromAmount;
      this.toAmount = tradeParameters?.toAmount;
    });

    // tokens subscription
    this._tokensSubscription$ = this.tokensService.tokens.subscribe(tokens => {
      this.tokens = tokens;

      const foundFromToken = this.tokens.find(
        t => t.address.toLowerCase() === this.fromToken?.address.toLowerCase()
      );
      if (foundFromToken) {
        this.fromToken = foundFromToken;
      }

      const foundToToken = this.tokens.find(
        t => t.address.toLowerCase() === this.toToken?.address.toLowerCase()
      );
      if (foundToToken) {
        this.toToken = foundToToken;
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
    this.fromToken = toToken;
    this.toToken = fromToken;

    this.tradeParameters = {
      ...this.tradeParameters,
      fromToken: toToken,
      toToken: fromToken,
      fromAmount: toAmount,
      toAmount: fromAmount
    };
  }

  public setIsCustomTokenFormOpened(tokenPart: TokenPart, isOpened: boolean): void {
    if (tokenPart === 'from') {
      this.tradeParameters = {
        ...this.tradeParameters,
        isCustomFromTokenFormOpened: isOpened
      };
    } else {
      this.tradeParameters = {
        ...this.tradeParameters,
        isCustomToTokenFormOpened: isOpened
      };
    }
  }

  public setCustomTokenAddress(tokenPart: TokenPart, address: string): void {
    if (tokenPart === 'from') {
      this.tradeParameters = {
        ...this.tradeParameters,
        customFromTokenAddress: address
      };
    } else {
      this.tradeParameters = {
        ...this.tradeParameters,
        customToTokenAddress: address
      };
    }
  }

  public updateCustomToken(tokenPart: TokenPart, tokenBody: Token): void {
    const token = this.tokens.find(
      t => t.address.toLowerCase() === tokenBody.address.toLowerCase()
    );
    this.customToken[tokenPart] = token
      ? { ...token }
      : { ...this.customToken[tokenPart], ...tokenBody };
  }

  public addCustomToken(tokenPart: TokenPart): void {
    if (tokenPart === 'from') {
      this.fromToken = { ...this.customToken.from };
    } else {
      this.toToken = { ...this.customToken.to };
    }
  }

  public isAnyTokenCustom(): boolean {
    return (
      (this.fromToken &&
        !this.tokens.find(t => t.address.toLowerCase() === this.fromToken.address.toLowerCase())) ||
      (this.toToken &&
        !this.tokens.find(t => t.address.toLowerCase() === this.toToken.address.toLowerCase()))
    );
  }

  private calculateTokensRate(): void {
    if (
      !(
        this.fromToken?.price && new BigNumber(this.tradeForm.token.from?.amount).isGreaterThan(0)
      ) ||
      !(this.toToken?.price && new BigNumber(this.tradeForm.token.to?.amount).isGreaterThan(0))
    ) {
      this.tokensRate = null;
      return;
    }

    const fromTokenRate = new BigNumber(this.tradeForm.token.from.amount).times(
      this.fromToken.price
    );
    const toTokenRate = new BigNumber(this.tradeForm.token.to.amount).times(this.toToken.price);
    this.tokensRate = toTokenRate.minus(fromTokenRate).div(fromTokenRate).times(100);
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
        this.errorsService.showErrorDialog(err);
      });
  }

  public navigateToTrade(): void {
    this.router.navigate(['trade', this.createdUniqueLink]);
  }
}

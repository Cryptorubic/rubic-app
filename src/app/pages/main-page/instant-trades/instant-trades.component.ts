import { Component, Input, OnInit } from '@angular/core';
import { BLOCKCHAIN_NAMES } from '../trades-form/types';
import { List } from 'immutable';
import { TokensService } from '../../../services/backend/tokens-service/tokens.service';
import { SwapToken } from '../../../services/backend/tokens-service/types';
import { InstantTrade } from '../../../services/instant-trade/types';
import { UniSwapService } from '../../../services/instant-trade/uni-swap-service/uni-swap.service';
import BigNumber from 'bignumber.js';

interface InstantTradeParameters {
  fromAmount: BigNumber;
  fromToken: SwapToken;
  toToken: SwapToken;
}

@Component({
  selector: 'app-instant-trades',
  templateUrl: './instant-trades.component.html',
  styleUrls: ['./instant-trades.component.scss']
})
export class InstantTradesComponent implements OnInit {
  @Input() blockchain: BLOCKCHAIN_NAMES;

  private _tradeParameters: InstantTradeParameters;

  public tokens = List<SwapToken>([]);
  public uniSwapTrade: InstantTrade;
  public oneInchTrade: InstantTrade;

  get tradeParameters(): InstantTradeParameters {
    return this._tradeParameters;
  }

  set tradeParameters(value) {
    this._tradeParameters = value;

    if (value.fromAmount && value.fromToken && value.toToken) {
      this.calculateTradeParameters();
    }
  }

  get fromToken(): SwapToken {
    return this.tradeParameters.fromToken;
  }

  set fromToken(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      fromToken: value
    };
  }

  get toToken(): SwapToken {
    return this.tradeParameters.toToken;
  }

  set toToken(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      toToken: value
    };
  }

  get fromAmount(): string {
    if (this.tradeParameters.fromAmount) {
      if (this.tradeParameters.fromToken) {
        return this.tradeParameters.fromAmount.toFixed(this.tradeParameters.fromToken.decimals);
      } else {
        return this.tradeParameters.fromAmount.toString();
      }
    }
    return '';
  }

  set fromAmount(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      fromAmount: new BigNumber(value)
    };
  }

  get toAmountUniSwap() {
    return this.uniSwapTrade
      ? this.uniSwapTrade.to.amount.toFixed(this.uniSwapTrade.to.token.decimals)
      : '';
  }

  constructor(private tokenService: TokensService, private uniSwapService: UniSwapService) {
    tokenService.tokens.subscribe(tokens => (this.tokens = tokens));

    this.tradeParameters = {
      fromToken: null,
      toToken: null,
      fromAmount: null
    };
  }

  ngOnInit() {}

  private calculateTradeParameters() {
    if (this.blockchain === BLOCKCHAIN_NAMES.ETHEREUM) {
      this.calculateEthereumParameters();
    }
  }

  private calculateEthereumParameters() {
    debugger;
    this.uniSwapService
      .calculateTrade(this.tradeParameters.fromAmount, this.fromToken, this.toToken)
      .then(calculatedTrade => {
        this.uniSwapTrade = calculatedTrade;
      });
  }
}

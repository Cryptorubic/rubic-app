import { Component, Input, OnInit } from '@angular/core';
import { BLOCKCHAIN_NAMES } from '../trades-form/types';
import { List } from 'immutable';
import { TokensService } from '../../../services/backend/tokens-service/tokens.service';
import { SwapToken } from '../../../services/backend/tokens-service/types';
import { InstantTrade } from '../../../services/instant-trade/types';
import { UniSwapService } from '../../../services/instant-trade/uni-swap-service/uni-swap.service';

@Component({
  selector: 'app-instant-trades',
  templateUrl: './instant-trades.component.html',
  styleUrls: ['./instant-trades.component.scss']
})
export class InstantTradesComponent implements OnInit {
  @Input() blockchain: BLOCKCHAIN_NAMES;
  public tokens = List<SwapToken>([]);
  private _fromToken: SwapToken;
  private _toToken: SwapToken;
  private _trade: InstantTrade;

  get fromToken(): SwapToken {
    return this._fromToken;
  }

  set fromToken(value) {
    this._fromToken = value;
    this.trade = {
      ...this.trade,
      from: {
        token: this._fromToken,
        amount: this.trade && this.trade.from && this.trade.from.amount
      }
    };
  }

  get toToken(): SwapToken {
    return this._toToken;
  }

  set toToken(value) {
    this._toToken = value;
    this.trade = {
      ...this.trade,
      to: {
        token: this._toToken,
        amount: null
      }
    };
  }

  get trade(): InstantTrade {
    return this._trade;
  }

  set trade(value) {
    this._trade = value;

    if (this._trade.from.token && this._trade.to.token && this._trade.from.amount) {
      this.calculateTradeParameters();
    }
  }

  constructor(private tokenService: TokensService, private uniSwapService: UniSwapService) {
    tokenService.tokens.subscribe(tokens => (this.tokens = tokens));
  }

  ngOnInit() {}

  private calculateTradeParameters() {
    if (this.blockchain === BLOCKCHAIN_NAMES.ETHEREUM) {
      this.calculateEthereumParameters();
    }
  }

  private calculateEthereumParameters() {
    this.uniSwapService
      .calculateTrade(this.trade.from.amount, this.trade.from.token, this.trade.to.token)
      .then(calculatedTrade => {
        this.trade = calculatedTrade;
      });
  }
}

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BLOCKCHAIN_NAMES } from '../trades-form/types';
import { List } from 'immutable';
import { TokensService } from '../../../services/backend/tokens-service/tokens.service';
import { SwapToken } from '../../../services/backend/tokens-service/types';
import { InstantTrade } from '../../../services/instant-trade/types';
import { UniSwapService } from '../../../services/instant-trade/uni-swap-service/uni-swap.service';
import BigNumber from 'bignumber.js';
import InstantTradeService from '../../../services/instant-trade/InstantTradeService';
import { OneInchService } from '../../../services/instant-trade/one-inch-service/one-inch.service';
import { BurgerSwapService } from '../../../services/instant-trade/burger-swap-service/burger-swap-service';

interface TradeProviderInfo {
  label: string;
}

interface InstantTradeParameters {
  fromAmount: BigNumber;
  fromToken: SwapToken;
  toToken: SwapToken;
}

interface InstantTradeProviderController {
  trade: InstantTrade;
  tradeState: TRADE_STATE;
  tradeProviderInfo: TradeProviderInfo;
}

enum TRADE_STATE {
  CALCULATION = 'CALCULATION',
  APPROVAL = 'APPROVAL',
  TX_IN_PROGRESS = 'TX_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

@Component({
  selector: 'app-instant-trades',
  templateUrl: './instant-trades.component.html',
  styleUrls: ['./instant-trades.component.scss']
})
export class InstantTradesComponent implements OnChanges {
  @Input() blockchain: BLOCKCHAIN_NAMES;

  private instantTradeServices: InstantTradeService[];
  private _tradeParameters: InstantTradeParameters;

  public tokens = List<SwapToken>([]);
  public trades: InstantTradeProviderController[];

  get tradeParameters(): InstantTradeParameters {
    return this._tradeParameters;
  }

  set tradeParameters(value) {
    this._tradeParameters = value;

    if (value.fromAmount && !value.fromAmount.isNaN() && value.fromToken && value.toToken) {
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

  get fromAmountAsString(): string {
    return this.tradeParameters.fromAmount?.toFixed() || '';
  }

  set fromAmountAsString(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      fromAmount: new BigNumber(value)
    };
  }

  constructor(
    private tokenService: TokensService,
    private uniSwapService: UniSwapService,
    private oneInchService: OneInchService,
    private burgerSwapService: BurgerSwapService
  ) {
    tokenService.tokens.subscribe(tokens => (this.tokens = tokens));
  }

  private initInstantTradeProviders() {
    switch (this.blockchain) {
      case BLOCKCHAIN_NAMES.ETHEREUM:
        this.instantTradeServices = [this.oneInchService, this.uniSwapService];
        this.trades = [
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: 'Oneinch'
            }
          },
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: 'Uniswap'
            }
          }
        ];
        break;
      case BLOCKCHAIN_NAMES.BINANCE_SMART_CHAIN:
        this.instantTradeServices = [this.burgerSwapService];
        this.trades = [
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: 'Burgerswap'
            }
          }
        ];
        break;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.blockchain.currentValue !== changes.blockchain.previousValue) {
      this.initInstantTradeProviders();

      this.tradeParameters = {
        fromToken: null,
        toToken: null,
        fromAmount: null
      };
    }
  }

  public revertTokens() {
    const { fromToken, toToken } = this.tradeParameters;
    const toAmount = this.trades[1].trade?.to?.amount;
    this.tradeParameters = {
      fromToken: toToken,
      toToken: fromToken,
      fromAmount: toAmount
    };
  }

  public getToAmount(providerIndex: number): string {
    const to = this.trades[providerIndex]?.trade?.to;
    return to ? to.amount.toFixed(to.token.decimals) : '';
  }

  public checkIfError(providerIndex: number): boolean {
    return this.trades[providerIndex].tradeState === TRADE_STATE.ERROR;
  }

  public shouldAnimateButton(providerIndex: number) {
    const tradeState = this.trades[providerIndex].tradeState;
    return tradeState && tradeState !== TRADE_STATE.ERROR && tradeState !== TRADE_STATE.COMPLETED;
  }

  private calculateTradeParameters() {
    this.instantTradeServices.forEach((service, index) =>
      this.calculateProviderTrade(service, this.trades[index])
    );
  }

  private calculateProviderTrade(
    service: InstantTradeService,
    tradeController: InstantTradeProviderController
  ) {
    tradeController.trade = null;
    tradeController.tradeState = TRADE_STATE.CALCULATION;
    service
      .calculateTrade(this.tradeParameters.fromAmount, this.fromToken, this.toToken)
      .then(calculatedTrade => {
        tradeController.trade = calculatedTrade;
        tradeController.tradeState = null;
      })
      .catch(error => {
        console.error(error);
        tradeController.tradeState = TRADE_STATE.ERROR;
      });
  }
}

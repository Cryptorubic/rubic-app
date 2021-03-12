import { Component, OnDestroy, OnInit } from '@angular/core';
import { List } from 'immutable';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { InstantTrade } from 'src/app/core/services/instant-trade/types';
import { UniSwapService } from 'src/app/core/services/instant-trade/uni-swap-service/uni-swap.service';
import BigNumber from 'bignumber.js';
import InstantTradeService from 'src/app/core/services/instant-trade/InstantTradeService';
import { OneInchService } from 'src/app/core/services/instant-trade/one-inch-service/one-inch.service';
import { BurgerSwapService } from 'src/app/core/services/instant-trade/burger-swap-service/burger-swap-service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Subscription } from 'rxjs';
import { TradeTypeService } from '../../../../../core/services/swaps/trade-type-service/trade-type.service';
import { TradeParametersService } from '../../../../../core/services/swaps/trade-parameters-service/trade-parameters.service';

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
  isBestRate: boolean;
}

enum TRADE_STATE {
  CALCULATION = 'CALCULATION',
  APPROVAL = 'APPROVAL',
  TX_IN_PROGRESS = 'TX_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

@Component({
  selector: 'app-instant-trades-form',
  templateUrl: './instant-trades-form.component.html',
  styleUrls: ['./instant-trades-form.component.scss']
})
export class InstantTradesFormComponent implements OnInit, OnDestroy {
  private _blockchain: BLOCKCHAIN_NAME;

  private _blockchainSubscription$: Subscription;

  private _instantTradeServices: InstantTradeService[];

  private _tradeParameters: InstantTradeParameters;

  private _tokens = List<SwapToken>([]);

  public availableFromTokens = List<SwapToken>([]);

  public availableToTokens = List<SwapToken>([]);

  public trades: InstantTradeProviderController[];

  get tokens(): List<SwapToken> {
    return this._tokens;
  }

  set tokens(value: List<SwapToken>) {
    this._tokens = value.filter(token => token.blockchain === this._blockchain);
    this.availableToTokens = this._tokens.concat();
    this.availableFromTokens = this._tokens.concat();
  }

  get tradeParameters(): InstantTradeParameters {
    return this._tradeParameters;
  }

  set tradeParameters(value) {
    this._tradeParameters = value;

    this.tradesParametersService.setTradeParameters(this._blockchain, {
      ...this._tradeParameters,
      toAmount: null
    });

    this.trades = this.trades.map(tradeController => ({
      ...tradeController,
      isBestRate: false
    }));

    if (value.fromAmount && !value.fromAmount.isNaN() && value.fromToken && value.toToken) {
      this.calculateTradeParameters();
    } else {
      this.trades = this.trades.map(tradeController => ({
        ...tradeController,
        trade: null,
        tradeState: null
      }));
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
    this.availableToTokens = this.tokens.filter(token => token.address !== value?.address);
  }

  get toToken(): SwapToken {
    return this.tradeParameters.toToken;
  }

  set toToken(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      toToken: value
    };
    this.availableFromTokens = this.tokens.filter(token => token.address !== value?.address);
  }

  get fromAmountAsString(): string {
    return this.tradeParameters.fromAmount?.toFixed(this.fromToken?.decimals) || '';
  }

  set fromAmountAsString(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      fromAmount: new BigNumber(value)
    };
  }

  constructor(
    private tradeTypeService: TradeTypeService,
    private tradesParametersService: TradeParametersService,
    private tokenService: TokensService,
    private uniSwapService: UniSwapService,
    private oneInchService: OneInchService,
    private burgerSwapService: BurgerSwapService
  ) {
    tokenService.tokens.subscribe(tokens => {
      this.tokens = tokens;
    });
  }

  private initInstantTradeProviders() {
    switch (this._blockchain) {
      case BLOCKCHAIN_NAME.ETHEREUM:
        this._instantTradeServices = [this.oneInchService, this.uniSwapService];
        this.trades = [
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: 'Oneinch'
            },
            isBestRate: false
          },
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: 'Uniswap'
            },
            isBestRate: false
          }
        ];
        break;
      case BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN:
        this._instantTradeServices = [this.burgerSwapService];
        this.trades = [
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: 'Burgerswap'
            },
            isBestRate: false
          }
        ];
        break;
      default:
        console.log(`Blockchain ${this._blockchain} was not found.`);
    }
  }

  ngOnInit() {
    this._blockchainSubscription$ = this.tradeTypeService.getBlockchain().subscribe(blockchain => {
      this._blockchain = blockchain;
      this.initInstantTradeProviders();

      this.tokens = this.tokenService.tokens.getValue();

      const tradeParameters = this.tradesParametersService.getTradeParameters(this._blockchain);

      this._tradeParameters = {
        fromToken: null,
        toToken: null,
        fromAmount: null
      };

      this.fromToken = tradeParameters?.fromToken;
      this.toToken = tradeParameters?.toToken;
      this.fromAmountAsString = tradeParameters?.fromAmount?.toFixed(
        tradeParameters?.fromToken?.decimals
      );
    });
  }

  ngOnDestroy() {
    this._blockchainSubscription$.unsubscribe();
  }

  public revertTokens() {
    const { fromToken, toToken } = this.tradeParameters;
    const toAmount = this.trades[1].trade?.to?.amount;
    this.fromToken = toToken;
    this.toToken = fromToken;

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
    const { tradeState } = this.trades[providerIndex];
    return tradeState && tradeState !== TRADE_STATE.ERROR && tradeState !== TRADE_STATE.COMPLETED;
  }

  private async calculateTradeParameters() {
    const calculationPromises: Promise<void>[] = [];
    this._instantTradeServices.forEach((service, index) =>
      calculationPromises.push(this.calculateProviderTrade(service, this.trades[index]))
    );
    await Promise.allSettled(calculationPromises);
    this.calculateBestRate();
    const toAmount = this.trades.find(tradeController => tradeController.isBestRate)?.trade?.to
      ?.amount;
    this.tradesParametersService.setTradeParameters(this._blockchain, {
      ...this.tradeParameters,
      toAmount
    });
  }

  private async calculateProviderTrade(
    service: InstantTradeService,
    tradeController: InstantTradeProviderController
  ): Promise<void> {
    tradeController.trade = null;
    tradeController.tradeState = TRADE_STATE.CALCULATION;
    try {
      const calculatedTrade = await service.calculateTrade(
        this.tradeParameters.fromAmount,
        this.fromToken,
        this.toToken
      );
      if (tradeController.tradeState === TRADE_STATE.CALCULATION) {
        tradeController.trade = calculatedTrade;
        tradeController.tradeState = null;
      }
    } catch (error) {
      console.error(error);
      tradeController.trade = null;
      tradeController.tradeState = TRADE_STATE.ERROR;
    }
  }

  private calculateBestRate(): void {
    let bestRateProviderIndex;
    let bestRateProviderProfit = new BigNumber(-Infinity);
    this.trades.forEach((tradeController, index) => {
      if (tradeController.trade) {
        const { gasFeeInUsd, to } = tradeController.trade;
        const toToken = this.tokens.find(token => token.address === to.token.address);
        const amountInUsd = to.amount?.multipliedBy(toToken.price);

        if (amountInUsd && gasFeeInUsd) {
          const profit = amountInUsd.minus(gasFeeInUsd);
          if (profit.gt(bestRateProviderProfit)) {
            bestRateProviderProfit = profit;
            bestRateProviderIndex = index;
          }
        }
      }
    });

    if (bestRateProviderIndex !== undefined) {
      this.trades[bestRateProviderIndex] = {
        ...this.trades[bestRateProviderIndex],
        isBestRate: true
      };
    }
  }
}

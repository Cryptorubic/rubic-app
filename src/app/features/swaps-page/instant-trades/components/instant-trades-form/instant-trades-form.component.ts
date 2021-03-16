import { Component, OnDestroy, OnInit } from '@angular/core';
import { List } from 'immutable';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { UniSwapService } from 'src/app/features/swaps-page/instant-trades/services/uni-swap-service/uni-swap.service';
import BigNumber from 'bignumber.js';
import InstantTradeService from 'src/app/features/swaps-page/instant-trades/services/InstantTradeService';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Subscription } from 'rxjs';
import { TradeTypeService } from '../../../../../core/services/swaps/trade-type-service/trade-type.service';
import { TradeParametersService } from '../../../../../core/services/swaps/trade-parameters-service/trade-parameters.service';
import InstantTrade from '../../models/InstantTrade';
import InstantTradeToken from '../../models/InstantTradeToken';
import { OneInchEthService } from '../../services/one-inch-service/one-inch-eth-service/one-inch-eth.service';
import { OneInchBscService } from '../../services/one-inch-service/one-inch-bsc-service/one-inch-bsc.service';

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

  public TRADE_STATE = TRADE_STATE;

  public availableFromTokens = List<SwapToken>([]);

  public availableToTokens = List<SwapToken>([]);

  public trades: InstantTradeProviderController[];

  public selectedTradeState: TRADE_STATE;

  public transactionHash: string;

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
    if (
      this._tradeParameters.fromToken?.address === value.fromToken?.address &&
      this._tradeParameters.fromAmount?.isEqualTo(value.fromAmount) &&
      this._tradeParameters.toToken?.address === value.toToken?.address
    ) {
      return;
    }
    this._tradeParameters = value;

    this.tradeParametersService.setTradeParameters(this._blockchain, {
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
    return !this.tradeParameters.fromAmount || this.tradeParameters.fromAmount?.isNaN()
      ? ''
      : this.tradeParameters.fromAmount.toFixed();
  }

  set fromAmountAsString(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      fromAmount: new BigNumber(value)
    };
  }

  constructor(
    private tradeTypeService: TradeTypeService,
    private tradeParametersService: TradeParametersService,
    private tokensService: TokensService,
    private uniSwapService: UniSwapService,
    private oneInchEthService: OneInchEthService,
    private onInchBscService: OneInchBscService
  ) {
    tokensService.tokens.subscribe(tokens => {
      this.tokens = tokens;
    });
  }

  private initInstantTradeProviders() {
    switch (this._blockchain) {
      case BLOCKCHAIN_NAME.ETHEREUM:
        this._instantTradeServices = [this.oneInchEthService, this.uniSwapService];
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
        this._instantTradeServices = [this.onInchBscService];
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

      this.tokens = this.tokensService.tokens.getValue();

      const tradeParameters = this.tradeParametersService.getTradeParameters(this._blockchain);

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

  private isCalculatedTradeActual(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ) {
    return (
      this._tradeParameters.fromToken?.address === fromToken?.address &&
      this._tradeParameters.fromAmount?.isEqualTo(fromAmount) &&
      this._tradeParameters.toToken?.address === toToken?.address
    );
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
    const tradeParams = {
      ...this.tradeParameters
    };
    const calculationPromises: Promise<void>[] = [];
    this._instantTradeServices.forEach((service, index) =>
      calculationPromises.push(this.calculateProviderTrade(service, this.trades[index]))
    );
    await Promise.allSettled(calculationPromises);
    if (
      this.isCalculatedTradeActual(
        tradeParams.fromAmount,
        tradeParams.fromToken,
        tradeParams.toToken
      )
    ) {
      this.calculateBestRate();
      const toAmount = this.trades.find(tradeController => tradeController.isBestRate)?.trade?.to
        ?.amount;
      this.tradeParametersService.setTradeParameters(this._blockchain, {
        ...this.tradeParameters,
        toAmount
      });
    }
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
      if (!calculatedTrade) {
        tradeController.trade = null;
        tradeController.tradeState = TRADE_STATE.ERROR;
        return;
      }
      if (
        this.isCalculatedTradeActual(
          calculatedTrade.from.amount,
          calculatedTrade.from.token,
          calculatedTrade.to.token
        )
      ) {
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
    this.trades = this.trades.map(tradeController => ({
      ...tradeController,
      isBestRate: false
    }));

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

  public createTrade(selectedServiceIndex: number) {
    const setTradeState = (state: TRADE_STATE) => {
      this.trades[selectedServiceIndex].tradeState = state;
      this.selectedTradeState = state;
    };
    this._instantTradeServices[selectedServiceIndex]
      .createTrade(this.trades[selectedServiceIndex].trade, {
        onApprove: () => setTradeState(TRADE_STATE.APPROVAL),
        onConfirm: () => setTradeState(TRADE_STATE.TX_IN_PROGRESS)
      })
      .then(receipt => {
        setTradeState(TRADE_STATE.COMPLETED);
        this.transactionHash = receipt.transactionHash;
      });
  }

  public onCloseModal() {
    this.trades.map(trade => ({ ...trade, tradeState: null }));
    this.selectedTradeState = null;
    this.transactionHash = undefined;
  }
}

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { List } from 'immutable';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { UniSwapService } from 'src/app/features/swaps-page/instant-trades/services/uni-swap-service/uni-swap.service';
import BigNumber from 'bignumber.js';
import InstantTradeService from 'src/app/features/swaps-page/instant-trades/services/InstantTradeService';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';
import { TradeParametersService } from 'src/app/core/services/swaps/trade-parameters-service/trade-parameters.service';
import { DOCUMENT } from '@angular/common';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { skip, take } from 'rxjs/operators';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import InstantTrade from '../../models/InstantTrade';
import InstantTradeToken from '../../models/InstantTradeToken';
import { OneInchEthService } from '../../services/one-inch-service/one-inch-eth-service/one-inch-eth.service';
import { OneInchBscService } from '../../services/one-inch-service/one-inch-bsc-service/one-inch-bsc.service';
import { MessageBoxComponent } from '../../../../../shared/components/message-box/message-box.component';
import { RubicError } from '../../../../../shared/models/errors/RubicError';
import { NetworkError } from '../../../../../shared/models/errors/provider/NetworkError';
import { NetworkErrorComponent } from '../../../../bridge-page/components/network-error/network-error.component';
import ADDRESS_TYPE from '../../../../../shared/models/blockchain/ADDRESS_TYPE';
import { InstantTradesApiService } from '../../../../../core/services/backend/instant-trades-api/instant-trades-api.service';
import { MetamaskError } from '../../../../../shared/models/errors/provider/MetamaskError';
import { PancakeSwapService } from '../../services/pancake-swap-service/pancake-swap.service';
import { Token } from '../../../../../shared/models/tokens/Token';

interface TradeProviderInfo {
  label: string;
}

interface InstantTradeParameters {
  fromAmount: string;
  fromToken: SwapToken;
  toToken: SwapToken;

  isCustomFromTokenFormOpened: boolean;
  isCustomToTokenFormOpened: boolean;
  customFromTokenAddress: string;
  customToTokenAddress: string;
}

interface InstantTradeProviderController {
  trade: InstantTrade;
  tradeState: TRADE_STATUS;
  tradeProviderInfo: TradeProviderInfo;
  isBestRate: boolean;
}

enum TRADE_STATUS {
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
  private _blockchainSubscription$: Subscription;

  private _blockchainSubscription2$: Subscription;

  private _instantTradeServices: InstantTradeService[];

  private _tradeParameters: InstantTradeParameters;

  private _tokens = List<SwapToken>([]);

  private _tokensSubscription$: Subscription;

  private _tokensSubscription2$: Subscription;

  public blockchain: BLOCKCHAIN_NAME;

  public TRADE_STATUS = TRADE_STATUS;

  public ADDRESS_TYPE = ADDRESS_TYPE;

  public BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  public availableFromTokens = List<SwapToken>([]);

  public availableToTokens = List<SwapToken>([]);

  public trades: InstantTradeProviderController[];

  public selectedTradeState: TRADE_STATUS;

  public transactionHash: string;

  public customToken = {
    from: {} as SwapToken,
    to: {} as SwapToken
  };

  public get hasBestRate(): boolean {
    return this.trades.some(provider => provider.isBestRate);
  }

  public get isIframe(): boolean {
    return this.document.body.classList.contains('iframe');
  }

  get tokens(): List<SwapToken> {
    return this._tokens;
  }

  set tokens(value: List<SwapToken>) {
    this._tokens = value.filter(token => token.blockchain === this.blockchain);
    this.availableToTokens = this._tokens.concat();
    this.availableFromTokens = this._tokens.concat();
  }

  get tradeParameters(): InstantTradeParameters {
    return this._tradeParameters;
  }

  set tradeParameters(value) {
    if (
      this._tradeParameters.fromToken?.address === value.fromToken?.address &&
      this._tradeParameters.fromAmount === value.fromAmount &&
      this._tradeParameters.toToken?.address === value.toToken?.address
    ) {
      this._tradeParameters = value;
      const toAmount = this.trades
        .find(tradeController => tradeController.isBestRate)
        ?.trade?.to?.amount.toFixed();

      this.tradeParametersService.setTradeParameters(this.blockchain, {
        ...this._tradeParameters,
        toAmount
      });
      return;
    }

    this._tradeParameters = value;

    this.tradeParametersService.setTradeParameters(this.blockchain, {
      ...this._tradeParameters,
      toAmount: null
    });

    this.trades = this.trades.map(tradeController => ({
      ...tradeController,
      isBestRate: false
    }));

    if (
      value.fromAmount &&
      !new BigNumber(value.fromAmount).isNaN() &&
      value.fromToken &&
      value.toToken
    ) {
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
    if (this.queryParamsService.currentQueryParams) {
      const fromQuery = this.queryParamsService.currentQueryParams?.from;
      if (value) {
        let param = value.symbol;
        if (fromQuery) {
          param = this.queryParamsService.isAddressQuery(fromQuery) ? value.address : value.symbol;
        }
        this.queryParamsService.setQueryParam('from', param);
      }
    } else if (value) {
      this.queryParamsService.setQueryParam('from', value.symbol);
    }
    this.queryParamsService.navigate();
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

    const toQuery = this.queryParamsService.currentQueryParams?.to;
    if (value) {
      let param = value.symbol;
      if (toQuery) {
        param = this.queryParamsService.isAddressQuery(toQuery) ? value.address : value.symbol;
      }
      this.queryParamsService.setQueryParam('to', param);
      this.queryParamsService.navigate();
    }
  }

  get fromAmount(): string {
    return this.tradeParameters.fromAmount;
  }

  set fromAmount(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      fromAmount: value
    };

    this.queryParamsService.setQueryParam('amount', value);
    this.queryParamsService.navigate();
  }

  get fromAmountAsNumber(): BigNumber {
    return new BigNumber(this.tradeParameters.fromAmount);
  }

  constructor(
    private tradeTypeService: TradeTypeService,
    private tradeParametersService: TradeParametersService,
    private tokensService: TokensService,
    private uniSwapService: UniSwapService,
    private oneInchEthService: OneInchEthService,
    private onInchBscService: OneInchBscService,
    private pancakeSwapService: PancakeSwapService,
    private dialog: MatDialog,
    private instantTradesApiService: InstantTradesApiService,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly queryParamsService: QueryParamsService,
    private readonly web3private: Web3PublicService
  ) {}

  private initInstantTradeProviders() {
    switch (this.blockchain) {
      case BLOCKCHAIN_NAME.ETHEREUM:
        this._instantTradeServices = [this.oneInchEthService, this.uniSwapService];
        this.trades = [
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: '1inch'
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
        this._instantTradeServices = [this.onInchBscService, this.pancakeSwapService];
        this.trades = [
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: '1inch'
            },
            isBestRate: false
          },
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: 'Pancakeswap'
            },
            isBestRate: false
          }
        ];
        break;
      default:
        console.log(`Blockchain ${this.blockchain} was not found.`);
    }
  }

  ngOnInit() {
    this._tokensSubscription$ = this.tokensService.tokens.pipe(take(2)).subscribe(tokens => {
      this.tokens = tokens;

      this.setupParams().then(() => this.searchTokensAfter());
    });

    this._tokensSubscription2$ = this.tokensService.tokens.pipe(skip(2)).subscribe(tokens => {
      this.tokens = tokens;
    });

    this._blockchainSubscription$ = this.tradeTypeService
      .getBlockchain()
      .pipe(take(1))
      .subscribe(blockchain => {
        const haveParams = Boolean(this.queryParamsService.currentQueryParams);
        const chain = this.queryParamsService.currentQueryParams?.chain;
        this.blockchain = (chain as BLOCKCHAIN_NAME) || blockchain;
        this.tradeTypeService.setBlockchain(this.blockchain);

        if (haveParams) {
          this.queryParamsService.setQueryParam('chain', this.blockchain);
        }

        this.initInstantTradeProviders();
        this.tokens = this.tokensService.tokens.getValue();

        const tradeParameters = this.tradeParametersService.getTradeParameters(this.blockchain);
        this._tradeParameters = {
          ...tradeParameters,
          fromToken: null,
          toToken: null,
          fromAmount: null
        };

        this.fromToken = tradeParameters?.fromToken;
        this.toToken = tradeParameters?.toToken;
        this.fromAmount =
          this.queryParamsService.currentQueryParams.amount || tradeParameters?.fromAmount;

        this.queryParamsService.navigate();
      });

    this._blockchainSubscription2$ = this.tradeTypeService
      .getBlockchain()
      .pipe(skip(1))
      .subscribe(blockchain => {
        this.blockchain = blockchain;
        this.queryParamsService.setQueryParam('chain', this.blockchain);
        this.initInstantTradeProviders();
        this.tokens = this.tokensService.tokens.getValue();

        const tradeParameters = this.tradeParametersService.getTradeParameters(this.blockchain);

        this._tradeParameters = {
          ...tradeParameters,
          fromToken: null,
          toToken: null,
          fromAmount: null
        };

        this.fromToken = tradeParameters?.fromToken;
        this.toToken = tradeParameters?.toToken;
        this.fromAmount = tradeParameters?.fromAmount;

        this.queryParamsService.clearCurrentParams();
        this.queryParamsService.navigate();
      });
  }

  ngOnDestroy() {
    this._tokensSubscription$.unsubscribe();
    this._tokensSubscription2$.unsubscribe();
    this._blockchainSubscription2$.unsubscribe();
    this._blockchainSubscription$.unsubscribe();
  }

  private async setupParams(): Promise<void> {
    const haveParams = Boolean(this.queryParamsService.currentQueryParams);

    if (this.tokens.size > 0 && haveParams) {
      await this.searchFromToken();
      await this.searchToToken();
    }
  }

  private isCalculatedTradeActual(
    fromAmount: string,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ) {
    return (
      this._tradeParameters.fromToken?.address === fromToken?.address &&
      new BigNumber(this._tradeParameters.fromAmount).isEqualTo(fromAmount) &&
      this._tradeParameters.toToken?.address === toToken?.address
    );
  }

  public revertTokens() {
    const { fromToken, toToken } = this.tradeParameters;
    const toAmount = this.trades[0].trade?.to?.amount.toFixed();
    this.fromToken = toToken;
    this.toToken = fromToken;

    this.tradeParameters = {
      ...this.tradeParameters,
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
    return this.trades[providerIndex].tradeState === TRADE_STATUS.ERROR;
  }

  public shouldAnimateButton(providerIndex: number) {
    const { tradeState } = this.trades[providerIndex];
    return tradeState && tradeState !== TRADE_STATUS.ERROR && tradeState !== TRADE_STATUS.COMPLETED;
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
      const toAmount = this.trades
        .find(tradeController => tradeController.isBestRate)
        ?.trade?.to?.amount.toFixed();
      this.tradeParametersService.setTradeParameters(this.blockchain, {
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
    tradeController.tradeState = TRADE_STATUS.CALCULATION;
    try {
      const calculatedTrade = await service.calculateTrade(
        new BigNumber(this.tradeParameters.fromAmount),
        this.fromToken,
        this.toToken
      );
      if (!calculatedTrade) {
        tradeController.trade = null;
        tradeController.tradeState = TRADE_STATUS.ERROR;
        return;
      }
      if (
        this.isCalculatedTradeActual(
          calculatedTrade.from.amount.toFixed(),
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
      tradeController.tradeState = TRADE_STATUS.ERROR;
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

  public setIsCustomTokenFormOpened(part: 'from' | 'to', isOpened: boolean): void {
    if (part === 'from') {
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

  public setCustomTokenAddress(part: 'from' | 'to', address: string): void {
    if (part === 'from') {
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

  public updateCustomToken(part: 'from' | 'to', tokenBody: Token): void {
    const token = this.tokens.find(
      t => t.address.toLowerCase() === tokenBody.address.toLowerCase()
    );
    this.customToken[part] = token ? { ...token } : { ...this.customToken[part], ...tokenBody };
  }

  public addCustomToken(part: 'from' | 'to'): void {
    if (part === 'from') {
      this.fromToken = { ...this.customToken.from };
      this.queryParamsService.setQueryParam(part, this.customToken.from.address);
    } else {
      this.toToken = { ...this.customToken.to };
      this.queryParamsService.setQueryParam(part, this.customToken.to.address);
    }
    this.queryParamsService.navigate();
  }

  public isAnyTokenCustom(): boolean {
    return (
      (this.fromToken &&
        !this.tokens.find(t => t.address.toLowerCase() === this.fromToken.address.toLowerCase())) ||
      (this.toToken &&
        !this.tokens.find(t => t.address.toLowerCase() === this.toToken.address.toLowerCase()))
    );
  }

  public createTrade(selectedServiceIndex: number) {
    const setTradeState = (state: TRADE_STATUS) => {
      this.trades[selectedServiceIndex].tradeState = state;
      this.selectedTradeState = state;
    };
    this._instantTradeServices[selectedServiceIndex]
      .createTrade(this.trades[selectedServiceIndex].trade, {
        onApprove: () => setTradeState(TRADE_STATUS.APPROVAL),
        onConfirm: () => setTradeState(TRADE_STATUS.TX_IN_PROGRESS)
      })
      .then(receipt => {
        setTradeState(TRADE_STATUS.COMPLETED);
        this.transactionHash = receipt.transactionHash;
        this.instantTradesApiService.notifyInstantTradesBot({
          provider: this.trades[selectedServiceIndex].tradeProviderInfo.label,
          blockchain: this.blockchain,
          walletAddress: receipt.from,
          trade: this.trades[selectedServiceIndex].trade,
          txHash: receipt.transactionHash
        });
      })
      .catch((err: RubicError) => {
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

  public onCloseModal() {
    this.trades.map(trade => ({ ...trade, tradeState: null }));
    this.selectedTradeState = null;
    this.transactionHash = undefined;
  }

  public getCustomToken = (query: String) => {
    return this.web3private[this.blockchain].getTokenInfo(query).then((token: Token) => ({
      blockchain: undefined,
      image: undefined,
      rank: undefined,
      price: undefined,
      used_in_iframe: undefined,
      ...token
    }));
  };

  private searchTokenBySymbol(queryParam: string): SwapToken {
    const similarTokens = this.tokens.filter(
      token => token.symbol.toLowerCase() === queryParam.toLowerCase()
    );
    return similarTokens.size > 0
      ? similarTokens.find(token => token.used_in_iframe)
      : similarTokens.first();
  }

  private searchTokenByAddress(queryParam: string): SwapToken {
    return this.tokens.find(token => token.address.toLowerCase() === queryParam.toLowerCase());
  }

  private async searchFromToken(): Promise<void> {
    const fromQuery = this.queryParamsService.currentQueryParams.from;
    if (fromQuery) {
      if (this.queryParamsService.isAddressQuery(fromQuery)) {
        const from = this.searchTokenByAddress(fromQuery) || (await this.getCustomToken(fromQuery));
        this.fromToken = await from;
      } else {
        const from = this.searchTokenBySymbol(fromQuery);
        if (from) {
          this.fromToken = from;
        }
      }
    }
  }

  private async searchToToken(): Promise<void> {
    const toQuery = this.queryParamsService.currentQueryParams.to;
    if (toQuery) {
      if (this.queryParamsService.isAddressQuery(toQuery)) {
        const to = this.searchTokenByAddress(toQuery) || (await this.getCustomToken(toQuery));
        this.toToken = await to;
      } else {
        const to = this.searchTokenBySymbol(this.queryParamsService.currentQueryParams.to);
        if (to) {
          this.toToken = to;
        }
      }
    }
  }

  private async searchTokensAfter() {
    if (this.fromToken || this.toToken) {
      if (this.fromToken) {
        if (
          this.fromToken.symbol === this.queryParamsService.defaultETHparams.to ||
          this.fromToken.symbol === this.queryParamsService.defaultBSCparams.to
        ) {
          this.queryParamsService.swapDefaultParams();
        }
      } else if (
        this.toToken.symbol === this.queryParamsService.defaultETHparams.from ||
        this.toToken.symbol === this.queryParamsService.defaultBSCparams.from
      ) {
        this.queryParamsService.swapDefaultParams();
      }

      this.queryParamsService.setDefaultParams();
      this.queryParamsService.navigate();

      if (!this.fromToken) this.searchFromToken();
      if (!this.toToken) this.searchToToken();
      if (!this.fromAmount) this.fromAmount = this.queryParamsService.currentQueryParams.amount;
    }
  }
}

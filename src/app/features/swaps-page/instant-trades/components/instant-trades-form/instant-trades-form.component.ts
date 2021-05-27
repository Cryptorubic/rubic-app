import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { List } from 'immutable';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { UniSwapService } from 'src/app/features/swaps-page/instant-trades/services/uni-swap-service/uni-swap.service';
import BigNumber from 'bignumber.js';
import InstantTradeService from 'src/app/features/swaps-page/instant-trades/services/InstantTradeService';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';
import { TradeParametersService } from 'src/app/core/services/swaps/trade-parameters-service/trade-parameters.service';
import { AsyncPipe, DOCUMENT } from '@angular/common';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { OneInchPolService } from 'src/app/features/swaps-page/instant-trades/services/one-inch-service/one-inch-pol-service/one-inch-pol.service';
import InstantTradeToken from '../../models/InstantTradeToken';
import { OneInchEthService } from '../../services/one-inch-service/one-inch-eth-service/one-inch-eth.service';
import { OneInchBscService } from '../../services/one-inch-service/one-inch-bsc-service/one-inch-bsc.service';
import { MessageBoxComponent } from '../../../../../shared/components/message-box/message-box.component';
import { RubicError } from '../../../../../shared/models/errors/RubicError';
import { NetworkError } from '../../../../../shared/models/errors/provider/NetworkError';
import ADDRESS_TYPE from '../../../../../shared/models/blockchain/ADDRESS_TYPE';
import { InstantTradesApiService } from '../../../../../core/services/backend/instant-trades-api/instant-trades-api.service';
import { MetamaskError } from '../../../../../shared/models/errors/provider/MetamaskError';
import { PancakeSwapService } from '../../services/pancake-swap-service/pancake-swap.service';
import { Token } from '../../../../../shared/models/tokens/Token';
import { QuickSwapService } from '../../services/quick-swap-service/quick-swap.service';
import { NetworkErrorComponent } from '../../../../../shared/components/network-error/network-error.component';
import { INSTANT_TRADES_STATUS } from '../../models/instant-trades-trade-status';
import { InstantTradeParameters } from '../../models/instant-trades-parametres';
import { InstantTradeProviderController } from '../../models/instant-trades-provider-controller';
import { INTSTANT_TRADES_TRADE_STATUS } from '../../../models/trade-data';
import { PROVIDERS } from '../../models/providers.enum';
import { TO_BACKEND_BLOCKCHAINS } from '../../../../../shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { Web3PublicService } from '../../../../../core/services/blockchain/web3-public-service/web3-public.service';
import { InstantTradesFormService } from './services/instant-trades-form.service';
import { REFRESH_BUTTON_STATUS } from '../../../../../shared/models/instant-trade/REFRESH_BUTTON_STATUS';

@Component({
  selector: 'app-instant-trades-form',
  templateUrl: './instant-trades-form.component.html',
  styleUrls: ['./instant-trades-form.component.scss']
})
export class InstantTradesFormComponent implements OnInit, OnDestroy {
  private _blockchainSubscription$: Subscription;

  private _instantTradeServices: InstantTradeService[];

  private _tradeParameters: InstantTradeParameters;

  private _tokens = List<SwapToken>([]);

  private _tokensSubscription$: Subscription;

  public blockchain: BLOCKCHAIN_NAME;

  private firstBlockhainEmitment = true;

  public readonly INSTANT_TRADES_STATUS = INSTANT_TRADES_STATUS;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public readonly BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  public availableFromTokens = List<SwapToken>([]);

  public availableToTokens = List<SwapToken>([]);

  public trades: InstantTradeProviderController[];

  public selectedTradeState: INSTANT_TRADES_STATUS;

  public transactionHash: string;

  public waitingForProvider: boolean;

  public bestProvider: InstantTradeProviderController;

  public bestProviderIndex: number;

  public customToken = {
    from: {} as SwapToken,
    to: {} as SwapToken
  };

  public refreshButtonStatus = REFRESH_BUTTON_STATUS.STAYING;

  public get hasBestRate(): boolean {
    return this.trades.some(provider => provider.isBestRate);
  }

  public get $isIframe(): Observable<boolean> {
    return this.queryParamsService.$isIframe;
  }

  public $tokensSelectionDisabled: Observable<boolean>;

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
      this._tradeParameters.toToken?.address === value.toToken?.address &&
      this._tradeParameters.gasOptimizationChecked === value.gasOptimizationChecked
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
      this.refreshButtonStatus = REFRESH_BUTTON_STATUS.STAYING;
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
    if (value) {
      this.queryParamsService.setQueryParam('from', value.symbol);
    }
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
    if (value) {
      this.queryParamsService.setQueryParam('to', value.symbol);
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
  }

  get fromAmountAsNumber(): BigNumber {
    return new BigNumber(this.tradeParameters.fromAmount);
  }

  get gasOptimizationChecked(): boolean {
    return this.tradeParameters.gasOptimizationChecked;
  }

  set gasOptimizationChecked(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      gasOptimizationChecked: value
    };
  }

  constructor(
    private tradeTypeService: TradeTypeService,
    private tradeParametersService: TradeParametersService,
    private tokensService: TokensService,
    private uniSwapService: UniSwapService,
    private oneInchEthService: OneInchEthService,
    private oneInchBscService: OneInchBscService,
    private pancakeSwapService: PancakeSwapService,
    private oneInchPolService: OneInchPolService,
    private quickSwapService: QuickSwapService,
    private dialog: MatDialog,
    private instantTradesApiService: InstantTradesApiService,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly queryParamsService: QueryParamsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly web3PublicService: Web3PublicService,
    private readonly instantTradesFormService: InstantTradesFormService
  ) {
    this.$tokensSelectionDisabled = this.queryParamsService.$tokensSelectionDisabled;
  }

  private initInstantTradeProviders() {
    switch (this.blockchain) {
      case BLOCKCHAIN_NAME.ETHEREUM:
        this._instantTradeServices = [this.oneInchEthService, this.uniSwapService];
        this.trades = [
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: '1inch',
              value: PROVIDERS.ONEINCH
            },
            isBestRate: false
          },
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: 'Uniswap',
              value: PROVIDERS.UNISWAP
            },
            isBestRate: false
          }
        ];
        break;
      case BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN:
        this._instantTradeServices = [this.oneInchBscService, this.pancakeSwapService];
        this.trades = [
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: '1inch',
              value: PROVIDERS.ONEINCH
            },
            isBestRate: false
          },
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: 'Pancakeswap',
              value: PROVIDERS.PANCAKESWAP
            },
            isBestRate: false
          }
        ];
        break;
      case BLOCKCHAIN_NAME.POLYGON:
        this._instantTradeServices = [this.oneInchPolService, this.quickSwapService];
        this.trades = [
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: '1inch',
              value: PROVIDERS.ONEINCH
            },
            isBestRate: false
          },
          {
            trade: null,
            tradeState: null,
            tradeProviderInfo: {
              label: 'Quickswap',
              value: PROVIDERS.QUICKSWAP
            },
            isBestRate: false
          }
        ];
        break;
      default:
        console.debug(`Blockchain ${this.blockchain} was not found.`);
    }
    [this.bestProvider] = this.trades;
  }

  ngOnInit() {
    if (this.tokens.size > 0 && this.queryParamsService.currentQueryParams) {
      this.queryParamsService.setupTradeForm(this.cdr);
    }
    this._tokensSubscription$ = this.tokensService.tokens
      .asObservable()
      .subscribe(tokens => this.setupTokens(tokens));
    this._blockchainSubscription$ = this.tradeTypeService
      .getBlockchain()
      .subscribe(blockchain => this.setupBlockchain(blockchain));
  }

  ngOnDestroy() {
    this._tokensSubscription$.unsubscribe();
    this._blockchainSubscription$.unsubscribe();
    this.queryParamsService.clearCurrentParams();
  }

  private setupTokens(tokens: List<SwapToken>): void {
    this.tokens = tokens;

    if (tokens.size > 0 && this.queryParamsService.currentQueryParams) {
      this.queryParamsService.setupTradeForm(this.cdr);
    }
  }

  private setupBlockchain(blockchain: BLOCKCHAIN_NAME): void {
    if (blockchain) {
      const queryChain = this.queryParamsService.currentQueryParams?.chain;
      const queryChainValue = Object.values(BLOCKCHAIN_NAME).find(el => el === queryChain);
      this.blockchain = this.firstBlockhainEmitment && queryChain ? queryChainValue : blockchain;
      this.firstBlockhainEmitment = false;
      this.initInstantTradeProviders();
      this.tokens = this.tokensService.tokens.getValue();
      const tradeParameters = this.tradeParametersService.getTradeParameters(this.blockchain);
      this._tradeParameters = {
        ...tradeParameters,
        fromToken: null,
        toToken: null,
        fromAmount: null,
        gasOptimizationChecked: true
      };

      this.fromToken = tradeParameters?.fromToken;
      this.toToken = tradeParameters?.toToken;
      this.fromAmount = tradeParameters?.fromAmount;
      if (!this.queryParamsService.currentQueryParams) {
        this.queryParamsService.initiateTradesParams({
          chain: this.blockchain
        });
      }
      this.queryParamsService.setQueryParam('chain', this.blockchain);
    }
  }

  private isCalculatedTradeActual(
    fromAmount: string,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    gasOptimizationChecked: boolean
  ) {
    return (
      this._tradeParameters.fromToken?.address === fromToken?.address &&
      new BigNumber(this._tradeParameters.fromAmount).isEqualTo(fromAmount) &&
      this._tradeParameters.toToken?.address === toToken?.address &&
      (gasOptimizationChecked === undefined ||
        this._tradeParameters.gasOptimizationChecked === gasOptimizationChecked)
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
    return this.trades[providerIndex].tradeState === INSTANT_TRADES_STATUS.ERROR;
  }

  public triggerRecalculateTradeParameters(): void {
    const isIframe = new AsyncPipe(this.cdr).transform(this.$isIframe);
    const tradeState = this.trades[this.bestProviderIndex]?.tradeState;
    if (
      isIframe &&
      ((tradeState &&
        tradeState !== INSTANT_TRADES_STATUS.ERROR &&
        tradeState !== INSTANT_TRADES_STATUS.COMPLETED) ||
        this.waitingForProvider)
    ) {
      return;
    }
    this.calculateTradeParameters();
  }

  public async calculateTradeParameters() {
    this.refreshButtonStatus = REFRESH_BUTTON_STATUS.REFRESHING;

    const tradeParams = {
      ...this.tradeParameters
    };
    const calculationPromises = this._instantTradeServices.map((provider, index) => {
      return this.calculateProviderTrade(provider, this.trades[index]);
    });
    await Promise.allSettled(calculationPromises);

    if (
      this.isCalculatedTradeActual(
        tradeParams.fromAmount,
        tradeParams.fromToken,
        tradeParams.toToken,
        tradeParams.gasOptimizationChecked
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
    this.refreshButtonStatus = REFRESH_BUTTON_STATUS.WAITING;
  }

  private async calculateProviderTrade(
    service: InstantTradeService,
    tradeController: InstantTradeProviderController
  ): Promise<void> {
    tradeController.trade = null;
    tradeController.tradeState = INSTANT_TRADES_STATUS.CALCULATION;
    try {
      const calculatedTrade = await service.calculateTrade(
        new BigNumber(this.tradeParameters.fromAmount),
        this.fromToken,
        this.toToken,
        this.gasOptimizationChecked
      );
      if (!calculatedTrade) {
        tradeController.trade = null;
        tradeController.tradeState = INSTANT_TRADES_STATUS.ERROR;
        return;
      }
      if (
        this.isCalculatedTradeActual(
          calculatedTrade.from.amount.toFixed(),
          calculatedTrade.from.token,
          calculatedTrade.to.token,
          calculatedTrade.options?.gasOptimizationChecked
        )
      ) {
        tradeController.trade = calculatedTrade;
        tradeController.tradeState = null;
      }
    } catch (error) {
      console.error(error);
      tradeController.trade = null;
      tradeController.tradeState = INSTANT_TRADES_STATUS.ERROR;
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
      const bestProvider = {
        ...this.trades[bestRateProviderIndex],
        isBestRate: true
      };
      this.bestProviderIndex = bestRateProviderIndex;
      this.bestProvider = bestProvider;
      this.trades[bestRateProviderIndex] = bestProvider;
    } else {
      [this.bestProvider] = this.trades;
      this.bestProviderIndex = 0;
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
    this.refreshButtonStatus = REFRESH_BUTTON_STATUS.STAYING;

    this.waitingForProvider = true;
    const setTradeState = (state: INSTANT_TRADES_STATUS) => {
      this.trades[selectedServiceIndex].tradeState = state;
      this.selectedTradeState = state;
    };

    let currentHash;

    this._instantTradeServices[selectedServiceIndex]
      .createTrade(this.trades[selectedServiceIndex].trade, {
        onApprove: () => {
          this.waitingForProvider = false;
          setTradeState(INSTANT_TRADES_STATUS.APPROVAL);
        },
        onConfirm: async hash => {
          this.waitingForProvider = false;
          setTradeState(INSTANT_TRADES_STATUS.TX_IN_PROGRESS);
          currentHash = hash;

          let tradeInfo;

          if (this.trades[selectedServiceIndex].tradeProviderInfo.value === PROVIDERS.ONEINCH) {
            tradeInfo = {
              hash,
              network: TO_BACKEND_BLOCKCHAINS[this.blockchain],
              provider: this.trades[selectedServiceIndex].tradeProviderInfo.value,
              from_token: this.tradeParameters.fromToken.address,
              to_token: this.tradeParameters.toToken.address,
              from_amount: Web3PublicService.tokenAmountToWei(
                this.tradeParameters.fromToken,
                this.trades[selectedServiceIndex].trade.from.amount
              ),
              to_amount: Web3PublicService.tokenAmountToWei(
                this.tradeParameters.toToken,
                this.trades[selectedServiceIndex].trade.to.amount
              )
            };
          } else {
            tradeInfo = {
              hash,
              provider: this.trades[selectedServiceIndex].tradeProviderInfo.value,
              network: TO_BACKEND_BLOCKCHAINS[this.blockchain]
            };
          }
          try {
            await this.instantTradesFormService.createTrade(tradeInfo, this.blockchain);
          } catch (err) {
            console.error(err);
          }
        }
      })
      .then(receipt => {
        setTradeState(INSTANT_TRADES_STATUS.COMPLETED);
        this.transactionHash = receipt.transactionHash;

        this.instantTradesFormService.updateTrade(
          receipt.transactionHash,
          INTSTANT_TRADES_TRADE_STATUS.COMPLETED
        );

        this.instantTradesApiService.notifyInstantTradesBot({
          provider: this.trades[selectedServiceIndex].tradeProviderInfo.label,
          blockchain: this.blockchain,
          walletAddress: receipt.from,
          trade: this.trades[selectedServiceIndex].trade,
          txHash: receipt.transactionHash
        });
      })
      .catch((err: RubicError) => {
        this.waitingForProvider = false;
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

        if (currentHash) {
          this.instantTradesFormService.updateTrade(
            currentHash,
            INTSTANT_TRADES_TRADE_STATUS.REJECTED
          );
        }
      })
      .finally(() => {
        this.refreshButtonStatus = REFRESH_BUTTON_STATUS.WAITING;
      });
  }

  public onCloseModal() {
    this.calculateTradeParameters();
  }
}

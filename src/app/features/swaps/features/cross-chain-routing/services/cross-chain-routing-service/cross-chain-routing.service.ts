import { PCacheable } from 'ts-cacheable';
import InsufficientFundsGasPriceValueError from '@core/errors/models/cross-chain-routing/insufficient-funds-gas-price-value';
import { CrossChainRoutingApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { SolanaWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-private.service';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  EthLikeBlockchainName
} from '@shared/models/blockchain/blockchain-name';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { GasService } from '@core/services/gas-service/gas.service';
import { AuthService } from '@core/services/auth/auth.service';
import { ContractExecutorFacadeService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/contract-executor-facade.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import CrossChainIsUnavailableWarning from '@core/errors/models/cross-chain-routing/cross-chainIs-unavailable-warning';
import InstantTradeToken from '@features/swaps/features/instant-trade/models/instant-trade-token';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { Inject, Injectable } from '@angular/core';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import InsufficientLiquidityError from '@core/errors/models/instant-trade/insufficient-liquidity-error';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import {
  SUPPORTED_CROSS_CHAIN_BLOCKCHAINS,
  SupportedCrossChainBlockchain
} from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { SolanaContractExecutorService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/solana-contract-executor.service';
import CustomError from '@core/errors/models/custom-error';
import FailedToCheckForTransactionReceiptError from '@core/errors/models/common/failed-to-check-for-transaction-receipt-error';
import MaxGasPriceOverflowWarning from '@core/errors/models/common/max-gas-price-overflow-warning';
import {
  CelerRubicTrade,
  CROSS_CHAIN_PROVIDER,
  CrossChainProvider,
  CrossChainTrade,
  SymbiosisTrade
} from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { EthLikeContractExecutorService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/eth-like-contract-executor.service';
import { ContractsDataService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contracts-data.service';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { compareAddresses } from '@shared/utils/utils';
import BigNumber from 'bignumber.js';
import {
  CelerRubicTradeInfo,
  SymbiosisTradeInfo
} from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade-info';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { IframeService } from '@core/services/iframe/iframe.service';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { SmartRouting } from 'src/app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';
import { CelerService } from './celer/celer.service';
import { CELER_CONTRACT } from './celer/constants/CELER_CONTRACT';
import { transitTokens } from './contracts-data/contract-data/constants/transit-tokens';
import { EstimateAmtResponse } from './celer/models/estimate-amt-response.interface';
import { CelerApiService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/celer/celer-api.service';
import { IndexedTradeAndToAmount, TradeAndToAmount } from './models/indexed-trade.interface';
import { WRAPPED_NATIVE } from './celer/constants/WRAPPED_NATIVE';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';
import { SymbiosisService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/symbiosis/symbiosis.service';
import { isEthLikeBlockchainName } from '@shared/utils/blockchain/check-blockchain-name';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { TuiDialogService } from '@taiga-ui/core';
import { SwapSchemeModalComponent } from '../../components/swap-scheme-modal/swap-scheme-modal.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { HeaderStore } from '@app/core/header/services/header.store';
import { SwapSchemeModalData } from '../../models/swap-scheme-modal-data.interface';
import { RubicError } from '@core/errors/models/rubic-error';

const CACHEABLE_MAX_AGE = 15_000;

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingService extends TradeService {
  public static isSupportedBlockchain(
    blockchain: BlockchainName
  ): blockchain is SupportedCrossChainBlockchain {
    return SUPPORTED_CROSS_CHAIN_BLOCKCHAINS.some(
      supportedBlockchain => supportedBlockchain === blockchain
    );
  }

  private readonly _smartRouting$ = new BehaviorSubject<SmartRouting>(null);

  public readonly smartRouting$ = this._smartRouting$.asObservable();

  public get smartRouting(): SmartRouting {
    return this._smartRouting$.getValue();
  }

  private readonly contracts = this.contractsDataService.contracts;

  private usingCeler: boolean = false;

  private isSupportedCelerBlockchainPair: boolean = false;

  private currentCrossChainProvider: CrossChainTrade;

  /**
   * Gets slippage, selected in settings, divided by 100%.
   */
  private get slippageTolerance(): number {
    return this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
  }

  private get swapViaCeler(): boolean {
    return this.isSupportedCelerBlockchainPair && this.usingCeler;
  }

  private readonly ccrUpperTransitAmountLimit = 280;

  private readonly disableRubicCcrForCelerSupportedBlockchains = true;

  public get crossChainProvider(): CrossChainProvider {
    return this.currentCrossChainProvider.type;
  }

  constructor(
    private readonly contractsDataService: ContractsDataService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly settingsService: SettingsService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly web3PrivateService: EthLikeWeb3PrivateService,
    private readonly swapFormService: SwapFormService,
    private readonly tokensService: TokensService,
    private readonly apiService: CrossChainRoutingApiService,
    private readonly gasService: GasService,
    private readonly contractExecutorFacade: ContractExecutorFacadeService,
    private readonly ethLikeContractExecutor: EthLikeContractExecutorService,
    private readonly solanaPrivateAdapter: SolanaWeb3PrivateService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly iframeService: IframeService,
    private readonly celerService: CelerService,
    private readonly celerApiService: CelerApiService,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly symbiosisService: SymbiosisService,
    private readonly headerStore: HeaderStore,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService
  ) {
    super('cross-chain-routing');
  }

  private async needApprove(): Promise<boolean> {
    if (this.currentCrossChainProvider.type === CROSS_CHAIN_PROVIDER.SYMBIOSIS) {
      return this.symbiosisService.needApprove();
    }

    const { fromToken, fromBlockchain } = this.swapFormService.inputValue;

    const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];
    const ccrContractAddress = this.contracts[fromBlockchain].address;
    const celerContractAddress = isEthLikeBlockchainName(fromBlockchain)
      ? CELER_CONTRACT[fromBlockchain]
      : null;
    return blockchainAdapter
      .getAllowance({
        tokenAddress: fromToken.address,
        ownerAddress: this.authService.userAddress,
        spenderAddress: this.swapViaCeler ? celerContractAddress : ccrContractAddress
      })
      .then(allowance => allowance.eq(0));
  }

  public async approve(): Promise<void> {
    this.checkDeviceAndShowNotification();

    let approveInProgressSubscription$: Subscription;
    const onTransactionHash = () => {
      approveInProgressSubscription$ = this.notificationsService.showApproveInProgress();
    };

    try {
      if (this.currentCrossChainProvider.type === CROSS_CHAIN_PROVIDER.SYMBIOSIS) {
        await this.symbiosisService.approve(onTransactionHash);
      } else {
        const { fromToken, fromBlockchain } = this.swapFormService.inputValue;

        const ccrContractAddress = this.contracts[fromBlockchain].address;
        const celerContractAddress = isEthLikeBlockchainName(fromBlockchain)
          ? CELER_CONTRACT[fromBlockchain]
          : null;

        await this.web3PrivateService.approveTokens(
          fromToken.address,
          this.swapViaCeler ? celerContractAddress : ccrContractAddress,
          'infinity',
          {
            onTransactionHash
          }
        );
      }

      this.notificationsService.showApproveSuccessful();
    } finally {
      approveInProgressSubscription$?.unsubscribe();
    }
  }

  public async calculateTrade(calculateNeedApprove = false): Promise<{
    toAmount: BigNumber;
    minAmountError?: BigNumber;
    maxAmountError?: BigNumber;
    needApprove?: boolean;
  }> {
    // @TODO Remove after near fix.
    const { fromBlockchain, toBlockchain } = this.swapFormService.inputValue;
    const isNear = fromBlockchain === BLOCKCHAIN_NAME.NEAR || toBlockchain === BLOCKCHAIN_NAME.NEAR;
    if (isNear) {
      throw new RubicError('Near blockchain is temporarily unavailable.');
    }

    const {
      provider: crossChainProvider,
      minAmountError,
      maxAmountError
    } = await this.getBestCrossChainProvider();

    this.currentCrossChainProvider = {
      type: crossChainProvider.type,
      trade: crossChainProvider.trade
    };

    const [gasData, needApprove] = await Promise.all([
      this.getGasData(),
      calculateNeedApprove ? this.needApprove() : undefined
    ]);
    this.currentCrossChainProvider = {
      ...this.currentCrossChainProvider,
      ...gasData
    };

    const toAmount = this.currentCrossChainProvider.trade
      ? this.currentCrossChainProvider.type === CROSS_CHAIN_PROVIDER.SYMBIOSIS
        ? (this.currentCrossChainProvider.trade as SymbiosisTrade).toAmount
        : (this.currentCrossChainProvider.trade as CelerRubicTrade).toAmountWithoutSlippage
      : null;

    if (crossChainProvider.type === CROSS_CHAIN_PROVIDER.SYMBIOSIS) {
      this.setSymbiosisSmartRouting();
    }

    return {
      toAmount,
      minAmountError,
      maxAmountError,
      needApprove
    };
  }

  private async getBestCrossChainProvider(): Promise<{
    provider: {
      type: CrossChainProvider;
      trade: CelerRubicTrade | SymbiosisTrade;
    };
    minAmountError?: BigNumber;
    maxAmountError?: BigNumber;
  }> {
    const [celerRubicResponse, symbiosisResponse] = await Promise.all([
      this.calculateCelerRubicTrade(),
      this.symbiosisService.calculateTrade()
    ]);
    let minAmountError = BigNumber.min(
      celerRubicResponse.minAmountError || Infinity,
      symbiosisResponse.minAmountError || Infinity
    );
    minAmountError = minAmountError.eq(Infinity) ? null : minAmountError;
    let maxAmountError = BigNumber.max(
      celerRubicResponse.maxAmountError || 0,
      symbiosisResponse.maxAmountError || 0
    );
    maxAmountError = maxAmountError.eq(0) ? null : maxAmountError;

    if (
      !celerRubicResponse.trade &&
      !symbiosisResponse.trade &&
      !minAmountError &&
      !maxAmountError
    ) {
      throw new InsufficientLiquidityError('CrossChainRouting');
    }

    if (!this.swapViaCeler || !symbiosisResponse.trade) {
      minAmountError = celerRubicResponse.minAmountError ? minAmountError : null;
      maxAmountError = celerRubicResponse.maxAmountError ? maxAmountError : null;

      return {
        provider: {
          type: this.swapViaCeler ? CROSS_CHAIN_PROVIDER.CELER : CROSS_CHAIN_PROVIDER.RUBIC,
          trade: celerRubicResponse.trade
        },
        minAmountError,
        maxAmountError
      };
    }

    if (
      !celerRubicResponse.trade ||
      celerRubicResponse.minAmountError ||
      celerRubicResponse.maxAmountError
    ) {
      return {
        provider: {
          type: CROSS_CHAIN_PROVIDER.SYMBIOSIS,
          trade: symbiosisResponse.trade
        }
      };
    }

    const celerRubicTrade = celerRubicResponse.trade;
    const fromTransitTokenAmount = celerRubicTrade.fromTransitTokenAmount;

    const symbiosisRatio = fromTransitTokenAmount.dividedBy(symbiosisResponse.trade.toAmount);

    const { fromBlockchain } = this.swapFormService.inputValue;
    const fromTransitToken = this.contracts[fromBlockchain].transitToken;
    const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];
    const nativeToken = this.tokensService.tokens.find(
      token =>
        token.blockchain === fromBlockchain && blockchainAdapter.isNativeAddress(token.address)
    );
    const nativeTokenPrice = (
      await this.getSortedProvidersList(
        fromBlockchain,
        nativeToken,
        celerRubicTrade.cryptoFee,
        fromTransitToken
      )
    )[0].tradeAndToAmount.toAmount;
    const celerRatio = fromTransitTokenAmount
      .plus(nativeTokenPrice)
      .dividedBy(celerRubicTrade.toTrade?.to.amount || celerRubicTrade.toTransitTokenAmount);

    if (celerRatio.lte(symbiosisRatio)) {
      return {
        provider: {
          type: CROSS_CHAIN_PROVIDER.CELER,
          trade: celerRubicTrade
        }
      };
    } else {
      return {
        provider: {
          type: CROSS_CHAIN_PROVIDER.SYMBIOSIS,
          trade: symbiosisResponse.trade
        }
      };
    }
  }

  private async calculateCelerRubicTrade(): Promise<{
    trade: CelerRubicTrade;
    minAmountError?: BigNumber;
    maxAmountError?: BigNumber;
  }> {
    try {
      const { fromBlockchain, fromToken, fromAmount, toBlockchain, toToken } =
        this.swapFormService.inputValue;

      if (this.isSupportedCelerBlockchainPair) {
        this.usingCeler = true;
      }

      this.handleNotWorkingBlockchains(fromBlockchain, toBlockchain);

      const fromTransitToken = this.contracts[fromBlockchain].transitToken;
      const toTransitToken = this.contracts[toBlockchain].transitToken;

      let fromSlippage = 1 - this.slippageTolerance / 2;
      let toSlippage = 1 - this.slippageTolerance / 2;

      const sourceBlockchainProviders = await this.getSortedProvidersList(
        fromBlockchain,
        fromToken,
        fromAmount,
        fromTransitToken,
        this.swapViaCeler ? WRAPPED_NATIVE[fromBlockchain] : undefined
      );
      let sourceBlockchainProvidersFiltered = this.swapViaCeler
        ? sourceBlockchainProviders.filter(provider => {
            return !this.contracts[fromBlockchain].isProviderAlgebra(provider.providerIndex);
          })
        : sourceBlockchainProviders;
      const srcTransitTokenAmount = sourceBlockchainProvidersFiltered[0].tradeAndToAmount.toAmount;

      if (
        this.isSupportedCelerBlockchainPair &&
        !srcTransitTokenAmount.gt(this.ccrUpperTransitAmountLimit) &&
        !this.disableRubicCcrForCelerSupportedBlockchains
      ) {
        this.usingCeler = false;
        sourceBlockchainProvidersFiltered = await this.getSortedProvidersList(
          fromBlockchain,
          fromToken,
          fromAmount,
          fromTransitToken
        );
      }

      const {
        providerIndex: fromProviderIndex,
        tradeAndToAmount: { trade: fromTrade, toAmount: fromTransitTokenAmount }
      } = sourceBlockchainProvidersFiltered[0];

      const cryptoFee = await this.getCryptoFee(fromBlockchain, toBlockchain);

      let finalTransitAmount: BigNumber;
      let celerEstimate: EstimateAmtResponse;
      let celerBridgeSlippage: number;
      let isPairOfCelerSupportedTransitTokens = false;

      if (this.swapViaCeler) {
        isPairOfCelerSupportedTransitTokens =
          await this.celerService.checkIsCelerBridgeSupportedTokenPair(fromToken, toToken);
        celerBridgeSlippage = await this.celerService.getCelerBridgeSlippage(
          fromBlockchain as EthLikeBlockchainName,
          toBlockchain as EthLikeBlockchainName,
          fromTransitTokenAmount
        );
        fromSlippage = toSlippage = isPairOfCelerSupportedTransitTokens
          ? 1
          : 1 - (this.slippageTolerance / 2 - celerBridgeSlippage);

        if (
          !this.settingsService.crossChainRoutingValue.autoSlippageTolerance &&
          celerBridgeSlippage > this.settingsService.crossChainRoutingValue.slippageTolerance
        ) {
          throw new CustomError(
            `Slippage tolerance is too low. Minimum value for the trade is ${
              (celerBridgeSlippage + this.slippageTolerance) * 100
            }`
          );
        }

        const amountWithSlippage = fromTransitTokenAmount.multipliedBy(
          compareAddresses(fromToken.address, fromTransitToken.address) ? 1 : fromSlippage
        );
        celerEstimate = await this.celerService.getCelerEstimate(
          fromBlockchain as EthLikeBlockchainName,
          toBlockchain as EthLikeBlockchainName,
          amountWithSlippage,
          celerBridgeSlippage
        );

        finalTransitAmount = Web3Pure.fromWei(
          celerEstimate.estimated_receive_amt,
          transitTokens[toBlockchain].decimals
        );
      } else {
        finalTransitAmount = fromTransitTokenAmount;
      }

      /**
       * @TODO Take crypto fee on contract.
       */
      if (fromBlockchain === BLOCKCHAIN_NAME.NEAR) {
        const nativeUsdPrice = await this.tokensService.getNativeCoinPriceInUsd(
          BLOCKCHAIN_NAME.NEAR
        );
        const feeInUsd = cryptoFee.multipliedBy(nativeUsdPrice);

        finalTransitAmount = fromTransitTokenAmount.minus(feeInUsd);
      }

      const { toTransitTokenAmount, feeInPercents } = await this.getToTransitTokenAmount(
        fromBlockchain,
        toBlockchain,
        finalTransitAmount,
        fromTrade === null,
        this.swapViaCeler ? 1 : fromSlippage
      );

      const targetBlockchainProviders = await this.getSortedProvidersList(
        toBlockchain,
        toTransitToken,
        toTransitTokenAmount,
        toToken
      );
      const targetBlockchainProvidersFiltered = this.swapViaCeler
        ? targetBlockchainProviders.filter(provider => {
            return (
              !this.contracts[toBlockchain].isProviderAlgebra(provider.providerIndex) &&
              !this.contracts[toBlockchain].isProviderOneinch(provider.providerIndex)
            );
          })
        : targetBlockchainProviders;

      const {
        providerIndex: toProviderIndex,
        tradeAndToAmount: { trade: toTrade, toAmount }
      } = targetBlockchainProvidersFiltered[0];

      if (this.swapViaCeler) {
        this.celerService.buildCelerTrade(
          fromBlockchain as EthLikeBlockchainName,
          toBlockchain as EthLikeBlockchainName,
          toToken,
          fromToken,
          fromTransitTokenAmount,
          toAmount,
          sourceBlockchainProvidersFiltered[0],
          targetBlockchainProvidersFiltered[0],
          celerEstimate.max_slippage,
          fromSlippage,
          fromAmount,
          isPairOfCelerSupportedTransitTokens
        );
      }

      await this.calculateSmartRouting(
        sourceBlockchainProvidersFiltered,
        targetBlockchainProvidersFiltered,
        fromBlockchain,
        toBlockchain,
        toToken.address,
        isPairOfCelerSupportedTransitTokens
      );

      const toAmountWithoutSlippage = compareAddresses(fromToken.address, fromTransitToken.address)
        ? toAmount
        : toAmount.dividedBy(fromSlippage);

      const trade: CelerRubicTrade = {
        fromBlockchain,
        fromToken,
        fromAmount,
        fromProviderIndex,
        fromTransitTokenAmount,
        fromTrade,
        fromSlippage,

        toBlockchain,
        toToken,
        toProviderIndex,
        toTransitTokenAmount,
        toTrade,
        toAmount,
        toAmountWithoutSlippage,
        toSlippage,

        usingCelerBridge: Boolean(isPairOfCelerSupportedTransitTokens),

        transitTokenFee: feeInPercents,
        cryptoFee
      };
      const minMaxErrors = await this.checkMinMaxErrors(trade);

      return {
        trade,
        ...minMaxErrors
      };
    } catch (_err) {
      return {
        trade: null
      };
    }
  }

  /**
   * Gets the best provider index in blockchain, based on profit of uniswap provider.
   */
  private async getSortedProvidersList(
    blockchain: SupportedCrossChainBlockchain,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    wrappedNativeAddress?: string
  ): Promise<IndexedTradeAndToAmount[]> {
    const providers = this.contracts[blockchain].providersData;

    const promises = providers.map(async (_, providerIndex) => ({
      providerIndex,
      tradeAndToAmount: await this.getTradeAndToAmount(
        blockchain,
        providerIndex,
        fromToken,
        fromAmount,
        toToken,
        wrappedNativeAddress
      )
    }));

    return Promise.allSettled(promises).then(results => {
      const sortedResults = results
        .filter(result => result.status === 'fulfilled')
        .map((result: PromiseFulfilledResult<IndexedTradeAndToAmount>) => result.value)
        .sort((a, b) => b.tradeAndToAmount.toAmount.comparedTo(a.tradeAndToAmount.toAmount));

      if (!sortedResults.length) {
        throw (results[0] as PromiseRejectedResult).reason;
      }
      return sortedResults;
    });
  }

  /**
   * Calculates course of {@param fromToken } to {@param toToken} and returns output amount of {@param toToken}.
   * @param blockchain Tokens' blockchain.
   * @param providerIndex Index of provider to use.
   * @param fromToken From token.
   * @param fromAmount Input amount of from token.
   * @param toToken To token.
   */
  private async getTradeAndToAmount(
    blockchain: SupportedCrossChainBlockchain,
    providerIndex: number,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    wrappedNativeAddress: string
  ): Promise<TradeAndToAmount> {
    if (!compareAddresses(fromToken.address, toToken.address)) {
      try {
        // needed for correct 1inch trade data
        const contractAddress = this.swapViaCeler
          ? this.celerService.getCelerContractAddress(blockchain as EthLikeBlockchainName)
          : this.contracts[blockchain].address;
        const instantTrade = await this.contracts[blockchain]
          .getProvider(providerIndex)
          .calculateTrade(
            fromToken,
            fromAmount,
            toToken,
            false,
            contractAddress,
            wrappedNativeAddress,
            true
          );
        return {
          trade: instantTrade,
          toAmount: instantTrade.to.amount
        };
      } catch (err) {
        if (err instanceof InsufficientLiquidityError) {
          throw new InsufficientLiquidityError('CrossChainRouting');
        }
        throw err;
      }
    }
    return {
      trade: null,
      toAmount: fromAmount
    };
  }

  /**
   * Compares min and max amounts, permitted in source contract, with current trade's value.
   */
  private async checkMinMaxErrors(trade: CelerRubicTrade): Promise<{
    minAmountError?: BigNumber;
    maxAmountError?: BigNumber;
  }> {
    const { fromBlockchain, fromTransitTokenAmount, fromSlippage } = trade;

    if (this.swapViaCeler) {
      const minTransitTokenAmount = await this.celerService.getSwapLimit(
        fromBlockchain as EthLikeBlockchainName,
        'min'
      );
      const maxTransitTokenAmount = await this.celerService.getSwapLimit(
        fromBlockchain as EthLikeBlockchainName,
        'max'
      );

      if (fromTransitTokenAmount.lt(minTransitTokenAmount)) {
        const minAmount = await this.getFromTokenAmount(
          fromBlockchain,
          trade.fromProviderIndex,
          trade.fromToken,
          minTransitTokenAmount,
          'min'
        );
        return {
          minAmountError: minAmount
        };
      }

      if (fromTransitTokenAmount.gt(maxTransitTokenAmount)) {
        const maxAmount = await this.getFromTokenAmount(
          fromBlockchain,
          trade.fromProviderIndex,
          trade.fromToken,
          maxTransitTokenAmount,
          'max'
        );
        return {
          maxAmountError: maxAmount
        };
      }
    } else {
      const { minAmount: minTransitTokenAmount, maxAmount: maxTransitTokenAmount } =
        await this.getMinMaxTransitTokenAmounts(fromBlockchain, fromSlippage);

      if (fromTransitTokenAmount.lt(minTransitTokenAmount)) {
        const minAmount = await this.getFromTokenAmount(
          fromBlockchain,
          trade.fromProviderIndex,
          trade.fromToken,
          minTransitTokenAmount,
          'min'
        );
        if (!minAmount?.isFinite()) {
          throw new InsufficientLiquidityError('CrossChainRouting');
        }
        return {
          minAmountError: minAmount
        };
      }

      if (fromTransitTokenAmount.gt(maxTransitTokenAmount)) {
        const maxAmount = await this.getFromTokenAmount(
          fromBlockchain,
          trade.fromProviderIndex,
          trade.fromToken,
          maxTransitTokenAmount,
          'max'
        );
        return {
          maxAmountError: maxAmount
        };
      }
    }

    return {};
  }

  /**
   * Gets min and max permitted amounts of transit token in source and target blockchain.
   * @param fromBlockchain Source blockchain.
   * @param fromSlippage Slippage in source blockchain.
   */
  private async getMinMaxTransitTokenAmounts(
    fromBlockchain: SupportedCrossChainBlockchain,
    fromSlippage: number
  ): Promise<{
    minAmount: BigNumber;
    maxAmount: BigNumber;
  }> {
    const fromTransitToken = this.contracts[fromBlockchain].transitToken;

    const getAmount = async (type: 'minAmount' | 'maxAmount'): Promise<BigNumber> => {
      const contract = this.contracts[fromBlockchain];
      const fromTransitTokenAmountAbsolute =
        type === 'minAmount' ? await contract.minTokenAmount() : await contract.maxTokenAmount();
      const fromTransitTokenAmount = Web3Pure.fromWei(
        fromTransitTokenAmountAbsolute,
        fromTransitToken.decimals
      );

      if (type === 'minAmount') {
        return fromTransitTokenAmount.dividedBy(fromSlippage);
      }
      return fromTransitTokenAmount;
    };

    return Promise.all([getAmount('minAmount'), getAmount('maxAmount')]).then(
      ([minAmount, maxAmount]) => ({
        minAmount,
        maxAmount
      })
    );
  }

  /**
   * Calculates uniswap course of transit token to {@param fromToken} and returns input amount of {@param fromToken}.
   * @param blockchain Blockchain to make swap in.
   * @param providerIndex Index of provider to use.
   * @param fromToken From token.
   * @param transitTokenAmount Output amount of transit token.
   * @param type Type of min or max amount calculation.
   */
  private async getFromTokenAmount(
    blockchain: SupportedCrossChainBlockchain,
    providerIndex: number,
    fromToken: BlockchainToken,
    transitTokenAmount: BigNumber,
    type: 'min' | 'max'
  ): Promise<BigNumber> {
    const transitToken = this.contracts[blockchain].transitToken;
    if (compareAddresses(fromToken.address, transitToken.address)) {
      return transitTokenAmount;
    }

    if (transitTokenAmount.eq(0)) {
      return new BigNumber(0);
    }

    const contractAddress = this.contracts[blockchain].address;
    const amount = (
      await this.contracts[blockchain]
        .getProvider(providerIndex)
        .calculateTrade(transitToken, transitTokenAmount, fromToken, false, contractAddress)
    ).to.amount;
    const approximatePercentDifference = 0.02;

    if (type === 'min') {
      return amount.multipliedBy(1 + approximatePercentDifference);
    }
    return amount.multipliedBy(1 - approximatePercentDifference);
  }

  /**
   * Calculates transit token's amount in target blockchain, based on transit token's amount is source blockchain.
   * @param fromBlockchain Source blockchain
   * @param toBlockchain Target blockchain
   * @param fromTransitTokenAmount Amount of transit token in source blockchain.
   * @param isDirectTrade True, if first transit token is traded directrly.
   * @param fromSlippage Slippage in source blockchain.
   */
  private async getToTransitTokenAmount(
    fromBlockchain: SupportedCrossChainBlockchain,
    toBlockchain: SupportedCrossChainBlockchain,
    fromTransitTokenAmount: BigNumber,
    isDirectTrade: boolean,
    fromSlippage: number
  ): Promise<{ toTransitTokenAmount: BigNumber; feeInPercents: number }> {
    const feeInPercents = await this.getFeeInPercents(fromBlockchain, toBlockchain);
    let toTransitTokenAmount = fromTransitTokenAmount
      .multipliedBy(100 - feeInPercents)
      .dividedBy(100);

    if (!isDirectTrade) {
      toTransitTokenAmount = toTransitTokenAmount.multipliedBy(fromSlippage);
    }

    return {
      toTransitTokenAmount,
      feeInPercents
    };
  }

  /**
   * Gets fee amount of transit token in percents in target blockchain.
   * @param fromBlockchain Source blockchain.
   * @param toBlockchain Target blockchain.
   */
  private async getFeeInPercents(
    fromBlockchain: SupportedCrossChainBlockchain,
    toBlockchain: SupportedCrossChainBlockchain
  ): Promise<number> {
    if (!this.swapViaCeler) {
      const numOfFromBlockchain = this.contracts[fromBlockchain].numOfBlockchain;
      const feeOfToBlockchainAbsolute = await this.contracts[toBlockchain].feeAmountOfBlockchain(
        numOfFromBlockchain
      );
      return parseInt(feeOfToBlockchainAbsolute) / 10000; // to %
    } else {
      return await this.celerService.getFeePercent(fromBlockchain as EthLikeBlockchainName);
    }
  }

  /**
   * Gets fee amount in crypto in source blockchain.
   * @param fromBlockchain Source blockchain.
   * @param toBlockchain Target blockchain.
   * @return Promise<number> Crypto fee in Wei.
   */
  private async getCryptoFee(
    fromBlockchain: SupportedCrossChainBlockchain,
    toBlockchain: SupportedCrossChainBlockchain
  ): Promise<BigNumber> {
    if (this.swapViaCeler) {
      const cryptoFee = await this.celerService.getDstCryptoFee(
        fromBlockchain as EthLikeBlockchainName,
        toBlockchain as EthLikeBlockchainName
      );

      return Web3Pure.fromWei(cryptoFee);
    }

    return this.contracts[fromBlockchain].blockchainCryptoFee(
      this.contracts[toBlockchain].numOfBlockchain
    );
  }

  /**
   * Calculates gas limit and gas price in source network, if possible to calculate.
   */
  private async getGasData(): Promise<{
    gasLimit: BigNumber;
    gasPrice: string;
  }> {
    if (this.currentCrossChainProvider.type === CROSS_CHAIN_PROVIDER.SYMBIOSIS) {
      return this.symbiosisService.getGasData();
    }

    try {
      const trade = this.currentCrossChainProvider.trade as CelerRubicTrade;
      const { fromBlockchain } = trade;
      const walletAddress = this.authService.userAddress;
      const gasCalculateBlockchains: BlockchainName[] = [
        BLOCKCHAIN_NAME.ETHEREUM,
        BLOCKCHAIN_NAME.FANTOM
      ];
      if (!gasCalculateBlockchains.includes(fromBlockchain) || !walletAddress) {
        return null;
      }

      const { contractAddress, contractAbi, methodName, methodArguments, value } =
        await this.ethLikeContractExecutor.getContractParams(trade, walletAddress);

      const web3Public = this.publicBlockchainAdapterService[fromBlockchain];
      const gasLimit = await web3Public.getEstimatedGas(
        contractAbi,
        contractAddress,
        methodName,
        methodArguments,
        walletAddress,
        value
      );
      const gasPrice = Web3Pure.toWei(await this.gasService.getGasPriceInEthUnits(fromBlockchain));

      return {
        gasLimit,
        gasPrice
      };
    } catch (_err) {
      return null;
    }
  }

  /**
   * Gets trade info to show in transaction info panel.
   */
  public async getTradeInfo(): Promise<CelerRubicTradeInfo | SymbiosisTradeInfo> {
    if (!this.currentCrossChainProvider) {
      return null;
    }

    const estimatedGas = this.currentCrossChainProvider.gasLimit?.multipliedBy(
      Web3Pure.fromWei(this.currentCrossChainProvider.gasPrice)
    );

    if (this.currentCrossChainProvider.type === CROSS_CHAIN_PROVIDER.SYMBIOSIS) {
      const trade = this.currentCrossChainProvider.trade as SymbiosisTrade;
      return {
        estimatedGas,
        fee: trade.fee,
        feeSymbol: trade.feeSymbol,
        priceImpact: trade.priceImpact
      };
    }

    const trade = this.currentCrossChainProvider.trade as CelerRubicTrade;
    const {
      fromBlockchain,
      toBlockchain,
      fromToken,
      fromAmount,
      toToken,
      toAmount,
      fromTransitTokenAmount,
      toTransitTokenAmount,
      usingCelerBridge
    } = trade;
    const firstTransitToken = this.contracts[fromBlockchain].transitToken;
    const secondTransitToken = this.contracts[toBlockchain].transitToken;

    const feePercent = trade.transitTokenFee;
    const fee = feePercent / 100;
    const feeAmount = trade.toTransitTokenAmount.multipliedBy(fee).dividedBy(1 - fee);

    const [priceImpactFrom, priceImpactTo] = await Promise.all([
      this.calculatePriceImpact(
        fromToken,
        firstTransitToken,
        fromAmount,
        fromTransitTokenAmount,
        'from'
      ),
      this.calculatePriceImpact(toToken, secondTransitToken, toAmount, toTransitTokenAmount, 'to')
    ]);

    const fromProvider = this.contracts[fromBlockchain].getProvider(
      trade.fromProviderIndex
    ).providerType;
    const toProvider = this.contracts[toBlockchain].getProvider(trade.toProviderIndex).providerType;

    const fromPath = trade.fromTrade ? trade.fromTrade.path.map(token => token.symbol) : null;
    const toPath = trade.toTrade ? trade.toTrade.path.map(token => token.symbol) : null;

    return {
      feePercent,
      feeAmount,
      feeTokenSymbol: secondTransitToken.symbol,
      cryptoFee: trade.cryptoFee.toNumber(),
      estimatedGas,
      priceImpactFrom,
      priceImpactTo,
      fromProvider,
      toProvider,
      fromPath,
      toPath,
      usingCelerBridge: this.swapViaCeler && usingCelerBridge
    };
  }

  /**
   * Calculates price impact of token to 'transit token', or vice versa, trade.
   * @param token Token, selected in form.
   * @param transitToken Transit token.
   * @param tokenAmount Amount of token, selected in form.
   * @param transitTokenAmount Amount of transit token.
   * @param type 'From' or 'to' type of token in form.
   * @return number Price impact in percents.
   */
  private async calculatePriceImpact(
    token: TokenAmount,
    transitToken: InstantTradeToken,
    tokenAmount: BigNumber,
    transitTokenAmount: BigNumber,
    type: 'from' | 'to'
  ): Promise<number> {
    if (!compareAddresses(token.address, transitToken.address)) {
      const transitTokenPrice = await this.tokensService.getAndUpdateTokenPrice({
        address: transitToken.address,
        blockchain: token.blockchain
      });
      const priceImpactArguments: [number, number, BigNumber, BigNumber] =
        type === 'from'
          ? [token.price, transitTokenPrice, tokenAmount, transitTokenAmount]
          : [transitTokenPrice, token.price, transitTokenAmount, tokenAmount];
      return PriceImpactService.calculatePriceImpact(...priceImpactArguments);
    }
    return 0;
  }

  /**
   * Checks that contracts are not paused.
   */
  private async checkIfPaused(): Promise<void> {
    const { fromBlockchain, toBlockchain } = this.swapFormService.inputValue;

    const [isFromPaused, isToPaused] = this.swapViaCeler
      ? await this.celerService.checkIsCelerContractPaused(
          fromBlockchain as EthLikeBlockchainName,
          toBlockchain as EthLikeBlockchainName
        )
      : await Promise.all([
          this.contracts[fromBlockchain].isPaused(),
          this.contracts[toBlockchain].isPaused()
        ]);

    if (isFromPaused || isToPaused) {
      throw new CrossChainIsUnavailableWarning();
    }

    if (fromBlockchain === BLOCKCHAIN_NAME.SOLANA || toBlockchain === BLOCKCHAIN_NAME.SOLANA) {
      const isSolanaWorking = await SolanaContractExecutorService.checkHealth(
        this.solanaPrivateAdapter
      );
      if (!isSolanaWorking) {
        throw new CustomError(
          'Solana blockchain mainnet is not stable right now. Please, try again later.'
        );
      }
    }
  }

  /**
   * Checks that in target blockchain current gas price is less than or equal to max gas price.
   */
  private async checkGasPrice(): Promise<void | never> {
    const { toBlockchain } = this.swapFormService.inputValue;

    if (toBlockchain !== BLOCKCHAIN_NAME.ETHEREUM) {
      return;
    }

    const maxGasPrice = await this.contracts[toBlockchain].maxGasPrice();

    const currentGasPrice = Web3Pure.toWei(
      await this.gasService.getGasPriceInEthUnits(toBlockchain)
    );

    if (new BigNumber(maxGasPrice).lt(currentGasPrice)) {
      throw new MaxGasPriceOverflowWarning(toBlockchain);
    }
  }

  /**
   * TODO handle Celer pools too
   * Checks that in target blockchain tokens' pool's balance is enough.
   */
  @PCacheable({
    maxAge: CACHEABLE_MAX_AGE
  })
  private async checkContractBalance(): Promise<void | never> {
    const { toBlockchain, toTransitTokenAmount } = this.currentCrossChainProvider
      .trade as CelerRubicTrade;

    const contractAddress = this.contracts[toBlockchain].address;
    const secondTransitToken = this.contracts[toBlockchain].transitToken;
    const blockchainAdapter = this.publicBlockchainAdapterService[toBlockchain];

    const contractBalanceAbsolute = await blockchainAdapter.getTokenBalance(
      contractAddress,
      secondTransitToken.address
    );
    const contractBalance = Web3Pure.fromWei(contractBalanceAbsolute, secondTransitToken.decimals);

    if (toTransitTokenAmount.gt(contractBalance)) {
      throw new CrossChainIsUnavailableWarning();
    }
  }

  /**
   * Checks contracts' state and user's balance.
   */
  private async checkTradeParameters(): Promise<void | never> {
    const checks = [this.checkIfPaused(), this.checkGasPrice(), this.checkUserBalance()];

    await Promise.all(
      this.crossChainProvider === CROSS_CHAIN_PROVIDER.RUBIC
        ? checks.concat(this.checkContractBalance())
        : checks
    );
  }

  private async checkUserBalance(): Promise<void> {
    const trade = this.currentCrossChainProvider.trade as CelerRubicTrade;

    const { fromBlockchain, fromToken, fromAmount } = this.swapFormService.inputValue;

    const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];

    if (
      !blockchainAdapter.isNativeAddress(fromToken.address) ||
      fromBlockchain === BLOCKCHAIN_NAME.NEAR
    ) {
      return blockchainAdapter.checkBalance(fromToken, fromAmount, this.authService.userAddress);
    }

    const inAmount = trade.cryptoFee.plus(fromAmount);
    try {
      await blockchainAdapter.checkBalance(fromToken, inAmount, this.authService.userAddress);
    } catch (_err) {
      throw new InsufficientFundsGasPriceValueError(fromToken.symbol);
    }
  }

  public async createTrade(confirmCallback?: () => void): Promise<void> {
    this.walletConnectorService.checkSettings(this.swapFormService.inputValue.fromBlockchain);

    if (this.currentCrossChainProvider.type !== CROSS_CHAIN_PROVIDER.SYMBIOSIS) {
      await this.checkTradeParameters();
    }

    this.checkDeviceAndShowNotification();

    let transactionHash;
    let subscription$: Subscription;
    const { fromBlockchain, toBlockchain, fromToken, toToken } = this.swapFormService.inputValue;
    const onTransactionHash = (txHash: string) => {
      const tradeData: RecentTrade = {
        srcTxHash: txHash,
        fromBlockchain,
        toBlockchain,
        fromToken,
        toToken,
        crossChainProviderType: this.currentCrossChainProvider.type as CROSS_CHAIN_PROVIDER,
        timestamp: Date.now()
      };
      transactionHash = txHash;

      confirmCallback?.();

      if (isEthLikeBlockchainName(fromBlockchain) && isEthLikeBlockchainName(toBlockchain)) {
        this.notifyGtmAfterSignTx(txHash);

        this.openSwapSchemeModal(this.crossChainProvider, txHash);
      } else {
        subscription$ = this.notifyTradeInProgress(
          txHash,
          fromBlockchain,
          this.currentCrossChainProvider.type
        );
      }

      this.recentTradesStoreService.saveTrade(this.authService.userAddress, tradeData);

      if (this.currentCrossChainProvider.type === CROSS_CHAIN_PROVIDER.CELER) {
        this.celerApiService.postTradeInfo(fromBlockchain, 'celer', txHash);
      }
    };

    try {
      if (this.currentCrossChainProvider.type === CROSS_CHAIN_PROVIDER.SYMBIOSIS) {
        await this.symbiosisService.swap(onTransactionHash);
      } else {
        const swapParams = {
          onTransactionHash,
          ...(this.currentCrossChainProvider?.gasPrice && {
            gasPrice: this.currentCrossChainProvider?.gasPrice
          })
        };
        if (this.swapViaCeler) {
          transactionHash = await this.celerService.makeTransferWithSwap(swapParams);
        } else {
          transactionHash = await this.contractExecutorFacade.executeTrade(
            this.currentCrossChainProvider.trade as CelerRubicTrade,
            swapParams,
            this.authService.userAddress
          );
        }
      }

      subscription$?.unsubscribe();

      await this.postCrossChainTrade(transactionHash);
    } catch (err) {
      subscription$?.unsubscribe();

      await this.handleCreateTradeError(err, transactionHash);
    }
  }

  public openSwapSchemeModal(provider: CrossChainProvider, txHash: string): void {
    const { fromBlockchain, toBlockchain, fromToken, toToken } = this.swapFormService.inputValue;

    this.dialogService
      .open<SwapSchemeModalData>(new PolymorpheusComponent(SwapSchemeModalComponent), {
        size: this.headerStore.isMobile ? 'page' : 'l',
        data: {
          fromToken,
          fromBlockchain,
          toToken,
          toBlockchain,
          srcProvider:
            this.crossChainProvider === CROSS_CHAIN_PROVIDER.SYMBIOSIS
              ? INSTANT_TRADE_PROVIDER.ONEINCH
              : this.smartRouting.fromProvider,
          dstProvider:
            this.crossChainProvider === CROSS_CHAIN_PROVIDER.SYMBIOSIS
              ? INSTANT_TRADE_PROVIDER.ONEINCH
              : this.smartRouting.toProvider,
          crossChainProvider: provider,
          srcTxHash: txHash
        }
      })
      .subscribe();
  }

  /**
   * Handles error, thrown during swap transaction.
   */
  private async handleCreateTradeError(err: Error, transactionHash: string): Promise<void | never> {
    if (err instanceof FailedToCheckForTransactionReceiptError) {
      await this.postCrossChainTrade(transactionHash);
      return;
    }

    const errMessage = err.message || err.toString?.();
    if (errMessage?.includes('swapContract: Not enough amount of tokens')) {
      throw new CrossChainIsUnavailableWarning();
    }
    if (errMessage?.includes('insufficient funds for')) {
      throw new InsufficientFundsGasPriceValueError(
        this.swapFormService.inputValue.fromToken.symbol
      );
    }

    throw err;
  }

  private notifyGtmAfterSignTx(txHash: string): void {
    const { fromToken, toToken, fromAmount } = this.swapFormService.inputValue;

    let fee: BigNumber;
    if (this.currentCrossChainProvider.type === CROSS_CHAIN_PROVIDER.SYMBIOSIS) {
      const trade = this.currentCrossChainProvider.trade as SymbiosisTrade;
      fee = trade.fee;
    } else {
      const trade = this.currentCrossChainProvider.trade as CelerRubicTrade;
      fee = trade.fromTransitTokenAmount.multipliedBy(trade.transitTokenFee / 100);
    }

    this.gtmService.fireTxSignedEvent(
      SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING,
      txHash,
      fromToken.symbol,
      toToken.symbol,
      fee,
      fromAmount.multipliedBy(fromToken.price)
    );
  }

  /**
   * Posts trade data to log widget domain, or to apply promo code.
   * @param transactionHash Hash of checked transaction.
   */
  private async postCrossChainTrade(transactionHash: string): Promise<void> {
    const settings = this.settingsService.crossChainRoutingValue;
    await this.apiService.postTrade(
      transactionHash,
      this.swapFormService.inputValue.fromBlockchain,
      settings.promoCode?.status === 'accepted' ? settings.promoCode.text : undefined
    );
  }

  public calculateTokenOutAmountMin(): BigNumber {
    return ContractExecutorFacadeService.calculateTokenOutAmountMin(
      this.currentCrossChainProvider.trade as CelerRubicTrade
    );
  }

  private checkDeviceAndShowNotification(): void {
    if (this.iframeService.isIframe && this.iframeService.device === 'mobile') {
      this.notificationsService.showOpenMobileWallet();
    }
  }

  public setIsSupportedCelerBlockchainPair(
    fromBlockchain: BlockchainName,
    toBlockchain: BlockchainName
  ): void {
    this.isSupportedCelerBlockchainPair =
      this.celerService.isSupportedBlockchain(fromBlockchain) &&
      this.celerService.isSupportedBlockchain(toBlockchain);
  }

  private async calculateSmartRouting(
    sourceBlockchainProviders: IndexedTradeAndToAmount[],
    targetBlockchainProviders: IndexedTradeAndToAmount[],
    fromBlockchain: SupportedCrossChainBlockchain,
    toBlockchain: SupportedCrossChainBlockchain,
    toToken: string,
    isPairOfCelerSupportedTransitTokens: boolean
  ): Promise<void> {
    const [sourceBestProvider, sourceWorseProvider] = sourceBlockchainProviders;
    const [targetBestProvider, targetWorstProvider] = targetBlockchainProviders;
    const smartRouting = {
      fromProvider: this.getProviderType(fromBlockchain, sourceBestProvider.providerIndex),
      toProvider: this.getProviderType(toBlockchain, targetBestProvider.providerIndex),
      fromHasTrade: isPairOfCelerSupportedTransitTokens
        ? false
        : Boolean(sourceBestProvider?.tradeAndToAmount.trade),
      toHasTrade: isPairOfCelerSupportedTransitTokens
        ? false
        : Boolean(targetBestProvider?.tradeAndToAmount.trade),
      savings: new BigNumber(0)
    };
    const sourceBestUSDC = sourceBestProvider.tradeAndToAmount.toAmount;
    const sourceWorseUSDC = sourceWorseProvider?.tradeAndToAmount.toAmount;
    const toTokenUsdcPrice = await this.tokensService.getAndUpdateTokenPrice({
      address: toToken,
      blockchain: toBlockchain
    });
    const hasSourceTrades = Boolean(sourceBlockchainProviders[0]?.tradeAndToAmount.trade);
    const hasTargetTrades = Boolean(targetBlockchainProviders[0]?.tradeAndToAmount.trade);

    if (hasSourceTrades && !hasTargetTrades) {
      smartRouting.savings = sourceBestProvider?.tradeAndToAmount.toAmount.minus(
        sourceWorseProvider?.tradeAndToAmount.toAmount
      );
    }

    if (!hasSourceTrades && hasTargetTrades) {
      smartRouting.savings = targetBestProvider?.tradeAndToAmount.toAmount
        .minus(targetWorstProvider?.tradeAndToAmount.toAmount)
        .multipliedBy(toTokenUsdcPrice);
    }

    if (hasSourceTrades && hasTargetTrades) {
      if (targetBlockchainProviders.length > 1 && sourceBlockchainProviders.length > 1) {
        const tokenAmountViaWorstProvider = targetWorstProvider?.tradeAndToAmount.trade.to.amount
          .dividedBy(sourceBestUSDC)
          .multipliedBy(sourceWorseUSDC);

        smartRouting.savings = targetBestProvider.tradeAndToAmount.trade.to.amount
          .minus(tokenAmountViaWorstProvider)
          .multipliedBy(toTokenUsdcPrice);
      }

      if (targetBlockchainProviders.length <= 1 && sourceBlockchainProviders.length > 1) {
        smartRouting.savings = sourceBestProvider.tradeAndToAmount.toAmount.minus(
          sourceWorseProvider.tradeAndToAmount.toAmount
        );
      }

      if (targetBlockchainProviders.length > 1 && sourceBlockchainProviders.length <= 1) {
        smartRouting.savings = targetBestProvider.tradeAndToAmount.toAmount
          .minus(targetWorstProvider.tradeAndToAmount.toAmount)
          .multipliedBy(toTokenUsdcPrice);
      }
    }

    this._smartRouting$.next(smartRouting);
  }

  private setSymbiosisSmartRouting(): void {
    this._smartRouting$.next({
      fromProvider: INSTANT_TRADE_PROVIDER.ONEINCH,
      toProvider: INSTANT_TRADE_PROVIDER.ONEINCH,
      fromHasTrade: true,
      toHasTrade: true,
      savings: new BigNumber(0)
    });
  }

  private getProviderType(
    blockchain: SupportedCrossChainBlockchain,
    providerIndex: number
  ): INSTANT_TRADE_PROVIDER {
    return this.contracts[blockchain].getProvider(providerIndex).providerType;
  }

  private handleNotWorkingBlockchains(
    fromBlockchain: BlockchainName,
    toBlockchain: BlockchainName
  ): void {
    if (
      (fromBlockchain === BLOCKCHAIN_NAME.TELOS &&
        (toBlockchain === BLOCKCHAIN_NAME.SOLANA || toBlockchain === BLOCKCHAIN_NAME.NEAR)) ||
      (toBlockchain === BLOCKCHAIN_NAME.TELOS &&
        (fromBlockchain === BLOCKCHAIN_NAME.SOLANA || fromBlockchain === BLOCKCHAIN_NAME.NEAR))
    ) {
      throw new CustomError(
        `Multi-Chain swaps are temporarily unavailable between ${fromBlockchain} and ${toBlockchain} networks.`
      );
    }

    // @TODO Solana. Remove after blockchain stabilization.
    if (fromBlockchain === BLOCKCHAIN_NAME.SOLANA || toBlockchain === BLOCKCHAIN_NAME.SOLANA) {
      throw new CustomError(
        'Multi-Chain swaps are temporarily unavailable for the Solana network.'
      );
    }

    if (
      !CrossChainRoutingService.isSupportedBlockchain(fromBlockchain) ||
      !CrossChainRoutingService.isSupportedBlockchain(toBlockchain)
    ) {
      throw Error('Not supported blockchains');
    }
  }
}

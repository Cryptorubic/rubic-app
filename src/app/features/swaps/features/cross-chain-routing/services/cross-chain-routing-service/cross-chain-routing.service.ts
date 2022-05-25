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
import { Injectable } from '@angular/core';
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
import { CrossChainTrade } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { EthLikeContractExecutorService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/eth-like-contract-executor.service';
import { ContractsDataService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contracts-data.service';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { compareAddresses } from '@shared/utils/utils';
import BigNumber from 'bignumber.js';
import { CrossChainTradeInfo } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade-info';
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
import { CcrProviderType } from '@app/shared/models/swaps/ccr-provider-type.enum';
import { RecentTradesService } from '@app/shared/services/recent-trades.service';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';

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

  private currentCrossChainTrade: CrossChainTrade;

  /**
   * Gets slippage, selected in settings, divided by 100%.
   */
  private get slippageTolerance(): number {
    return this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
  }

  public get swapViaCeler(): boolean {
    return this.isSupportedCelerBlockchainPair && this.usingCeler;
  }

  private readonly ccrUpperTransitAmountLimit = 280;

  private readonly disableRubicCcrForCelerSupportedBlockchains = true;

  private _celerSwapLimits$ = new BehaviorSubject<{ min: BigNumber; max: BigNumber }>(undefined);

  public get celerSwapLimits(): { min: BigNumber; max: BigNumber } {
    return this._celerSwapLimits$.getValue();
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
    private readonly myTradesStoreService: RecentTradesService
  ) {
    super('cross-chain-routing');
  }

  private async needApprove(
    fromBlockchain: SupportedCrossChainBlockchain,
    fromToken: BlockchainToken
  ): Promise<boolean> {
    const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];
    const ccrContractAddress = this.contracts[fromBlockchain].address;
    const celerContractAddress = CELER_CONTRACT[fromBlockchain as EthLikeBlockchainName];
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

    const { fromBlockchain, tokenIn: fromToken } = this.currentCrossChainTrade;
    const ccrContractAddress = this.contracts[fromBlockchain].address;
    const celerContractAddress = CELER_CONTRACT[fromBlockchain as EthLikeBlockchainName];

    let approveInProgressSubscription$: Subscription;
    const onTransactionHash = () => {
      approveInProgressSubscription$ = this.notificationsService.showApproveInProgress();
    };

    try {
      await this.web3PrivateService.approveTokens(
        fromToken.address,
        this.swapViaCeler ? celerContractAddress : ccrContractAddress,
        'infinity',
        {
          onTransactionHash
        }
      );

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
    const { fromToken, fromAmount, toToken } = this.swapFormService.inputValue;
    const fromBlockchain = fromToken.blockchain;
    const toBlockchain = toToken.blockchain;

    if (this.isSupportedCelerBlockchainPair) {
      this.usingCeler = true;
    }

    this.handleNotWorkingBlockchains(fromBlockchain, toBlockchain);

    const fromTransitToken = this.contracts[fromBlockchain].transitToken;
    const toTransitToken = this.contracts[toBlockchain].transitToken;

    let fromSlippage = 1 - this.slippageTolerance / 2;
    let toSlippage = 1 - this.slippageTolerance / 2;

    // @TODO Fix tokens with fee slippage.
    if (this.settingsService.crossChainRoutingValue.autoSlippageTolerance) {
      if (fromToken.address === '0x8d546026012bf75073d8a586f24a5d5ff75b9716') {
        fromSlippage = 0.8; // 20%
      }
      if (toToken.address === '0x8d546026012bf75073d8a586f24a5d5ff75b9716') {
        toSlippage = 0.85; // 15%
      }
    }

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

      const amountWithSlippage = fromTransitTokenAmount.multipliedBy(fromSlippage);
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
      const nativeUsdPrice = await this.tokensService.getNativeCoinPriceInUsd(BLOCKCHAIN_NAME.NEAR);
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
      await this.celerService.buildCelerTrade(
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

    this.currentCrossChainTrade = {
      fromBlockchain,
      fromProviderIndex,
      tokenIn: fromToken,
      tokenInAmount: fromAmount,
      fromTransitTokenAmount,
      fromSlippage,
      fromTrade,

      toBlockchain,
      toProviderIndex,
      toTransitTokenAmount,
      tokenOut: toToken,
      tokenOutAmount: toAmount,
      toSlippage,
      toTrade,

      usingCelerBridge: Boolean(isPairOfCelerSupportedTransitTokens),

      transitTokenFee: feeInPercents,
      cryptoFee
    };

    await this.calculateSmartRouting(
      sourceBlockchainProvidersFiltered,
      targetBlockchainProvidersFiltered,
      fromBlockchain,
      toBlockchain,
      toToken.address,
      isPairOfCelerSupportedTransitTokens
    );

    const [gasData, minMaxErrors, needApprove] = await Promise.all([
      this.getGasData(this.currentCrossChainTrade),
      this.checkMinMaxErrors(this.currentCrossChainTrade),
      calculateNeedApprove ? this.needApprove(fromBlockchain, fromToken) : undefined
    ]);
    this.currentCrossChainTrade = {
      ...this.currentCrossChainTrade,
      ...gasData
    };

    const toAmountWithoutSlippage = compareAddresses(fromToken.address, fromTransitToken.address)
      ? toAmount
      : toAmount.dividedBy(fromSlippage);

    return {
      toAmount: toAmountWithoutSlippage,
      ...minMaxErrors,
      needApprove
    };
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
            wrappedNativeAddress
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
  private async checkMinMaxErrors(trade: CrossChainTrade): Promise<{
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
      const limits: { min: BigNumber; max: BigNumber } = {
        min: undefined,
        max: undefined
      };

      if (fromTransitTokenAmount.lt(minTransitTokenAmount)) {
        const minAmount = await this.getFromTokenAmount(
          fromBlockchain,
          trade.fromProviderIndex,
          trade.tokenIn,
          minTransitTokenAmount,
          'min'
        );
        limits.min = minAmount;
      }

      if (fromTransitTokenAmount.gt(maxTransitTokenAmount)) {
        const maxAmount = await this.getFromTokenAmount(
          fromBlockchain,
          trade.fromProviderIndex,
          trade.tokenIn,
          maxTransitTokenAmount,
          'max'
        );
        limits.max = maxAmount;
      }

      this._celerSwapLimits$.next(limits);
    } else {
      const { minAmount: minTransitTokenAmount, maxAmount: maxTransitTokenAmount } =
        await this.getMinMaxTransitTokenAmounts(fromBlockchain, fromSlippage);

      if (fromTransitTokenAmount.lt(minTransitTokenAmount)) {
        const minAmount = await this.getFromTokenAmount(
          fromBlockchain,
          trade.fromProviderIndex,
          trade.tokenIn,
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
          trade.tokenIn,
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
    const numOfFromBlockchain = this.contracts[fromBlockchain].numOfBlockchain;
    const feeOfToBlockchainAbsolute = await this.contracts[toBlockchain].feeAmountOfBlockchain(
      numOfFromBlockchain
    );
    return parseInt(feeOfToBlockchainAbsolute) / 10000; // to %
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
    return this.contracts[fromBlockchain].blockchainCryptoFee(
      this.contracts[toBlockchain].numOfBlockchain
    );
  }

  /**
   * Calculates gas limit and gas price in source network, if possible to calculate.
   */
  private async getGasData(trade: CrossChainTrade): Promise<{
    gasLimit: BigNumber;
    gasPrice: string;
  }> {
    const { fromBlockchain } = trade;
    const walletAddress = this.authService.userAddress;
    const gasCalculateBlockchains: BlockchainName[] = [
      BLOCKCHAIN_NAME.ETHEREUM,
      BLOCKCHAIN_NAME.FANTOM
    ];
    if (!gasCalculateBlockchains.includes(fromBlockchain) || !walletAddress) {
      return null;
    }

    try {
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
  public async getTradeInfo(): Promise<CrossChainTradeInfo> {
    if (!this.currentCrossChainTrade) {
      return null;
    }

    const trade = this.currentCrossChainTrade;
    const {
      fromBlockchain,
      toBlockchain,
      tokenIn,
      tokenOut,
      tokenInAmount,
      tokenOutAmount,
      fromTransitTokenAmount,
      toTransitTokenAmount,
      usingCelerBridge
    } = trade;
    const firstTransitToken = this.contracts[fromBlockchain].transitToken;
    const secondTransitToken = this.contracts[toBlockchain].transitToken;

    const feePercent = trade.transitTokenFee;
    const fee = feePercent / 100;
    const feeAmount = trade.toTransitTokenAmount.multipliedBy(fee).dividedBy(1 - fee);

    const estimatedGas = trade.gasLimit?.multipliedBy(Web3Pure.fromWei(trade.gasPrice));

    const [priceImpactFrom, priceImpactTo] = await Promise.all([
      this.calculatePriceImpact(
        tokenIn,
        firstTransitToken,
        tokenInAmount,
        fromTransitTokenAmount,
        'from'
      ),
      this.calculatePriceImpact(
        tokenOut,
        secondTransitToken,
        tokenOutAmount,
        toTransitTokenAmount,
        'to'
      )
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
    const { fromBlockchain, toBlockchain } = this.currentCrossChainTrade;

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
    const { toBlockchain } = this.currentCrossChainTrade;

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
   * Checks that in target blockchain tokens' pool's balance is enough.
   */
  @PCacheable({
    maxAge: CACHEABLE_MAX_AGE
  })
  private async checkContractBalance(): Promise<void | never> {
    const { toBlockchain, toTransitTokenAmount } = this.currentCrossChainTrade;
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
    this.walletConnectorService.checkSettings(this.currentCrossChainTrade.fromBlockchain);

    await Promise.all([
      this.checkIfPaused(),
      this.checkGasPrice(),
      this.checkContractBalance(),
      this.checkUserBalance()
    ]);
  }

  private async checkUserBalance(): Promise<void> {
    const { fromBlockchain, tokenIn, tokenInAmount } = this.currentCrossChainTrade;
    const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];

    if (
      !blockchainAdapter.isNativeAddress(tokenIn.address) ||
      fromBlockchain === BLOCKCHAIN_NAME.NEAR
    ) {
      return blockchainAdapter.checkBalance(tokenIn, tokenInAmount, this.authService.userAddress);
    }

    const inAmount = this.currentCrossChainTrade.cryptoFee.plus(tokenInAmount);
    try {
      await blockchainAdapter.checkBalance(tokenIn, inAmount, this.authService.userAddress);
    } catch (_err) {
      throw new InsufficientFundsGasPriceValueError(this.currentCrossChainTrade.tokenIn.symbol);
    }
  }

  public async createTrade(confirmCallback?: () => void): Promise<void> {
    await this.checkTradeParameters();
    this.checkDeviceAndShowNotification();

    let transactionHash;
    let subscription$: Subscription;
    const { fromBlockchain, fromAmount, fromToken, toBlockchain, toToken } =
      this.swapFormService.inputValue;
    const onTransactionHash = (txHash: string) => {
      const tradeData: RecentTrade = {
        srcTxHash: txHash,
        fromBlockchain,
        toBlockchain,
        fromToken,
        toToken,
        amountIn: fromAmount.toNumber(),
        crossChainProviderType: CcrProviderType.RUBIC,
        timestamp: Date.now()
      };
      transactionHash = txHash;

      confirmCallback?.();

      if (fromBlockchain !== BLOCKCHAIN_NAME.NEAR) {
        this.notifyGtmAfterSignTx(txHash);

        subscription$ = this.notifyTradeInProgress(
          txHash,
          fromBlockchain,
          this.swapViaCeler ? CcrProviderType.CELER : CcrProviderType.RUBIC
        );
      }

      if (this.swapViaCeler) {
        tradeData.crossChainProviderType = CcrProviderType.CELER;

        this.celerApiService.postTradeInfo(
          this.currentCrossChainTrade.fromBlockchain,
          'celer',
          txHash
        );
      }

      this.myTradesStoreService.saveTrade(this.authService.userAddress, tradeData);
    };

    try {
      const swapParams = {
        onTransactionHash,
        ...(this.currentCrossChainTrade?.gasPrice && {
          gasPrice: this.currentCrossChainTrade?.gasPrice
        })
      };
      if (this.swapViaCeler) {
        transactionHash = await this.celerService.makeTransferWithSwap(
          fromAmount,
          fromBlockchain as EthLikeBlockchainName,
          fromToken,
          toBlockchain as EthLikeBlockchainName,
          toToken,
          swapParams
        );
      } else {
        transactionHash = await this.contractExecutorFacade.executeTrade(
          this.currentCrossChainTrade,
          swapParams,
          this.authService.userAddress
        );
      }

      subscription$?.unsubscribe();
      this.showSuccessTrxNotification(
        this.swapViaCeler ? CcrProviderType.CELER : CcrProviderType.RUBIC
      );

      await this.postCrossChainTrade(transactionHash);
    } catch (err) {
      subscription$?.unsubscribe();

      await this.handleCreateTradeError(err, transactionHash);
    }
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
      throw new InsufficientFundsGasPriceValueError(this.currentCrossChainTrade.tokenIn.symbol);
    }

    throw err;
  }

  private notifyGtmAfterSignTx(txHash: string): void {
    this.gtmService.fireTxSignedEvent(
      SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING,
      txHash,
      this.currentCrossChainTrade.tokenIn.symbol,
      this.currentCrossChainTrade.tokenOut.symbol,
      this.currentCrossChainTrade.fromTransitTokenAmount.multipliedBy(
        this.currentCrossChainTrade.transitTokenFee / 100
      ),
      this.currentCrossChainTrade.tokenInAmount.multipliedBy(
        this.currentCrossChainTrade.tokenIn.price
      )
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
      this.currentCrossChainTrade.fromBlockchain,
      settings.promoCode?.status === 'accepted' ? settings.promoCode.text : undefined
    );
  }

  public calculateTokenOutAmountMin(): BigNumber {
    return ContractExecutorFacadeService.calculateTokenOutAmountMin(this.currentCrossChainTrade);
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

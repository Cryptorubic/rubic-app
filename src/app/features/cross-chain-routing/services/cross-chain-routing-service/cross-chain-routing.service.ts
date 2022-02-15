import { PCacheable } from 'ts-cacheable';
import { EthLikeContractData } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/eth-like-contract-data';
import InsufficientFundsGasPriceValueError from '@core/errors/models/cross-chain-routing/insufficient-funds-gas-price-value';
import { CrossChainRoutingApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { SolanaWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-private.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import { GasService } from '@core/services/gas-service/gas.service';
import { AuthService } from '@core/services/auth/auth.service';
import { ContractExecutorFacadeService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/contract-executor-facade.service';
import { BehaviorSubject, from, Observable } from 'rxjs';
import CrossChainIsUnavailableWarning from '@core/errors/models/cross-chain-routing/cross-chainIs-unavailable-warning';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import UnsupportedTokenCCR from '@core/errors/models/cross-chain-routing/unsupported-token-ccr';
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
} from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import { SolanaContractExecutorService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/solana-contract-executor.service';
import CustomError from '@core/errors/models/custom-error';
import FailedToCheckForTransactionReceiptError from '@core/errors/models/common/failed-to-check-for-transaction-receipt-error';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import MaxGasPriceOverflowWarning from '@core/errors/models/common/max-gas-price-overflow-warning';
import { CrossChainTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { EthLikeContractExecutorService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/eth-like-contract-executor.service';
import { ContractsDataService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contracts-data.service';
import { SettingsService } from '@features/swaps/services/settings-service/settings.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { compareAddresses } from '@shared/utils/utils';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { CrossChainTradeInfo } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade-info';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';
import { TuiNotification } from '@taiga-ui/core';
import { IframeService } from '@core/services/iframe/iframe.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { INSTANT_TRADES_PROVIDERS } from '@app/shared/models/instant-trade/instant-trade-providers';
import { SmartRouting } from './models/smart-routing.interface';

interface TradeAndToAmount {
  trade: InstantTrade | null;
  toAmount: BigNumber;
}

interface IndexedTradeAndToAmount {
  providerIndex: number;
  tradeAndToAmount: TradeAndToAmount;
}

const CACHEABLE_MAX_AGE = 15_000;

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingService {
  public static isSupportedBlockchain(
    blockchain: BLOCKCHAIN_NAME
  ): blockchain is SupportedCrossChainBlockchain {
    return !!SUPPORTED_CROSS_CHAIN_BLOCKCHAINS.find(
      supportedBlockchain => supportedBlockchain === blockchain
    );
  }

  private readonly _smartRouting$ = new BehaviorSubject<SmartRouting>(null);

  public readonly smartRouting$ = this._smartRouting$.asObservable();

  private readonly _smartRoutingLoading$ = new BehaviorSubject<boolean>(false);

  public readonly smartRoutingLoading$ = this._smartRoutingLoading$.asObservable();

  private readonly contracts = this.contractsDataService.contracts;

  private currentCrossChainTrade: CrossChainTrade;

  /**
   * Gets slippage, selected in settings, divided by 100%.
   */
  private get slippageTolerance(): number {
    return this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
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
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService
  ) {}

  private async needApprove(
    fromBlockchain: SupportedCrossChainBlockchain,
    fromToken: BlockchainToken
  ): Promise<boolean> {
    const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];
    if (blockchainAdapter.isNativeAddress(fromToken.address)) {
      return false;
    }

    const contractAddress = this.contracts[fromBlockchain].address;
    return blockchainAdapter
      .getAllowance({
        tokenAddress: fromToken.address,
        ownerAddress: this.authService.userAddress,
        spenderAddress: contractAddress
      })
      .then(allowance => allowance.eq(0));
  }

  public approve(options: TransactionOptions = {}): Observable<TransactionReceipt> {
    this.checkDeviceAndShowNotification();
    const { fromBlockchain, tokenIn: fromToken } = this.currentCrossChainTrade;
    const contractAddress = this.contracts[fromBlockchain].address;
    return from(
      this.web3PrivateService.approveTokens(fromToken.address, contractAddress, 'infinity', options)
    );
  }

  public async calculateTrade(calculateNeedApprove = false): Promise<{
    toAmount: BigNumber;
    minAmountError?: BigNumber;
    maxAmountError?: BigNumber;
    needApprove?: boolean;
  }> {
    this._smartRoutingLoading$.next(true);
    const { fromToken, fromAmount, toToken } = this.swapFormService.inputValue;
    const fromBlockchain = fromToken.blockchain;
    const toBlockchain = toToken.blockchain;
    if (
      !CrossChainRoutingService.isSupportedBlockchain(fromBlockchain) ||
      !CrossChainRoutingService.isSupportedBlockchain(toBlockchain)
    ) {
      throw Error('Not supported blockchains');
    }

    const fromTransitToken = this.contracts[fromBlockchain].transitToken;
    const toTransitToken = this.contracts[toBlockchain].transitToken;

    const fromSlippage = 1 - this.slippageTolerance / 2;
    const toSlippage = 1 - this.slippageTolerance / 2;

    const sourceBlockchainProviders = await this.getSortedProvidersList(
      fromBlockchain,
      fromToken,
      fromAmount,
      fromTransitToken
    );
    const {
      providerIndex: fromProviderIndex,
      tradeAndToAmount: { trade: fromTrade, toAmount: fromTransitTokenAmount }
    } = sourceBlockchainProviders[0];

    const { toTransitTokenAmount, feeInPercents } = await this.getToTransitTokenAmount(
      fromBlockchain,
      toBlockchain,
      fromTransitTokenAmount,
      fromTrade === null,
      fromSlippage
    );

    const targetBlockchainProviders = await this.getSortedProvidersList(
      toBlockchain,
      toTransitToken,
      toTransitTokenAmount,
      toToken
    );

    // @TODO fix excluded providers
    const filteredTargetBlockchainProviders = targetBlockchainProviders.filter(
      provider =>
        !(
          fromBlockchain === BLOCKCHAIN_NAME.SOLANA &&
          this.contracts[toBlockchain].isProviderUniV3(provider.providerIndex)
        )
    );

    const {
      providerIndex: toProviderIndex,
      tradeAndToAmount: { trade: toTrade, toAmount }
    } = filteredTargetBlockchainProviders[0];

    const cryptoFee = await this.getCryptoFee(fromBlockchain, toBlockchain);

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

      transitTokenFee: feeInPercents,
      cryptoFee
    };

    await this.calculateSmartRouting(
      sourceBlockchainProviders,
      filteredTargetBlockchainProviders,
      fromBlockchain,
      toBlockchain,
      toToken.address
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
    toToken: InstantTradeToken
  ): Promise<IndexedTradeAndToAmount[]> {
    const promises = this.contracts[blockchain].providersData.map(async (_, providerIndex) => ({
      providerIndex,
      tradeAndToAmount: await this.getTradeAndToAmount(
        blockchain,
        providerIndex,
        fromToken,
        fromAmount,
        toToken
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
   * Calculates uniswap course of {@param fromToken } to {@param toToken} and returns output amount of {@param toToken}.
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
    toToken: InstantTradeToken
  ): Promise<TradeAndToAmount> {
    if (!compareAddresses(fromToken.address, toToken.address)) {
      try {
        const contractAddress = this.contracts[blockchain].address;
        const instantTrade = await this.contracts[blockchain]
          .getProvider(providerIndex)
          .calculateTrade(fromToken, fromAmount, toToken, false, contractAddress);
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
    const { minAmount: minTransitTokenAmount, maxAmount: maxTransitTokenAmount } =
      await this.getMinMaxTransitTokenAmounts(fromBlockchain, fromSlippage);

    if (fromTransitTokenAmount.lt(minTransitTokenAmount)) {
      const minAmount = await this.getFromTokenAmount(
        fromBlockchain,
        trade.fromProviderIndex,
        trade.tokenIn,
        minTransitTokenAmount
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
        maxTransitTokenAmount
      );
      return {
        maxAmountError: maxAmount
      };
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
   */
  private async getFromTokenAmount(
    blockchain: SupportedCrossChainBlockchain,
    providerIndex: number,
    fromToken: BlockchainToken,
    transitTokenAmount: BigNumber
  ): Promise<BigNumber> {
    const transitToken = this.contracts[blockchain].transitToken;
    if (compareAddresses(fromToken.address, transitToken.address)) {
      return transitTokenAmount;
    }

    if (transitTokenAmount.eq(0)) {
      return new BigNumber(0);
    }

    const contractAddress = this.contracts[blockchain].address;
    return (
      await this.contracts[blockchain]
        .getProvider(providerIndex)
        .calculateTrade(transitToken, transitTokenAmount, fromToken, false, contractAddress)
    ).to.amount;
  }

  /**
   * Calculates transit token's amount in target blockchain, based on transit token's amount is source blockchain.
   * @param fromBlockchain Source blockchain.
   * @param toBlockchain Target blockchain.
   * @param fromTransitTokenAmount Amount of transit token in source blockchain.
   * @param isDirectTrade True, if first transit token is traded directly.
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
    const contract =
      fromBlockchain !== BLOCKCHAIN_NAME.SOLANA
        ? this.contracts[fromBlockchain]
        : this.contracts[toBlockchain];
    const numOfToBlockchain = this.contracts[toBlockchain].numOfBlockchain;

    const feeAmountAbsolute = await contract.feeAmountOfBlockchain(numOfToBlockchain);

    return parseInt(feeAmountAbsolute) / 10000; // to %
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
  ): Promise<number> {
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
    if (fromBlockchain !== BLOCKCHAIN_NAME.ETHEREUM || !walletAddress) {
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
      toTransitTokenAmount
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
      cryptoFee: trade.cryptoFee,
      estimatedGas,
      priceImpactFrom,
      priceImpactTo,
      fromProvider,
      toProvider,
      fromPath,
      toPath
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

    const [isFromPaused, isToPaused] = await Promise.all([
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

    const maxGasPrice = await (this.contracts[toBlockchain] as EthLikeContractData).maxGasPrice();

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

    const { fromBlockchain, tokenIn, tokenInAmount } = this.currentCrossChainTrade;
    const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];

    await Promise.all([
      this.checkIfPaused(),
      this.checkGasPrice(),
      this.checkContractBalance(),
      blockchainAdapter.checkBalance(tokenIn, tokenInAmount, this.authService.userAddress)
    ]);
  }

  public createTrade(options: TransactionOptions = {}): Observable<void> {
    return from(
      (async () => {
        await this.checkTradeParameters();
        this.checkDeviceAndShowNotification();

        let transactionHash;
        try {
          transactionHash = await this.contractExecutorFacade.executeTrade(
            this.currentCrossChainTrade,
            options,
            this.authService.userAddress
          );

          await this.postCrossChainTradeAndNotifyGtm(transactionHash);
        } catch (err) {
          if (err instanceof FailedToCheckForTransactionReceiptError) {
            await this.postCrossChainTradeAndNotifyGtm(transactionHash);
            return;
          }

          const errMessage = err.message || err.toString?.();
          if (errMessage?.includes('swapContract: Not enough amount of tokens')) {
            throw new CrossChainIsUnavailableWarning();
          }
          if (errMessage?.includes('err: insufficient funds for gas * price + value')) {
            throw new InsufficientFundsGasPriceValueError(
              this.currentCrossChainTrade.tokenIn.symbol
            );
          }

          const unsupportedTokenErrors = [
            'execution reverted: TransferHelper: TRANSFER_FROM_FAILED',
            'execution reverted: UniswapV2: K',
            'execution reverted: UniswapV2:  TRANSFER_FAILED',
            'execution reverted: Pancake: K',
            'execution reverted: Pancake:  TRANSFER_FAILED',
            'execution reverted: Solarbeam: K',
            'execution reverted: Solarbeam:  TRANSFER_FAILED'
          ];

          if (
            unsupportedTokenErrors.some(errText =>
              errMessage.toLowerCase().includes(errText.toLocaleLowerCase())
            )
          ) {
            throw new UnsupportedTokenCCR();
          }

          throw err;
        }
      })()
    );
  }

  /**
   * Posts trade data to log widget domain, or to apply promo code.
   * @param transactionHash Hash of checked transaction.
   */
  private async postCrossChainTradeAndNotifyGtm(transactionHash: string): Promise<void> {
    const settings = this.settingsService.crossChainRoutingValue;
    await this.apiService.postTrade(
      transactionHash,
      this.currentCrossChainTrade.fromBlockchain,
      settings.promoCode?.status === 'accepted' ? settings.promoCode.text : undefined
    );

    await this.notifyGtmAfterSignTx(transactionHash);
  }

  /**
   * Notifies GTM about signed transaction.
   * @param txHash Signed transaction hash.
   */
  private async notifyGtmAfterSignTx(txHash: string): Promise<void> {
    const { feeAmount } = await this.getTradeInfo();
    const { tokenIn, tokenOut } = this.currentCrossChainTrade;
    const tokenUsdPrice = await this.tokensService.getAndUpdateTokenPrice({
      address: tokenIn.address,
      blockchain: tokenIn.blockchain
    });

    this.gtmService.fireTxSignedEvent(
      SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING,
      txHash,
      feeAmount.toNumber(),
      tokenIn.symbol,
      tokenOut.symbol,
      tokenIn.amount.toNumber() * tokenUsdPrice
    );
    return;
  }

  public calculateTokenOutAmountMin(): BigNumber {
    return ContractExecutorFacadeService.calculateTokenOutAmountMin(this.currentCrossChainTrade);
  }

  private checkDeviceAndShowNotification(): void {
    if (this.iframeService.isIframe && this.iframeService.device === 'mobile') {
      this.notificationsService.show(
        this.translateService.instant('notifications.openMobileWallet'),
        {
          status: TuiNotification.Info,
          autoClose: 5000
        }
      );
    }
  }

  private async calculateSmartRouting(
    sourceBlockchainProviders: IndexedTradeAndToAmount[],
    targetBlockchainProviders: IndexedTradeAndToAmount[],
    fromBlockchain: SupportedCrossChainBlockchain,
    toBlockchain: SupportedCrossChainBlockchain,
    toToken: string
  ): Promise<void> {
    const [sourceBestProvider, sourceWorseProvider] = sourceBlockchainProviders;
    const [targetBestProvider, targetWorstProvider] = targetBlockchainProviders;
    const smartRouting = {
      fromProvider: this.getProviderType(fromBlockchain, sourceBestProvider.providerIndex),
      toProvider: this.getProviderType(toBlockchain, targetBestProvider.providerIndex),
      fromHasTrade: Boolean(sourceBestProvider?.tradeAndToAmount.trade),
      toHasTrade: Boolean(targetBestProvider?.tradeAndToAmount.trade),
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
    this._smartRoutingLoading$.next(false);
  }

  public resetSmartRouting(): void {
    this._smartRouting$.next(null);
  }

  private getProviderType(
    blockchain: SupportedCrossChainBlockchain,
    providerIndex: number
  ): INSTANT_TRADES_PROVIDERS {
    return this.contracts[blockchain].getProvider(providerIndex).providerType;
  }
}

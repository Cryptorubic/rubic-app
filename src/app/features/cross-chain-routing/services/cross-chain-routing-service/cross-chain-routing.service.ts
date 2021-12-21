import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { EthLikeWeb3Public } from 'src/app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { from, Observable } from 'rxjs';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { CrossChainTrade } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import MaxGasPriceOverflowWarning from 'src/app/core/errors/models/common/MaxGasPriceOverflowWarning';
import CrossChainIsUnavailableWarning from 'src/app/core/errors/models/cross-chain-routing/CrossChainIsUnavailableWarning';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { CrossChainRoutingApiService } from 'src/app/core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import InsufficientLiquidityError from 'src/app/core/errors/models/instant-trade/insufficient-liquidity.error';
import {
  SupportedCrossChainBlockchain,
  supportedCrossChainBlockchains
} from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import InsufficientFundsGasPriceValueError from 'src/app/core/errors/models/cross-chain-routing/insufficient-funds-gas-price-value';
import FailedToCheckForTransactionReceiptError from 'src/app/core/errors/models/common/FailedToCheckForTransactionReceiptError';
import { compareAddresses } from 'src/app/shared/utils/utils';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { GasService } from 'src/app/core/services/gas-service/gas.service';
import { TokenAmount } from '@shared/models/tokens/TokenAmount';
import { CrossChainTradeInfo } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade-info';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import { PCacheable } from 'ts-cacheable';
import { CrossChainContractReader } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-reader/cross-chain-contract-reader';
import { CrossChainContractExecutorFacadeService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/cross-chain-contract-executor-facade.service';
import { SolanaWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-private.service';
import { SolanaContractExecutorService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/solana-contract-executor.service';
import CustomError from '@core/errors/models/custom-error';
import { CrossChainContractsDataService } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-data/cross-chain-contracts-data.service';
import InstantTrade from '@features/instant-trade/models/InstantTrade';
import UnsupportedTokenCCR from '@core/errors/models/cross-chain-routing/unsupported-token-ccr';

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
    return !!supportedCrossChainBlockchains.find(
      supportedBlockchain => supportedBlockchain === blockchain
    );
  }

  private readonly contracts = this.contractsDataService.getCrossChainContracts();

  private currentCrossChainTrade: CrossChainTrade;

  /**
   * Gets slippage, selected in settings, divided by 100%.
   */
  private get slippageTolerance(): number {
    return this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
  }

  constructor(
    private readonly contractsDataService: CrossChainContractsDataService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly settingsService: SettingsService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly web3PrivateService: EthLikeWeb3PrivateService,
    private readonly swapFormService: SwapFormService,
    private readonly tokensService: TokensService,
    private readonly apiService: CrossChainRoutingApiService,
    private readonly gasService: GasService,
    private readonly contractExecutorFacade: CrossChainContractExecutorFacadeService,
    private readonly solanaPrivateAdapter: SolanaWeb3PrivateService
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

    const {
      providerIndex: fromProviderIndex,
      tradeAndToAmount: { trade: fromTrade, toAmount: fromTransitTokenAmount }
    } = await this.getBestProviderIndex(fromBlockchain, fromToken, fromAmount, fromTransitToken);

    const { toTransitTokenAmount, feeInPercents } = await this.getToTransitTokenAmount(
      toBlockchain,
      fromTransitTokenAmount,
      fromTrade === null,
      fromSlippage
    );

    const {
      providerIndex: toProviderIndex,
      tradeAndToAmount: { trade: toTrade, toAmount }
    } = await this.getBestProviderIndex(
      toBlockchain,
      toTransitToken,
      toTransitTokenAmount,
      toToken
    );

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

    const [gasData, minMaxErrors, needApprove] = await Promise.all([
      this.getGasData(this.currentCrossChainTrade),
      this.checkMinMaxErrors(this.currentCrossChainTrade),
      calculateNeedApprove ? this.needApprove(fromBlockchain, fromToken) : undefined
    ]);
    this.currentCrossChainTrade = {
      ...this.currentCrossChainTrade,
      ...gasData
    };

    return {
      toAmount,
      ...minMaxErrors,
      needApprove
    };
  }

  /**
   * Gets the best provider index in blockchain, based on profit of uniswap provider.
   */
  private async getBestProviderIndex(
    blockchain: SupportedCrossChainBlockchain,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<IndexedTradeAndToAmount> {
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
      return sortedResults[0];
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
        const instantTrade = await this.contracts[blockchain]
          .getProvider(providerIndex)
          .calculateTrade(fromToken, fromAmount, toToken, false);
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
    const firstTransitToken = this.contracts[fromBlockchain].transitToken;
    const fromContractAddress = this.contracts[fromBlockchain].address;

    const getAmount = async (type: 'minAmount' | 'maxAmount'): Promise<BigNumber> => {
      const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];
      const contractFacade = new CrossChainContractReader(blockchainAdapter);
      const firstTransitTokenAmountAbsolute =
        type === 'minAmount'
          ? await contractFacade.minTokenAmount(fromContractAddress)
          : await contractFacade.maxTokenAmount(fromContractAddress);
      const firstTransitTokenAmount = EthLikeWeb3Public.fromWei(
        firstTransitTokenAmountAbsolute,
        firstTransitToken.decimals
      );

      if (type === 'minAmount') {
        return firstTransitTokenAmount.dividedBy(fromSlippage);
      }
      return firstTransitTokenAmount.minus(1);
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

    if (!CrossChainRoutingService.isSupportedBlockchain(fromToken.blockchain)) {
      throw Error('Not supported blockchain');
    }

    const amountAbsolute = transitTokenAmount.gt(0)
      ? await this.contracts[fromToken.blockchain]
          .getProvider(providerIndex)
          .getFromAmount(fromToken, transitToken, transitTokenAmount)
      : 0;
    return EthLikeWeb3Public.fromWei(amountAbsolute, fromToken.decimals);
  }

  /**
   * Calculates transit token's amount in target blockchain, based on transit token's amount is source blockchain.
   * @param toBlockchain Target blockchain
   * @param fromTransitTokenAmount Amount of transit token in source blockchain.
   * @param isDirectTrade True, if first transit token is traded directrly.
   * @param fromSlippage Slippage in source blockchain.
   */
  private async getToTransitTokenAmount(
    toBlockchain: SupportedCrossChainBlockchain,
    fromTransitTokenAmount: BigNumber,
    isDirectTrade: boolean,
    fromSlippage: number
  ): Promise<{ toTransitTokenAmount: BigNumber; feeInPercents: number }> {
    const feeInPercents = await this.getFeeInPercents(toBlockchain);
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
   * @param toBlockchain Target blockchain.
   */
  private async getFeeInPercents(toBlockchain: SupportedCrossChainBlockchain): Promise<number> {
    const contractAddress = this.contracts[toBlockchain].address;
    const numOfBlockchain = this.contracts[toBlockchain].numOfBlockchain;

    const blockchainAdapter = this.publicBlockchainAdapterService[toBlockchain];
    const feeOfToBlockchainAbsolute = await new CrossChainContractReader(
      blockchainAdapter
    ).feeAmountOfBlockchain(contractAddress, numOfBlockchain);
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
  ): Promise<number> {
    const contractAddress = this.contracts[fromBlockchain].address;
    const toNumOfBlockchain = this.contracts[toBlockchain].numOfBlockchain;
    const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];

    return new CrossChainContractReader(blockchainAdapter).blockchainCryptoFee(
      contractAddress,
      toNumOfBlockchain
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
        await this.contractExecutorFacade.getContractParams(trade, walletAddress);

      const web3Public = this.publicBlockchainAdapterService[fromBlockchain];
      const gasLimit = await web3Public.getEstimatedGas(
        contractAbi,
        contractAddress,
        methodName,
        methodArguments,
        walletAddress,
        value
      );
      const gasPrice = EthLikeWeb3Public.toWei(
        await this.gasService.getGasPriceInEthUnits(fromBlockchain)
      );

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

    const estimatedGas = trade.gasLimit?.multipliedBy(EthLikeWeb3Public.fromWei(trade.gasPrice));

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

    return {
      feePercent,
      feeAmount,
      feeTokenSymbol: secondTransitToken.symbol,
      cryptoFee: trade.cryptoFee,
      estimatedGas,
      priceImpactFrom,
      priceImpactTo
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
   * Checks that contracts are alive.
   */
  private async checkWorking(): Promise<void> {
    const { fromBlockchain, toBlockchain } = this.currentCrossChainTrade;

    const fromContractAddress = this.contracts[fromBlockchain].address;
    const fromBlockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];
    const isFromPaused = await new CrossChainContractReader(fromBlockchainAdapter).isPaused(
      fromContractAddress
    );
    if (isFromPaused) {
      throw new CrossChainIsUnavailableWarning();
    }

    const toContractAddress = this.contracts[toBlockchain].address;
    const toBlockchainAdapter = this.publicBlockchainAdapterService[toBlockchain];
    const isToPaused = await new CrossChainContractReader(toBlockchainAdapter).isPaused(
      toContractAddress
    );
    if (isToPaused) {
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

    const contractAddress = this.contracts[toBlockchain].address;
    const blockchainAdapter = this.publicBlockchainAdapterService[toBlockchain];

    const maxGasPrice = await new CrossChainContractReader(blockchainAdapter).getMaxGasPrice(
      contractAddress
    );
    const currentGasPrice = EthLikeWeb3Public.toWei(
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
    const contractBalance = EthLikeWeb3Public.fromWei(
      contractBalanceAbsolute,
      secondTransitToken.decimals
    );

    if (toTransitTokenAmount.gt(contractBalance)) {
      throw new CrossChainIsUnavailableWarning();
    }
  }

  /**
   * Checks contracts' state and user's balance.
   */
  private async checkTradeWorking(): Promise<void | never> {
    this.walletConnectorService.checkSettings(this.currentCrossChainTrade.fromBlockchain);

    const { fromBlockchain, tokenIn, tokenInAmount } = this.currentCrossChainTrade;
    const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];

    await Promise.all([
      this.checkWorking(),
      this.checkGasPrice(),
      this.checkContractBalance(),
      blockchainAdapter.checkBalance(tokenIn, tokenInAmount, this.authService.userAddress)
    ]);
  }

  public createTrade(options: TransactionOptions = {}): Observable<void> {
    return from(
      (async () => {
        await this.checkTradeWorking();

        let transactionHash;
        try {
          transactionHash = await this.contractExecutorFacade.executeCCRContract(
            this.currentCrossChainTrade,
            options,
            this.authService.userAddress
          );

          await this.postCrossChainTrade(transactionHash);
        } catch (err) {
          if (err instanceof FailedToCheckForTransactionReceiptError) {
            await this.postCrossChainTrade(transactionHash);
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
  private async postCrossChainTrade(transactionHash: string): Promise<void> {
    const settings = this.settingsService.crossChainRoutingValue;
    await this.apiService.postTrade(
      transactionHash,
      this.currentCrossChainTrade.fromBlockchain,
      settings.promoCode?.status === 'accepted' ? settings.promoCode.text : undefined
    );
  }

  public calculateTokenOutAmountMin(): BigNumber {
    return CrossChainContractExecutorFacadeService.calculateTokenOutAmountMin(
      this.currentCrossChainTrade
    );
  }
}

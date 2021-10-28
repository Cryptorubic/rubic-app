import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import {
  CcrSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/providers/provider-connector-service/provider-connector.service';
import { BlockchainPublicService } from 'src/app/core/services/blockchain/blockchain-public/blockchain-public.service';
import { from, Observable, of } from 'rxjs';
import { filter, first, map, startWith, switchMap } from 'rxjs/operators';
import {
  crossChainSwapContractAddresses,
  SupportedCrossChainSwapBlockchain,
  supportedCrossChainSwapBlockchains
} from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAddresses';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import {
  TransitTokens,
  transitTokensWithMode
} from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/transitTokens';
import { QuickSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/quick-swap-service/quick-swap.service';
import { PancakeSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/pancake-swap-service/pancake-swap.service';
import { UniSwapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v2-service/uni-swap-v2.service';
import { CROSS_CHAIN_ROUTING_SWAP_METHOD } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/CROSS_CHAIN_ROUTING_SWAP_METHOD';
import { CrossChainRoutingTrade } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainRoutingTrade';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { crossChainSwapContractAbi } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAbi';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import MaxGasPriceOverflowWarning from 'src/app/core/errors/models/common/MaxGasPriceOverflowWarning';
import CrossChainIsUnavailableWarning from 'src/app/core/errors/models/cross-chain-routing/CrossChainIsUnavailableWarning';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { CrossChainRoutingApiService } from 'src/app/core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import InsufficientLiquidityError from 'src/app/core/errors/models/instant-trade/insufficient-liquidity.error';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import InsufficientFundsGasPriceValueError from 'src/app/core/errors/models/cross-chain-routing/insufficient-funds-gas-price-value';
import FailedToCheckForTransactionReceiptError from 'src/app/core/errors/models/common/FailedToCheckForTransactionReceiptError';
import { Web3Public } from 'src/app/core/services/blockchain/blockchain-adapters/web3/web3-public';
import CustomError from 'src/app/core/errors/models/custom-error';

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingService {
  private contractAbi = crossChainSwapContractAbi;

  private contractAddresses: Record<SupportedCrossChainSwapBlockchain, string>;

  private transitTokens: TransitTokens;

  private uniswapV2Providers: Record<SupportedCrossChainSwapBlockchain, CommonUniswapV2Service>;

  private toBlockchainsInContract: Record<SupportedCrossChainSwapBlockchain, number>;

  private settings: CcrSettingsForm;

  private currentCrossChainTrade: CrossChainRoutingTrade;

  public static isSupportedBlockchain(
    blockchain: BLOCKCHAIN_NAME
  ): blockchain is SupportedCrossChainSwapBlockchain {
    return !!supportedCrossChainSwapBlockchains.find(
      supportedBlockchain => supportedBlockchain === blockchain
    );
  }

  constructor(
    private readonly uniSwapV2Service: UniSwapV2Service,
    private readonly pancakeSwapService: PancakeSwapService,
    private readonly quickSwapService: QuickSwapService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly settingsService: SettingsService,
    private readonly blockchainPublicService: BlockchainPublicService,
    private readonly swapFormService: SwapFormService,
    private readonly tokensService: TokensService,
    private readonly crossChainRoutingApiService: CrossChainRoutingApiService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly iframeService: IframeService
  ) {
    this.setUniswapProviders();
    this.setToBlockchainsInContract();

    this.settingsService.crossChainRoutingValueChanges
      .pipe(startWith(this.settingsService.crossChainRoutingValue))
      .subscribe(settings => {
        this.settings = settings;
      });

    this.contractAddresses = crossChainSwapContractAddresses.mainnet;
    this.transitTokens = transitTokensWithMode.mainnet;

    this.initTestingMode();
  }

  private initTestingMode(): void {
    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.contractAddresses = crossChainSwapContractAddresses.testnet;
        this.transitTokens = transitTokensWithMode.testnet;
      }
    });
  }

  private setUniswapProviders(): void {
    this.uniswapV2Providers = {
      [BLOCKCHAIN_NAME.ETHEREUM]: this.uniSwapV2Service,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.pancakeSwapService,
      [BLOCKCHAIN_NAME.POLYGON]: this.quickSwapService
    };
  }

  private setToBlockchainsInContract(): void {
    this.toBlockchainsInContract = {
      [BLOCKCHAIN_NAME.ETHEREUM]: 2,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 1,
      [BLOCKCHAIN_NAME.POLYGON]: 3
    };
  }

  public needApprove(): Observable<boolean> {
    const { fromToken } = this.swapFormService.inputValue;
    if (!CrossChainRoutingService.isSupportedBlockchain(fromToken.blockchain)) {
      throw Error('Not supported blockchain');
    }

    const blockchainPublicAdapter = this.blockchainPublicService.adapters[fromToken.blockchain];
    if (blockchainPublicAdapter.isNativeAddress(fromToken.address)) {
      return of(false);
    }

    const contractAddress = this.contractAddresses[fromToken.blockchain];
    return from(
      blockchainPublicAdapter.getAllowance(
        fromToken.address,
        this.providerConnectorService.address,
        contractAddress
      )
    ).pipe(map(allowance => allowance.eq(0)));
  }

  public approve(options: TransactionOptions = {}): Observable<TransactionReceipt> {
    const { fromToken } = this.swapFormService.inputValue;
    if (!CrossChainRoutingService.isSupportedBlockchain(fromToken.blockchain)) {
      throw Error('Not supported blockchain');
    }

    const contractAddress = this.contractAddresses[fromToken.blockchain];
    return from(
      this.providerConnectorService.provider.approveTokens(
        fromToken.address,
        contractAddress,
        'infinity',
        options
      )
    );
  }

  private async getMinMaxTransitTokenAmounts(): Promise<{
    minAmount: BigNumber;
    maxAmount: BigNumber;
  }> {
    const { fromToken } = this.swapFormService.inputValue;
    const fromBlockchain = fromToken.blockchain;
    if (!CrossChainRoutingService.isSupportedBlockchain(fromBlockchain)) {
      throw Error('Not supported blockchain');
    }

    const blockchainPublicAdapter = this.blockchainPublicService.adapters[fromBlockchain];

    const getAmount = async (type: 'minAmount' | 'maxAmount'): Promise<BigNumber> => {
      if (blockchainPublicAdapter instanceof Web3Public) {
        const transitTokenAmountAbsolute = await blockchainPublicAdapter.callContractMethod(
          this.contractAddresses[fromBlockchain],
          this.contractAbi,
          type === 'minAmount' ? 'minTokenAmount' : 'maxTokenAmount'
        );

        const transitToken = this.transitTokens[fromBlockchain];
        return BlockchainPublicService.fromWei(transitTokenAmountAbsolute, transitToken.decimals);
      }
      return new BigNumber(null);
    };

    return Promise.all([getAmount('minAmount'), getAmount('maxAmount')]).then(
      ([minAmount, maxAmount]) => ({
        minAmount,
        maxAmount
      })
    );
  }

  private async getFromTokenAmount(
    fromToken: BlockchainToken,
    transitToken: InstantTradeToken,
    transitTokenAmount: BigNumber
  ): Promise<BigNumber> {
    if (fromToken.address.toLowerCase() === transitToken.address.toLowerCase()) {
      return transitTokenAmount;
    }

    if (!CrossChainRoutingService.isSupportedBlockchain(fromToken.blockchain)) {
      throw Error('Not supported blockchain');
    }

    const amountAbsolute = transitTokenAmount.gt(0)
      ? await this.uniswapV2Providers[fromToken.blockchain].getFromAmount(
          fromToken.address,
          transitToken,
          transitTokenAmount
        )
      : 0;
    return BlockchainPublicService.fromWei(amountAbsolute, fromToken.decimals);
  }

  public async calculateTrade(): Promise<{
    toAmount: BigNumber;
    minAmountError?: BigNumber;
    maxAmountError?: BigNumber;
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

    const firstTransitToken = this.transitTokens[fromBlockchain];
    const secondTransitToken = this.transitTokens[toBlockchain];

    const { path: firstPath, toAmount: firstTransitTokenAmount } = await this.getPathAndToAmount(
      fromBlockchain,
      fromToken,
      fromAmount,
      firstTransitToken
    );

    const feeAmountInPercents = await this.getFeeAmountInPercents();
    const secondTransitTokenAmount = firstTransitTokenAmount
      .multipliedBy(100 - feeAmountInPercents)
      .dividedBy(100);

    const { path: secondPath, toAmount } = await this.getPathAndToAmount(
      toBlockchain,
      secondTransitToken,
      secondTransitTokenAmount,
      toToken
    );

    const trade = {
      fromBlockchain,
      toBlockchain,
      tokenIn: fromToken,
      firstPath,
      tokenInAmount: fromAmount,
      firstTransitTokenAmount,
      rbcTokenOutAmountAbsolute: BlockchainPublicService.toWei(
        firstTransitTokenAmount,
        firstTransitToken.decimals
      ),
      secondTransitTokenAmount,
      tokenOut: toToken,
      secondPath,
      tokenOutAmount: toAmount
    };
    this.currentCrossChainTrade = trade;

    const { minAmount: minTransitTokenAmount, maxAmount: maxTransitTokenAmount } =
      await this.getMinMaxTransitTokenAmounts();
    if (firstTransitTokenAmount.lt(minTransitTokenAmount)) {
      const minAmount = await this.getFromTokenAmount(
        fromToken,
        firstTransitToken,
        minTransitTokenAmount
      );
      if (!minAmount?.isFinite()) {
        throw new InsufficientLiquidityError('CrossChainRouting');
      }
      return {
        toAmount: trade.tokenOutAmount,
        minAmountError: minAmount
      };
    }
    if (firstTransitTokenAmount.gt(maxTransitTokenAmount)) {
      const maxAmount = await this.getFromTokenAmount(
        fromToken,
        firstTransitToken,
        maxTransitTokenAmount
      );
      return {
        toAmount: trade.tokenOutAmount,
        maxAmountError: maxAmount
      };
    }

    return {
      toAmount: trade.tokenOutAmount
    };
  }

  private async getPathAndToAmount(
    blockchain: SupportedCrossChainSwapBlockchain,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<{ path: string[]; toAmount: BigNumber }> {
    if (fromToken.address.toLowerCase() !== toToken.address.toLowerCase()) {
      try {
        const instantTrade = await this.uniswapV2Providers[blockchain].calculateTrade(
          fromToken,
          fromAmount,
          toToken,
          false
        );
        return {
          path: instantTrade.path,
          toAmount: instantTrade.to.amount
        };
      } catch (err) {
        if (err instanceof InsufficientLiquidityError) {
          throw new InsufficientLiquidityError('CrossChainRouting');
        }
        throw err;
      }
    }
    return { path: [fromToken.address], toAmount: fromAmount };
  }

  private async getFeeAmountInPercents(): Promise<number> {
    const fromBlockchain = this.swapFormService.inputValue
      .fromBlockchain as SupportedCrossChainSwapBlockchain;
    const contractAddress = this.contractAddresses[fromBlockchain];
    const blockchainPublicAdapterFrom = this.blockchainPublicService.adapters[fromBlockchain];

    if (blockchainPublicAdapterFrom instanceof Web3Public) {
      const toBlockchainInContract = this.toBlockchainsInContract[fromBlockchain];
      const feeOfToBlockchainAbsolute = await blockchainPublicAdapterFrom.callContractMethod(
        contractAddress,
        this.contractAbi,
        'feeAmountOfBlockchain',
        {
          methodArguments: [toBlockchainInContract]
        }
      );
      return parseInt(feeOfToBlockchainAbsolute) / 10000; // to %
    }
    return null;
  }

  public getFeeAmountData(): Observable<{
    percent: number;
    amount: BigNumber;
    amountInUsd: BigNumber;
  }> {
    if (!this.currentCrossChainTrade) {
      return of(null);
    }

    return this.tokensService.tokens$.pipe(
      filter(tokens => !!tokens.size),
      first(),
      switchMap(async tokens => {
        const percent = await this.getFeeAmountInPercents();
        const amount = this.currentCrossChainTrade.firstTransitTokenAmount.multipliedBy(
          percent / 100
        );

        const { fromBlockchain } = this.currentCrossChainTrade;
        const transitToken = this.transitTokens[fromBlockchain];
        const foundTransitToken = tokens.find(
          token =>
            token.blockchain === fromBlockchain &&
            token.address.toLowerCase() === transitToken.address.toLowerCase()
        );
        const amountInUsd = foundTransitToken?.price
          ? amount.multipliedBy(foundTransitToken.price)
          : null;

        return {
          percent,
          amount,
          amountInUsd
        };
      })
    );
  }

  private async checkGasPrice(
    toBlockchain: SupportedCrossChainSwapBlockchain
  ): Promise<void | never> {
    const contractAddress = this.contractAddresses[toBlockchain];
    const blockchainPublicAdapter = this.blockchainPublicService.adapters[toBlockchain];
    if (blockchainPublicAdapter instanceof Web3Public) {
      const maxGasPrice = await blockchainPublicAdapter.callContractMethod(
        contractAddress,
        this.contractAbi,
        'maxGasPrice'
      );
      const currentGasPrice = await blockchainPublicAdapter.getGasPrice();
      if (new BigNumber(maxGasPrice).lt(currentGasPrice)) {
        throw new MaxGasPriceOverflowWarning(toBlockchain);
      }
    }
  }

  private async checkPoolBalance(trade: CrossChainRoutingTrade): Promise<void | never> {
    const { toBlockchain } = trade;
    const contractAddress = this.contractAddresses[toBlockchain];
    const blockchainPublicAdapter = this.blockchainPublicService.adapters[toBlockchain];

    if (blockchainPublicAdapter instanceof Web3Public) {
      const poolAddress = await blockchainPublicAdapter.callContractMethod(
        contractAddress,
        this.contractAbi,
        'blockchainPool'
      );
      const secondTransitToken = this.transitTokens[toBlockchain];
      const poolBalanceAbsolute = await blockchainPublicAdapter.getTokenBalance(
        poolAddress,
        secondTransitToken.address
      );
      const poolBalance = BlockchainPublicService.fromWei(
        poolBalanceAbsolute,
        secondTransitToken.decimals
      );
      if (trade.secondTransitTokenAmount.gt(poolBalance)) {
        throw new CrossChainIsUnavailableWarning();
      }
    }
  }

  public createTrade(options: TransactionOptions = {}): Observable<void> {
    return from(
      (async () => {
        const trade = this.currentCrossChainTrade;

        this.providerConnectorService.checkSettings(trade.fromBlockchain);
        await this.checkWorking(trade);
        await this.checkGasPrice(trade.toBlockchain);
        await this.checkPoolBalance(trade);

        const blockchainPublicAdapterFrom =
          this.blockchainPublicService.adapters[trade.fromBlockchain];
        const walletAddress = this.providerConnectorService.address;

        const slippageTolerance = this.settings.slippageTolerance / 100;
        const tokenInAmountMax = trade.tokenInAmount.multipliedBy(1 + slippageTolerance);

        if (blockchainPublicAdapterFrom instanceof Web3Public) {
          await blockchainPublicAdapterFrom.checkBalance(
            trade.tokenIn,
            tokenInAmountMax,
            walletAddress
          );
        } else {
          throw new CustomError('Non ETH providers is not support by cross-chain');
        }

        const contractAddress = this.contractAddresses[trade.fromBlockchain];
        const toBlockchainInContract = this.toBlockchainsInContract[trade.toBlockchain];

        const blockchainCryptoFee = await blockchainPublicAdapterFrom.callContractMethod(
          contractAddress,
          this.contractAbi,
          'blockchainCryptoFee',
          {
            methodArguments: [toBlockchainInContract]
          }
        );

        const isFromTokenNative = blockchainPublicAdapterFrom.isNativeAddress(
          trade.tokenIn.address
        );
        const methodName = isFromTokenNative
          ? CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_CRYPTO
          : CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_TOKENS;

        const tokenInAmountAbsolute = BlockchainPublicService.toWei(
          tokenInAmountMax,
          trade.tokenIn.decimals
        );
        const tokenOutMinAbsolute = BlockchainPublicService.toWei(
          trade.tokenOutAmount.multipliedBy(1 - slippageTolerance),
          trade.tokenOut.decimals
        );
        const methodArguments = [
          [
            toBlockchainInContract,
            tokenInAmountAbsolute,
            trade.firstPath,
            trade.secondPath,
            trade.rbcTokenOutAmountAbsolute,
            tokenOutMinAbsolute,
            walletAddress,
            blockchainPublicAdapterFrom.isNativeAddress(trade.tokenOut.address)
          ]
        ];

        const value = new BigNumber(blockchainCryptoFee)
          .plus(isFromTokenNative ? tokenInAmountAbsolute : 0)
          .toFixed(0);

        let transactionHash: string;
        try {
          await this.providerConnectorService.provider.tryExecuteContractMethod(
            contractAddress,
            this.contractAbi,
            methodName,
            methodArguments,
            {
              ...options,
              value,
              onTransactionHash: (hash: string) => {
                if (options.onTransactionHash) {
                  options.onTransactionHash(hash);
                }
                transactionHash = hash;
              }
            },
            (err: Error) => {
              const includesErrCode = err?.message?.includes('-32000');
              const allowedErrors = [
                'insufficient funds for transfer',
                'insufficient funds for gas * price+ value'
              ];
              const includesPhrase = Boolean(
                allowedErrors.find(error => err?.message?.includes(error))
              );
              return includesErrCode && includesPhrase;
            }
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
              this.swapFormService.inputValue.fromToken.symbol
            );
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
    if (this.iframeService.isIframe || this.settings.promoCode?.status === 'accepted') {
      await this.crossChainRoutingApiService.postTrade(
        transactionHash,
        this.currentCrossChainTrade.fromBlockchain,
        this.settings.promoCode?.text
      );
    }
  }

  /**
   * Check if contract is alive for now.
   * @param trade Cross chain trade.
   */
  private async checkWorking(trade: CrossChainRoutingTrade): Promise<void> {
    const { fromBlockchain, toBlockchain } = trade;

    const fromContractAddress = this.contractAddresses[fromBlockchain];
    const toContractAddress = this.contractAddresses[toBlockchain];
    const fromBlockchainAdapter = this.blockchainPublicService.adapters[fromBlockchain];
    const toBlockchainAdapter = this.blockchainPublicService.adapters[toBlockchain];

    if (fromBlockchainAdapter instanceof Web3Public && toBlockchainAdapter instanceof Web3Public) {
      const sourceContractPaused = await fromBlockchainAdapter.callContractMethod(
        fromContractAddress,
        this.contractAbi,
        'paused'
      );

      const targetContractPaused = await toBlockchainAdapter.callContractMethod(
        toContractAddress,
        this.contractAbi,
        'paused'
      );

      if (sourceContractPaused || targetContractPaused) {
        throw new CrossChainIsUnavailableWarning();
      }
    }
  }
}

import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import {
  CcrSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/providers/provider-connector-service/provider-connector.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3/web3-public-service/web3-public.service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3/web3-private-service/web3-private.service';
import { from, Observable, of } from 'rxjs';
import { first, map, startWith, switchMap } from 'rxjs/operators';
import { crossChainSwapContractAddresses } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAddresses';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { QuickSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/quick-swap-service/quick-swap.service';
import { PancakeSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/pancake-swap-service/pancake-swap.service';
import { UniSwapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v2-service/uni-swap-v2.service';
import { CROSS_CHAIN_ROUTING_SWAP_METHOD } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/CROSS_CHAIN_ROUTING_SWAP_METHOD';
import { CrossChainRoutingTrade } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainRoutingTrade';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import MaxGasPriceOverflowWarning from 'src/app/core/errors/models/common/MaxGasPriceOverflowWarning';
import CrossChainIsUnavailableWarning from 'src/app/core/errors/models/cross-chain-routing/CrossChainIsUnavailableWarning';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { CrossChainRoutingApiService } from 'src/app/core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import InsufficientLiquidityError from 'src/app/core/errors/models/instant-trade/insufficient-liquidity.error';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { AbiItem } from 'web3-utils';
import {
  SupportedCrossChainSwapBlockchain,
  supportedCrossChainSwapBlockchains
} from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';
import {
  TransitTokens,
  transitTokensWithMode
} from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/transitTokens';
import { crossChainSwapContractAbi } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAbi';
import { PangolinAvalancheService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/pangolin-avalanche-service/pangolin-avalanche.service';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import InsufficientFundsGasPriceValueError from 'src/app/core/errors/models/cross-chain-routing/insufficient-funds-gas-price-value';
import FailedToCheckForTransactionReceiptError from 'src/app/core/errors/models/common/FailedToCheckForTransactionReceiptError';
import { compareAddresses } from 'src/app/shared/utils/utils';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { PlatformFee } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/PlatformFee';

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingService {
  private readonly contractAbi: AbiItem[];

  private readonly contractAddresses: Record<SupportedCrossChainSwapBlockchain, string>;

  private readonly transitTokens: TransitTokens;

  private uniswapV2Providers: Record<SupportedCrossChainSwapBlockchain, CommonUniswapV2Service>;

  private numOfBlockchainsInContract: Record<SupportedCrossChainSwapBlockchain, number>;

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
    private readonly pangolinAvalancheService: PangolinAvalancheService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly authService: AuthService,
    private readonly settingsService: SettingsService,
    private readonly web3PublicService: Web3PublicService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly swapFormService: SwapFormService,
    private readonly tokensService: TokensService,
    private readonly crossChainRoutingApiService: CrossChainRoutingApiService,
    private readonly iframeService: IframeService
  ) {
    this.contractAbi = crossChainSwapContractAbi;

    this.setUniswapProviders();
    this.setToBlockchainsInContract();
    this.contractAddresses = crossChainSwapContractAddresses;
    this.transitTokens = transitTokensWithMode;

    this.settingsService.crossChainRoutingValueChanges
      .pipe(startWith(this.settingsService.crossChainRoutingValue))
      .subscribe(settings => {
        this.settings = settings;
      });
  }

  private setUniswapProviders(): void {
    this.uniswapV2Providers = {
      [BLOCKCHAIN_NAME.ETHEREUM]: this.uniSwapV2Service,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.pancakeSwapService,
      [BLOCKCHAIN_NAME.POLYGON]: this.quickSwapService,
      [BLOCKCHAIN_NAME.AVALANCHE]: this.pangolinAvalancheService
    };
  }

  private setToBlockchainsInContract(): void {
    this.numOfBlockchainsInContract = {
      [BLOCKCHAIN_NAME.ETHEREUM]: 2,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 1,
      [BLOCKCHAIN_NAME.POLYGON]: 3,
      [BLOCKCHAIN_NAME.AVALANCHE]: 4
    };
  }

  public needApprove(): Observable<boolean> {
    const { fromToken } = this.swapFormService.inputValue;
    if (!CrossChainRoutingService.isSupportedBlockchain(fromToken.blockchain)) {
      throw Error('Not supported blockchain');
    }

    const web3Public: Web3Public = this.web3PublicService[fromToken.blockchain];
    if (Web3Public.isNativeAddress(fromToken.address)) {
      return of(false);
    }

    const contractAddress = this.contractAddresses[fromToken.blockchain];
    return from(
      web3Public.getAllowance(fromToken.address, this.authService.userAddress, contractAddress)
    ).pipe(map(allowance => allowance.eq(0)));
  }

  public approve(options: TransactionOptions = {}): Observable<TransactionReceipt> {
    const { fromToken } = this.swapFormService.inputValue;
    if (!CrossChainRoutingService.isSupportedBlockchain(fromToken.blockchain)) {
      throw Error('Not supported blockchain');
    }

    const contractAddress = this.contractAddresses[fromToken.blockchain];
    return from(
      this.web3PrivateService.approveTokens(fromToken.address, contractAddress, 'infinity', options)
    );
  }

  /**
   * Gets min and max permitted amount of transit token in source blockchain.
   * @param fromBlockchain Source blockchain.
   * @param toBlockchain Targeted blockchain.
   */
  private async getMinMaxTransitTokenAmounts(
    fromBlockchain: SupportedCrossChainSwapBlockchain,
    toBlockchain: SupportedCrossChainSwapBlockchain
  ): Promise<{
    minAmount: BigNumber;
    maxAmount: BigNumber;
  }> {
    const secondTransitToken = this.transitTokens[toBlockchain];
    const transitAmountMargin = 0.2; // 20%
    const web3Public: Web3Public = this.web3PublicService[toBlockchain];

    const getAmount = async (type: 'minAmount' | 'maxAmount'): Promise<BigNumber> => {
      const secondTransitTokenAmountAbsolute = await web3Public.callContractMethod(
        this.contractAddresses[toBlockchain],
        this.contractAbi,
        type === 'minAmount' ? 'minTokenAmount' : 'maxTokenAmount'
      );
      const secondTransitTokenAmount = Web3Public.fromWei(
        secondTransitTokenAmountAbsolute,
        secondTransitToken.decimals
      );

      const firstTransitTokenAmount = await this.calculateTransitTokensCourse(
        toBlockchain,
        fromBlockchain,
        secondTransitTokenAmount
      );
      if (firstTransitTokenAmount.eq(secondTransitTokenAmount)) {
        return firstTransitTokenAmount;
      }

      if (type === 'minAmount') {
        return firstTransitTokenAmount.multipliedBy(1 + transitAmountMargin);
      }
      return firstTransitTokenAmount.multipliedBy(1 - transitAmountMargin);
    };

    return Promise.all([getAmount('minAmount'), getAmount('maxAmount')]).then(
      ([minAmount, maxAmount]) => ({
        minAmount,
        maxAmount
      })
    );
  }

  /**
   * Calculates uniswap course of {@param transitToken} to {@param fromToken} and returns input amount of {@param fromToken}.
   * @param fromToken From token.
   * @param transitToken Transit token.
   * @param transitTokenAmount Output amount of transit token.
   */
  private async getFromTokenAmount(
    fromToken: BlockchainToken,
    transitToken: InstantTradeToken,
    transitTokenAmount: BigNumber
  ): Promise<BigNumber> {
    if (compareAddresses(fromToken.address, transitToken.address)) {
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
    return Web3Public.fromWei(amountAbsolute, fromToken.decimals);
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

    const secondTransitTokenAmount = await this.getSecondTransitTokenAmount(
      fromBlockchain,
      toBlockchain,
      firstTransitTokenAmount
    );

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
      rbcTokenOutAmountAbsolute: Web3Public.toWei(
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
      await this.getMinMaxTransitTokenAmounts(fromBlockchain, toBlockchain);
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

  /**
   * Calculates uniswap course of {@param fromToken } to {@param toToken} and returns output amount of {@param toToken}.
   * @param blockchain Tokens' blockchain.
   * @param fromToken From token.
   * @param fromAmount Input amount of from token.
   * @param toToken To token.
   */
  private async getPathAndToAmount(
    blockchain: SupportedCrossChainSwapBlockchain,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<{ path: string[]; toAmount: BigNumber }> {
    if (!compareAddresses(fromToken.address, toToken.address)) {
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

  /**
   * Calculates transit token's amount in targeted blockchain, based on transit token's amount is source blockchain.
   * @param fromBlockchain Source blockchain.
   * @param toBlockchain Targeted blockchain
   * @param firstTransitTokenAmount Amount of transit token in source blockchain.
   */
  private async getSecondTransitTokenAmount(
    fromBlockchain: SupportedCrossChainSwapBlockchain,
    toBlockchain: SupportedCrossChainSwapBlockchain,
    firstTransitTokenAmount: BigNumber
  ): Promise<BigNumber> {
    const amount = await this.calculateTransitTokensCourse(
      fromBlockchain,
      toBlockchain,
      firstTransitTokenAmount
    );
    const feeAmountInPercents = await this.getFeeAmountInPercents(toBlockchain);
    return amount.multipliedBy(100 - feeAmountInPercents).dividedBy(100);
  }

  /**
   * Converts one transit token's amount to another, using current dollar course.
   * @param fromTransitTokenBlockchain First transit token's blockchain.
   * @param toTransitTokenBlockchain Second transit token's blockchain.
   * @param fromTransitTokenAmount First transit token's amount.
   * @returns Promise<BigNumber> Second transit token's amount.
   */
  private async calculateTransitTokensCourse(
    fromTransitTokenBlockchain: SupportedCrossChainSwapBlockchain,
    toTransitTokenBlockchain: SupportedCrossChainSwapBlockchain,
    fromTransitTokenAmount: BigNumber
  ): Promise<BigNumber> {
    if (
      fromTransitTokenBlockchain === BLOCKCHAIN_NAME.AVALANCHE ||
      toTransitTokenBlockchain === BLOCKCHAIN_NAME.AVALANCHE
    ) {
      const firstTransitTokenPrice = await this.tokensService.getTokenPrice(
        {
          address: this.transitTokens[fromTransitTokenBlockchain].address,
          blockchain: fromTransitTokenBlockchain
        },
        true
      );
      const secondTransitTokenPrice = await this.tokensService.getTokenPrice(
        {
          address: this.transitTokens[toTransitTokenBlockchain].address,
          blockchain: toTransitTokenBlockchain
        },
        true
      );

      return fromTransitTokenAmount
        .multipliedBy(firstTransitTokenPrice)
        .dividedBy(secondTransitTokenPrice);
    }

    return fromTransitTokenAmount;
  }

  /**
   * Gets fee amount in targeted blockchain.
   * @param toBlockchain Targeted blockchain.
   */
  private async getFeeAmountInPercents(
    toBlockchain: SupportedCrossChainSwapBlockchain
  ): Promise<number> {
    const contractAddress = this.contractAddresses[toBlockchain];
    const numOfBlockchainInContract = this.numOfBlockchainsInContract[toBlockchain];
    const web3Public: Web3Public = this.web3PublicService[toBlockchain];
    const feeOfToBlockchainAbsolute = await web3Public.callContractMethod(
      contractAddress,
      this.contractAbi,
      'feeAmountOfBlockchain',
      {
        methodArguments: [numOfBlockchainInContract]
      }
    );
    return parseInt(feeOfToBlockchainAbsolute) / 10000; // to %
  }

  public getPlatformFeeData(): Observable<PlatformFee> {
    if (!this.currentCrossChainTrade) {
      return of(null);
    }

    return this.tokensService.tokens$.pipe(
      first(tokens => !!tokens.size),
      switchMap(async tokens => {
        const { toBlockchain } = this.currentCrossChainTrade;
        const toTransitToken = this.transitTokens[toBlockchain];

        const feePercent = await this.getFeeAmountInPercents(toBlockchain);
        const fee = feePercent / 100;
        const feeAmount = this.currentCrossChainTrade.secondTransitTokenAmount
          .multipliedBy(fee)
          .dividedBy(1 - fee);

        const foundTransitToken = tokens.find(
          token =>
            token.blockchain === toBlockchain &&
            compareAddresses(token.address, toTransitToken.address)
        );
        const feeAmountInUsd = foundTransitToken?.price
          ? feeAmount.multipliedBy(foundTransitToken.price)
          : null;

        return {
          percent: feePercent,
          amount: feeAmount,
          amountInUsd: feeAmountInUsd,
          tokenSymbol: toTransitToken.symbol
        };
      })
    );
  }

  /**
   * Checks that contracts are alive.
   * @param trade Cross chain trade.
   */
  private async checkWorking(trade: CrossChainRoutingTrade): Promise<void> {
    const { fromBlockchain, toBlockchain } = trade;

    const fromContractAddress = this.contractAddresses[fromBlockchain];
    const toContractAddress = this.contractAddresses[toBlockchain];
    const fromWeb3Public: Web3Public = this.web3PublicService[fromBlockchain];
    const toWeb3Public: Web3Public = this.web3PublicService[toBlockchain];

    const sourceContractPaused = await fromWeb3Public.callContractMethod(
      fromContractAddress,
      this.contractAbi,
      'paused'
    );

    const targetContractPaused = await toWeb3Public.callContractMethod(
      toContractAddress,
      this.contractAbi,
      'paused'
    );

    if (sourceContractPaused || targetContractPaused) {
      throw new CrossChainIsUnavailableWarning();
    }
  }

  /**
   * Checks that in targeted blockchain current gas price is less than or equal to max gas price.
   * @param toBlockchain Targeted blockchain.
   */
  private async checkGasPrice(
    toBlockchain: SupportedCrossChainSwapBlockchain
  ): Promise<void | never> {
    const contractAddress = this.contractAddresses[toBlockchain];
    const web3Public: Web3Public = this.web3PublicService[toBlockchain];
    const maxGasPrice = await web3Public.callContractMethod(
      contractAddress,
      this.contractAbi,
      'maxGasPrice'
    );
    const currentGasPrice = await web3Public.getGasPrice();
    if (new BigNumber(maxGasPrice).lt(currentGasPrice)) {
      throw new MaxGasPriceOverflowWarning(toBlockchain);
    }
  }

  /**
   * Checks that in targeted blockchain tokens' pool's balance is enough.
   * @param trade Cross chain trade.
   */
  private async checkPoolBalance(trade: CrossChainRoutingTrade): Promise<void | never> {
    const { toBlockchain } = trade;
    const contractAddress = this.contractAddresses[toBlockchain];
    const web3Public: Web3Public = this.web3PublicService[toBlockchain];

    const poolAddress = await web3Public.callContractMethod(
      contractAddress,
      this.contractAbi,
      'blockchainPool'
    );

    const secondTransitToken = this.transitTokens[toBlockchain];
    const poolBalanceAbsolute = await web3Public.getTokenBalance(
      poolAddress,
      secondTransitToken.address
    );
    const poolBalance = Web3Public.fromWei(poolBalanceAbsolute, secondTransitToken.decimals);

    if (trade.secondTransitTokenAmount.gt(poolBalance)) {
      throw new CrossChainIsUnavailableWarning();
    }
  }

  public createTrade(options: TransactionOptions = {}): Observable<void> {
    return from(
      (async () => {
        const trade = this.currentCrossChainTrade;

        this.providerConnectorService.checkSettings(trade.fromBlockchain);
        await Promise.all([
          this.checkWorking(trade),
          this.checkGasPrice(trade.toBlockchain),
          this.checkPoolBalance(trade)
        ]);

        const web3PublicFromBlockchain: Web3Public = this.web3PublicService[trade.fromBlockchain];
        const walletAddress = this.authService.userAddress;

        const slippageTolerance = this.settings.slippageTolerance / 100;
        const tokenInAmountMax = trade.tokenInAmount.multipliedBy(1 + slippageTolerance);
        await web3PublicFromBlockchain.checkBalance(trade.tokenIn, tokenInAmountMax, walletAddress);

        const contractAddress = this.contractAddresses[trade.fromBlockchain];
        const toBlockchainInContract = this.numOfBlockchainsInContract[trade.toBlockchain];

        const blockchainCryptoFee = await web3PublicFromBlockchain.callContractMethod(
          contractAddress,
          this.contractAbi,
          'blockchainCryptoFee',
          {
            methodArguments: [toBlockchainInContract]
          }
        );

        const isFromTokenNative = Web3Public.isNativeAddress(trade.tokenIn.address);
        const methodName = isFromTokenNative
          ? CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_CRYPTO
          : CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_TOKENS;

        const tokenInAmountAbsolute = Web3Public.toWei(tokenInAmountMax, trade.tokenIn.decimals);
        const tokenOutMinAbsolute = Web3Public.toWei(
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
            Web3Public.isNativeAddress(trade.tokenOut.address)
          ]
        ];

        const value = new BigNumber(blockchainCryptoFee)
          .plus(isFromTokenNative ? tokenInAmountAbsolute : 0)
          .toFixed(0);

        let transactionHash: string;
        try {
          await this.web3PrivateService.tryExecuteContractMethod(
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
            err => {
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
}

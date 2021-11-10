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
import { from, Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';
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
import { JoeAvalancheService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/joe-avalanche-service/joe-avalanche.service';
import { GasService } from 'src/app/core/services/gas-service/gas.service';
import { TokenAmount } from '@shared/models/tokens/TokenAmount';
import { SolarBeamMoonRiverService } from '@features/instant-trade/services/instant-trade-service/providers/moonriver/solarbeam-moonriver/solarbeam-moonriver.service';
import { CcrTradeInfo } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/CcrTradeInfo';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';

interface PathAndToAmount {
  path: string[];
  toAmount: BigNumber;
}

interface IndexedPathAndToAmount {
  contractIndex: number;
  pathAndToAmount: PathAndToAmount;
}

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingService {
  private readonly contractAbi: AbiItem[];

  private readonly contractAddresses: Record<SupportedCrossChainSwapBlockchain, string[]>;

  private readonly transitTokens: TransitTokens;

  private uniswapV2Providers: Record<SupportedCrossChainSwapBlockchain, CommonUniswapV2Service[]>;

  private numOfBlockchainsInContract: Record<SupportedCrossChainSwapBlockchain, number[]>;

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
    private readonly joeAvalancheService: JoeAvalancheService,
    private readonly solarBeamMoonRiverService: SolarBeamMoonRiverService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly authService: AuthService,
    private readonly settingsService: SettingsService,
    private readonly web3PublicService: Web3PublicService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly swapFormService: SwapFormService,
    private readonly tokensService: TokensService,
    private readonly crossChainRoutingApiService: CrossChainRoutingApiService,
    private readonly iframeService: IframeService,
    private readonly gasService: GasService
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
      [BLOCKCHAIN_NAME.ETHEREUM]: [this.uniSwapV2Service],
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [this.pancakeSwapService],
      [BLOCKCHAIN_NAME.POLYGON]: [this.quickSwapService],
      [BLOCKCHAIN_NAME.AVALANCHE]: [this.pangolinAvalancheService, this.joeAvalancheService],
      [BLOCKCHAIN_NAME.MOONRIVER]: [this.solarBeamMoonRiverService]
    };
  }

  private setToBlockchainsInContract(): void {
    this.numOfBlockchainsInContract = {
      [BLOCKCHAIN_NAME.ETHEREUM]: [2],
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [1],
      [BLOCKCHAIN_NAME.POLYGON]: [3],
      [BLOCKCHAIN_NAME.AVALANCHE]: [4, 5],
      [BLOCKCHAIN_NAME.MOONRIVER]: [6]
    };
  }

  private async needApprove(
    fromBlockchain: SupportedCrossChainSwapBlockchain,
    contractIndex: number,
    fromToken: BlockchainToken
  ): Promise<boolean> {
    const web3Public: Web3Public = this.web3PublicService[fromBlockchain];
    if (Web3Public.isNativeAddress(fromToken.address)) {
      return false;
    }

    const contractAddress = this.contractAddresses[fromBlockchain][contractIndex];
    return web3Public
      .getAllowance(fromToken.address, this.authService.userAddress, contractAddress)
      .then(allowance => allowance.eq(0));
  }

  public approve(options: TransactionOptions = {}): Observable<TransactionReceipt> {
    const { fromBlockchain, tokenIn: fromToken, fromContractIndex } = this.currentCrossChainTrade;
    const contractAddress = this.contractAddresses[fromBlockchain][fromContractIndex];
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

    const firstTransitToken = this.transitTokens[fromBlockchain];
    const secondTransitToken = this.transitTokens[toBlockchain];

    const {
      contractIndex: fromContractIndex,
      pathAndToAmount: { path: firstPath, toAmount: firstTransitTokenAmount }
    } = await this.getBestContractIndex(fromBlockchain, fromToken, fromAmount, firstTransitToken);

    const { secondTransitTokenAmount, feeInPercents } = await this.getSecondTransitTokenAmount(
      fromBlockchain,
      toBlockchain,
      firstTransitTokenAmount
    );

    const {
      contractIndex: toContractIndex,
      pathAndToAmount: { path: secondPath, toAmount }
    } = await this.getBestContractIndex(
      toBlockchain,
      secondTransitToken,
      secondTransitTokenAmount,
      toToken
    );

    const cryptoFee = Web3Public.fromWei(
      await this.getCryptoFee(fromBlockchain, toBlockchain)
    ).toNumber();

    this.currentCrossChainTrade = {
      fromBlockchain,
      fromContractIndex,
      tokenIn: fromToken,
      tokenInAmount: fromAmount,
      firstTransitTokenAmount,
      firstPath,

      toBlockchain,
      toContractIndex,
      secondTransitTokenAmount,
      tokenOut: toToken,
      tokenOutAmount: toAmount,
      secondPath,

      transitTokenFee: feeInPercents,
      cryptoFee
    };

    const [gasData, minMaxErrors, needApprove] = await Promise.all([
      this.getGasData(this.currentCrossChainTrade),
      this.checkMinMaxErrors(this.currentCrossChainTrade),
      calculateNeedApprove
        ? this.needApprove(fromBlockchain, fromContractIndex, fromToken)
        : undefined
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
   * Gets best contract index in blockchain, based on profit of uniswap provider.
   */
  private async getBestContractIndex(
    blockchain: SupportedCrossChainSwapBlockchain,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<IndexedPathAndToAmount> {
    const promises = this.contractAddresses[blockchain].map(async (_, contractIndex) => ({
      contractIndex,
      pathAndToAmount: await this.getPathAndToAmount(
        blockchain,
        contractIndex,
        fromToken,
        fromAmount,
        toToken
      )
    }));
    return Promise.allSettled(promises).then(results => {
      const sortedResults = results
        .filter(result => result.status === 'fulfilled')
        .map((result: PromiseFulfilledResult<IndexedPathAndToAmount>) => result.value)
        .sort((a, b) => b.pathAndToAmount.toAmount.comparedTo(a.pathAndToAmount.toAmount));

      if (!sortedResults.length) {
        throw (results[0] as PromiseRejectedResult).reason;
      }
      return sortedResults[0];
    });
  }

  /**
   * Calculates uniswap course of {@param fromToken } to {@param toToken} and returns output amount of {@param toToken}.
   * @param blockchain Tokens' blockchain.
   * @param contractIndex Index of contract to use.
   * @param fromToken From token.
   * @param fromAmount Input amount of from token.
   * @param toToken To token.
   */
  private async getPathAndToAmount(
    blockchain: SupportedCrossChainSwapBlockchain,
    contractIndex: number,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<PathAndToAmount> {
    if (!compareAddresses(fromToken.address, toToken.address)) {
      try {
        const instantTrade = await this.uniswapV2Providers[blockchain][
          contractIndex
        ].calculateTrade(fromToken, fromAmount, toToken, false);
        return {
          path: instantTrade.path.map(token => token.address),
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
      path: [fromToken.address],
      toAmount: fromAmount
    };
  }

  /**
   * Compares min and max amounts, permitted in source contract, with current trade's value.
   */
  private async checkMinMaxErrors(trade: CrossChainRoutingTrade): Promise<{
    minAmountError?: BigNumber;
    maxAmountError?: BigNumber;
  }> {
    const { fromBlockchain, toBlockchain, firstTransitTokenAmount } = trade;
    const { minAmount: minTransitTokenAmount, maxAmount: maxTransitTokenAmount } =
      await this.getMinMaxTransitTokenAmounts(fromBlockchain, toBlockchain);

    if (firstTransitTokenAmount.lt(minTransitTokenAmount)) {
      const minAmount = await this.getFromTokenAmount(
        fromBlockchain,
        trade.fromContractIndex,
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

    if (firstTransitTokenAmount.gt(maxTransitTokenAmount)) {
      const maxAmount = await this.getFromTokenAmount(
        fromBlockchain,
        trade.fromContractIndex,
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
   * Gets min and max permitted amounts of transit token in source and targeted blockchain.
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
    const firstTransitToken = this.transitTokens[fromBlockchain];
    const secondTransitToken = this.transitTokens[toBlockchain];
    const transitAmountMargin = 0.2; // 20%

    // min/max amounts are equal in all contracts
    const fromContractAddress = this.contractAddresses[fromBlockchain][0];
    const toContractAddress = this.contractAddresses[toBlockchain][0];

    const getAmount = async (type: 'minAmount' | 'maxAmount'): Promise<BigNumber> => {
      const secondTransitTokenAmountAbsolute = await this.web3PublicService[
        toBlockchain
      ].callContractMethod(
        toContractAddress,
        this.contractAbi,
        type === 'minAmount' ? 'minTokenAmount' : 'maxTokenAmount'
      );
      const secondTransitTokenAmount = Web3Public.fromWei(
        secondTransitTokenAmountAbsolute,
        secondTransitToken.decimals
      );

      // converted from secondTransitTokenAmount
      let convertedFirstTransitTokenAmount = await this.calculateTransitTokensCourse(
        toBlockchain,
        fromBlockchain,
        secondTransitTokenAmount
      );
      if (!convertedFirstTransitTokenAmount.eq(secondTransitTokenAmount)) {
        if (type === 'minAmount') {
          convertedFirstTransitTokenAmount = convertedFirstTransitTokenAmount.multipliedBy(
            1 + transitAmountMargin
          );
        } else {
          convertedFirstTransitTokenAmount = convertedFirstTransitTokenAmount.multipliedBy(
            1 - transitAmountMargin
          );
        }
      }

      // get from contract in source blockchain
      const firstTransitTokenAmountAbsolute = await this.web3PublicService[
        fromBlockchain
      ].callContractMethod(
        fromContractAddress,
        this.contractAbi,
        type === 'minAmount' ? 'minTokenAmount' : 'maxTokenAmount'
      );
      const firstTransitTokenAmount = Web3Public.fromWei(
        firstTransitTokenAmountAbsolute,
        firstTransitToken.decimals
      );

      if (type === 'minAmount') {
        return BigNumber.max(convertedFirstTransitTokenAmount, firstTransitTokenAmount);
      }
      return BigNumber.min(convertedFirstTransitTokenAmount, firstTransitTokenAmount);
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
   * @param contractIndex Index of contract to use.
   * @param fromToken From token.
   * @param transitTokenAmount Output amount of transit token.
   */
  private async getFromTokenAmount(
    blockchain: SupportedCrossChainSwapBlockchain,
    contractIndex: number,
    fromToken: BlockchainToken,
    transitTokenAmount: BigNumber
  ): Promise<BigNumber> {
    const transitToken = this.transitTokens[blockchain];
    if (compareAddresses(fromToken.address, transitToken.address)) {
      return transitTokenAmount;
    }

    if (!CrossChainRoutingService.isSupportedBlockchain(fromToken.blockchain)) {
      throw Error('Not supported blockchain');
    }

    const amountAbsolute = transitTokenAmount.gt(0)
      ? await this.uniswapV2Providers[fromToken.blockchain][contractIndex].getFromAmount(
          fromToken,
          transitToken,
          transitTokenAmount
        )
      : 0;
    return Web3Public.fromWei(amountAbsolute, fromToken.decimals);
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
  ): Promise<{ secondTransitTokenAmount: BigNumber; feeInPercents: number }> {
    const amount = await this.calculateTransitTokensCourse(
      fromBlockchain,
      toBlockchain,
      firstTransitTokenAmount
    );
    const feeInPercents = await this.getFeeInPercents(toBlockchain);
    return {
      secondTransitTokenAmount: amount.multipliedBy(100 - feeInPercents).dividedBy(100),
      feeInPercents
    };
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
    const nonRbcTransitBlockchains = [BLOCKCHAIN_NAME.AVALANCHE, BLOCKCHAIN_NAME.MOONRIVER];
    if (
      nonRbcTransitBlockchains.includes(fromTransitTokenBlockchain) ||
      nonRbcTransitBlockchains.includes(toTransitTokenBlockchain)
    ) {
      const firstTransitTokenPrice = await this.tokensService.getAndUpdateTokenPrice(
        {
          address: this.transitTokens[fromTransitTokenBlockchain].address,
          blockchain: fromTransitTokenBlockchain
        },
        true
      );
      const secondTransitTokenPrice = await this.tokensService.getAndUpdateTokenPrice(
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
   * Gets fee amount of transit token in percents in targeted blockchain.
   * @param toBlockchain Targeted blockchain.
   */
  private async getFeeInPercents(toBlockchain: SupportedCrossChainSwapBlockchain): Promise<number> {
    // fee is equal in all contracts
    const contractAddress = this.contractAddresses[toBlockchain][0];
    const numOfBlockchainInContract = this.numOfBlockchainsInContract[toBlockchain][0];

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

  /**
   * Gets fee amount in crypto in source blockchain.
   * @param fromBlockchain Source blockchain.
   * @param toBlockchain Targeted blockchain.
   * @returns Promise<number> Crypto fee in Wei.
   */
  private async getCryptoFee(
    fromBlockchain: SupportedCrossChainSwapBlockchain,
    toBlockchain: SupportedCrossChainSwapBlockchain
  ): Promise<number> {
    // crypto fee is equal in all contracts
    const toBlockchainInContract = this.numOfBlockchainsInContract[toBlockchain][0];
    const contractAddress = this.contractAddresses[fromBlockchain][0];

    const web3Public: Web3Public = this.web3PublicService[fromBlockchain];

    return web3Public.callContractMethod(contractAddress, this.contractAbi, 'blockchainCryptoFee', {
      methodArguments: [toBlockchainInContract]
    });
  }

  /**
   * Calculates gas limit and gas price in source network, if possible to calculate.
   */
  private async getGasData(trade: CrossChainRoutingTrade): Promise<{
    gasLimit: BigNumber;
    gasPrice: string;
  }> {
    const { fromBlockchain } = trade;
    const walletAddress = this.authService.userAddress;
    if (fromBlockchain !== BLOCKCHAIN_NAME.ETHEREUM || !walletAddress) {
      return null;
    }

    try {
      const { contractAddress, methodName, methodArguments, value } = await this.getContractData(
        trade,
        walletAddress
      );

      const web3Public = this.web3PublicService[fromBlockchain];
      const gasLimit = await web3Public.getEstimatedGas(
        this.contractAbi,
        contractAddress,
        methodName,
        methodArguments,
        walletAddress,
        value
      );
      const gasPrice = Web3Public.toWei(
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
  public async getTradeInfo(): Promise<CcrTradeInfo> {
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
      firstTransitTokenAmount,
      secondTransitTokenAmount
    } = trade;
    const firstTransitToken = this.transitTokens[fromBlockchain];
    const secondTransitToken = this.transitTokens[toBlockchain];

    const feePercent = trade.transitTokenFee;
    const fee = feePercent / 100;
    const feeAmount = trade.secondTransitTokenAmount.multipliedBy(fee).dividedBy(1 - fee);

    const estimatedGas = trade.gasLimit?.multipliedBy(Web3Public.fromWei(trade.gasPrice));

    const calculatePriceImpact = async (
      token: TokenAmount,
      transitToken: InstantTradeToken,
      tokenAmount: BigNumber,
      transitTokenAmount: BigNumber,
      type: 'from' | 'to'
    ) => {
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
    };

    const [priceImpactFrom, priceImpactTo] = await Promise.all([
      calculatePriceImpact(
        tokenIn,
        firstTransitToken,
        tokenInAmount,
        firstTransitTokenAmount,
        'from'
      ),
      calculatePriceImpact(
        tokenOut,
        secondTransitToken,
        tokenOutAmount,
        secondTransitTokenAmount,
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
   * Checks that contracts are alive.
   */
  private async checkWorking(trade: CrossChainRoutingTrade): Promise<void> {
    const { fromBlockchain, toBlockchain, fromContractIndex, toContractIndex } = trade;

    const fromContractAddress = this.contractAddresses[fromBlockchain][fromContractIndex];
    const toContractAddress = this.contractAddresses[toBlockchain][toContractIndex];
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
   */
  private async checkGasPrice(trade: CrossChainRoutingTrade): Promise<void | never> {
    const { toBlockchain, toContractIndex } = trade;

    if (toBlockchain !== BLOCKCHAIN_NAME.ETHEREUM) {
      return;
    }

    const contractAddress = this.contractAddresses[toBlockchain][toContractIndex];
    const web3Public: Web3Public = this.web3PublicService[toBlockchain];

    const maxGasPrice = await web3Public.callContractMethod(
      contractAddress,
      this.contractAbi,
      'maxGasPrice'
    );
    const currentGasPrice = Web3Public.toWei(
      await this.gasService.getGasPriceInEthUnits(toBlockchain)
    );
    if (new BigNumber(maxGasPrice).lt(currentGasPrice)) {
      throw new MaxGasPriceOverflowWarning(toBlockchain);
    }
  }

  /**
   * Checks that in targeted blockchain tokens' pool's balance is enough.
   */
  private async checkPoolBalance(trade: CrossChainRoutingTrade): Promise<void | never> {
    const { toBlockchain, toContractIndex } = trade;

    const contractAddress = this.contractAddresses[toBlockchain][toContractIndex];
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

  /**
   * Checks contracts' state and user's balance.
   * @param trade Cross chain trade.
   */
  private async checkTradeWorking(trade: CrossChainRoutingTrade): Promise<void | never> {
    await Promise.all([
      this.checkWorking(trade),
      this.checkGasPrice(trade),
      this.checkPoolBalance(trade)
    ]);

    const slippageTolerance = this.settings.slippageTolerance / 100;
    const tokenInAmountMax = trade.tokenInAmount.multipliedBy(1 + slippageTolerance);
    const web3PublicFromBlockchain: Web3Public = this.web3PublicService[trade.fromBlockchain];
    await web3PublicFromBlockchain.checkBalance(
      trade.tokenIn,
      tokenInAmountMax,
      this.authService.userAddress
    );
  }

  /**
   * Returns contract's method's data to execute trade.
   * @param trade Cross chain trade.
   * @param walletAddress Wallet address.
   */
  public async getContractData(
    trade: CrossChainRoutingTrade,
    walletAddress: string
  ): Promise<{
    contractAddress: string;
    methodName: string;
    methodArguments: unknown[];
    value: string;
  }> {
    const contractAddress = this.contractAddresses[trade.fromBlockchain][trade.fromContractIndex];

    const isFromTokenNative = Web3Public.isNativeAddress(trade.tokenIn.address);
    const methodName = isFromTokenNative
      ? CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_CRYPTO
      : CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_TOKENS;

    const toBlockchainInContract =
      this.numOfBlockchainsInContract[trade.toBlockchain][trade.toContractIndex];

    const slippageTolerance = this.settings.slippageTolerance / 100;
    const tokenInAmountMax = trade.tokenInAmount.multipliedBy(1 + slippageTolerance);
    const tokenInAmountAbsolute = Web3Public.toWei(tokenInAmountMax, trade.tokenIn.decimals);
    const tokenOutMinAbsolute = Web3Public.toWei(
      trade.tokenOutAmount.multipliedBy(1 - slippageTolerance),
      trade.tokenOut.decimals
    );

    const firstTransitTokenAmountAbsolute = Web3Public.toWei(
      trade.firstTransitTokenAmount,
      this.transitTokens[trade.fromBlockchain].decimals
    );

    const methodArguments = [
      [
        toBlockchainInContract,
        tokenInAmountAbsolute,
        trade.firstPath,
        trade.secondPath,
        firstTransitTokenAmountAbsolute,
        tokenOutMinAbsolute,
        walletAddress,
        Web3Public.isNativeAddress(trade.tokenOut.address)
      ]
    ];

    const blockchainCryptoFee = Web3Public.toWei(trade.cryptoFee);
    const value = new BigNumber(blockchainCryptoFee)
      .plus(isFromTokenNative ? tokenInAmountAbsolute : 0)
      .toFixed(0);

    return {
      contractAddress,
      methodName,
      methodArguments,
      value
    };
  }

  public createTrade(options: TransactionOptions = {}): Observable<void> {
    return from(
      (async () => {
        const trade = this.currentCrossChainTrade;
        await this.checkTradeWorking(trade);

        const { contractAddress, methodName, methodArguments, value } = await this.getContractData(
          trade,
          this.authService.userAddress
        );

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
                'insufficient funds for gas * price+ value',
                'insufficient funds for gas * price + value'
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
              this.currentCrossChainTrade.tokenIn.symbol
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
    if (this.settings.promoCode?.status === 'accepted') {
      await this.crossChainRoutingApiService.postTrade(
        transactionHash,
        this.currentCrossChainTrade.fromBlockchain,
        this.settings.promoCode.text
      );
      return;
    }
    if (this.iframeService.isIframe) {
      await this.crossChainRoutingApiService.postTrade(
        transactionHash,
        this.currentCrossChainTrade.fromBlockchain
      );
    }
  }
}

import { inject, Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import InstantTradeToken from '@features/swaps/features/instant-trade/models/instant-trade-token';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { ItOptions } from '@features/swaps/core/instant-trade/models/it-provider';
import { DEFAULT_ESTIMATED_GAS } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/constants/default-estimated-gas';
import { GetTradeData } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/get-trade-data';
import { GasCalculationMethod } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/gas-calculation-method';
import { UniswapV2Route } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/uniswap-v2-route';
import { UniswapV2Trade } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/uniswap-v2-trade';
import { DEFAULT_SWAP_METHOD } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/swap-method';
import {
  UniswapV2CalculatedInfo,
  UniswapV2CalculatedInfoWithProfit
} from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/uniswap-v2-calculated-info';
import { TransactionReceipt } from 'web3-eth';
import { UniswapV2Constants } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/uniswap-v2-constants';
import { compareAddresses, subtractPercent } from '@shared/utils/utils';
import { SymbolToken } from '@shared/models/tokens/symbol-token';
import InstantTrade from '@features/swaps/features/instant-trade/models/instant-trade';
import { Multicall } from '@core/services/blockchain/models/multicall';
import { GetTradeSupportingFeeData } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/get-trade-supporting-fee-data';
import { TradeContractData } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/trade-contract-data';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { TokenWithFeeError } from '@core/errors/models/common/token-with-fee-error';
import InsufficientLiquidityError from '@core/errors/models/instant-trade/insufficient-liquidity-error';
import InsufficientLiquidityRubicOptimisation from '@core/errors/models/instant-trade/insufficient-liquidity-rubic-optimisation-error';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import DEFAULT_UNISWAP_V2_ABI from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/constants/default-uniswap-v2-abi';
import { EthLikeWeb3Pure } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-pure/eth-like-web3-pure';
import { RequiredField } from '@shared/models/utility-types/required-field';
import {
  IT_PROXY_FEE_CONTRACT_ABI,
  IT_PROXY_FEE_CONTRACT_ADDRESS,
  IT_PROXY_FEE_CONTRACT_METHOD
} from '@features/swaps/core/instant-trade/constants/iframe-proxy-fee-contract';
import { IframeService } from '@core/services/iframe/iframe.service';
import { EthLikeInstantTradeProviderService } from '@features/swaps/core/instant-trade/providers/common/eth-like-instant-trade-provider/eth-like-instant-trade-provider.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

interface RecGraphVisitorOptions {
  toToken: InstantTradeToken;
  amountAbsolute: string;
  vertexes: SymbolToken[];
  path: SymbolToken[];
  mxTransitTokens: number;
  routesPaths: SymbolToken[][];
  routesMethodArguments: [string, string[]][];
}

@Injectable()
export abstract class CommonUniswapV2Service extends EthLikeInstantTradeProviderService {
  public abstract readonly providerType: INSTANT_TRADE_PROVIDER;

  public readonly contractAddress: string;

  protected readonly contractAbi = DEFAULT_UNISWAP_V2_ABI;

  protected readonly swapsMethod = DEFAULT_SWAP_METHOD;

  private readonly defaultEstimateGas = DEFAULT_ESTIMATED_GAS;

  protected readonly gasMargin = 1.2; // 120%

  private readonly wethAddress: string;

  private readonly routingProviders: SymbolToken[];

  private readonly maxTransitTokens: number;

  // Injected services start
  private readonly iframeService = inject(IframeService);
  // Injected services end

  private get deadline(): number {
    return Math.floor(Date.now() / 1000) + 60 * this.settings.deadline;
  }

  private get slippageTolerance(): number {
    return this.settings.slippageTolerance / 100;
  }

  protected constructor(uniswapConstants: UniswapV2Constants) {
    super(uniswapConstants.blockchain);

    this.contractAddress = uniswapConstants.contractAddress;
    this.maxTransitTokens = uniswapConstants.maxTransitTokens;
    this.wethAddress = uniswapConstants.wethAddress;
    this.routingProviders = uniswapConstants.routingProviders;
  }

  /**
   * Makes multi call of contract's methods.
   * @param routesMethodArguments Arguments for calling uni-swap contract method.
   * @param methodName Method of contract.
   * @return Promise<Multicall[]>
   */
  protected getRoutes(routesMethodArguments: unknown[], methodName: string): Promise<Multicall[]> {
    return this.web3Public.multicallContractMethods<{ amounts: string[] }>(
      this.contractAddress,
      this.contractAbi,
      routesMethodArguments.map((methodArguments: string[]) => ({
        methodName,
        methodArguments
      }))
    );
  }

  private calculateTokensToTokensGasLimit: GasCalculationMethod = (
    amountIn: string,
    amountOutMin: string,
    path: string[],
    deadline: number
  ) => {
    return {
      callData: {
        contractMethod: this.swapsMethod.TOKENS_TO_TOKENS,
        params: [amountIn, amountOutMin, path, this.walletAddress, deadline]
      },
      defaultGasLimit: this.defaultEstimateGas.tokensToTokens[path.length - 2]
    };
  };

  private calculateEthToTokensGasLimit: GasCalculationMethod = (
    amountIn: string,
    amountOutMin: string,
    path: string[],
    deadline: number
  ) => {
    return {
      callData: {
        contractMethod: this.swapsMethod.ETH_TO_TOKENS,
        params: [amountOutMin, path, this.walletAddress, deadline],
        value: amountIn
      },
      defaultGasLimit: this.defaultEstimateGas.ethToTokens[path.length - 2]
    };
  };

  private calculateTokensToEthGasLimit: GasCalculationMethod = (
    amountIn: string,
    amountOutMin: string,
    path: string[],
    deadline: number
  ) => {
    return {
      callData: {
        contractMethod: this.swapsMethod.TOKENS_TO_ETH,
        params: [amountIn, amountOutMin, path, this.walletAddress, deadline]
      },
      defaultGasLimit: this.defaultEstimateGas.tokensToEth[path.length - 2]
    };
  };

  private getEthToTokensTradeData: GetTradeData = (
    trade: UniswapV2Trade,
    options: ItOptions,
    gasLimit: string,
    gasPrice?: string
  ) => {
    return {
      contractAddress: this.contractAddress,
      contractAbi: this.contractAbi,
      methodName: this.swapsMethod.ETH_TO_TOKENS,
      methodArguments: [trade.amountOutMin, trade.path, trade.to, trade.deadline],
      options: {
        onTransactionHash: options.onConfirm,
        value: trade.amountIn,
        gas: gasLimit,
        gasPrice
      }
    };
  };

  private getTokensToEthTradeData: GetTradeData = (
    trade: UniswapV2Trade,
    options: ItOptions,
    gasLimit: string,
    gasPrice?: string
  ) => {
    return {
      contractAddress: this.contractAddress,
      contractAbi: this.contractAbi,
      methodName: this.swapsMethod.TOKENS_TO_ETH,
      methodArguments: [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      options: {
        onTransactionHash: options.onConfirm,
        gas: gasLimit,
        gasPrice
      }
    };
  };

  private getTokensToTokensTradeData: GetTradeData = (
    trade: UniswapV2Trade,
    options: ItOptions,
    gasLimit: string,
    gasPrice?: string
  ) => {
    return {
      contractAddress: this.contractAddress,
      contractAbi: this.contractAbi,
      methodName: this.swapsMethod.TOKENS_TO_TOKENS,
      methodArguments: [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      options: {
        onTransactionHash: options.onConfirm,
        gas: gasLimit,
        gasPrice
      }
    };
  };

  private getEthToTokensTradeSupportingFeeData: GetTradeSupportingFeeData = (
    trade: UniswapV2Trade
  ) => {
    return {
      contractAddress: this.contractAddress,
      contractAbi: this.contractAbi,
      methodName: this.swapsMethod.ETH_TO_TOKENS_SUPPORTING_FEE,
      methodArguments: [trade.amountOutMin, trade.path, trade.to, trade.deadline],
      options: {
        value: trade.amountIn
      }
    };
  };

  private getTokensToEthTradeSupportingFeeData: GetTradeSupportingFeeData = (
    trade: UniswapV2Trade
  ) => {
    return {
      contractAddress: this.contractAddress,
      contractAbi: this.contractAbi,
      methodName: this.swapsMethod.TOKENS_TO_ETH_SUPPORTING_FEE,
      methodArguments: [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline]
    };
  };

  private getTokensToTokensTradeSupportingFeeData: GetTradeSupportingFeeData = (
    trade: UniswapV2Trade
  ) => {
    return {
      contractAddress: this.contractAddress,
      contractAbi: this.contractAbi,
      methodName: this.swapsMethod.TOKENS_TO_TOKENS_SUPPORTING_FEE,
      methodArguments: [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline]
    };
  };

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean
  ): Promise<InstantTrade> {
    const fromTokenClone = { ...fromToken };
    const toTokenClone = { ...toToken };
    let estimatedGasPredictionMethod = this.calculateTokensToTokensGasLimit;

    if (this.web3Public.isNativeAddress(fromTokenClone.address)) {
      fromTokenClone.address = this.wethAddress;
      estimatedGasPredictionMethod = this.calculateEthToTokensGasLimit;
    }
    if (this.web3Public.isNativeAddress(toTokenClone.address)) {
      toTokenClone.address = this.wethAddress;
      estimatedGasPredictionMethod = this.calculateTokensToEthGasLimit;
    }

    const fromAmountAbsolute = Web3Pure.toWei(fromAmount, fromToken.decimals);

    let gasPriceInEth: BigNumber;
    let gasPriceInUsd: BigNumber;
    if (shouldCalculateGas) {
      gasPriceInEth = await this.gasService.getGasPriceInEthUnits(this.blockchain);
      const nativeCoinPrice = await this.tokensService.getNativeCoinPriceInUsd(this.blockchain);
      gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
    }

    const { route, estimatedGas } = await this.getToAmountAndPath(
      fromTokenClone,
      fromAmountAbsolute,
      toTokenClone,
      shouldCalculateGas,
      estimatedGasPredictionMethod,
      gasPriceInUsd
    );

    const instantTrade: InstantTrade = {
      blockchain: this.blockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: Web3Pure.fromWei(route.outputAbsoluteAmount, toToken.decimals)
      },
      path: route.path
    };

    if (!shouldCalculateGas) {
      return instantTrade;
    }

    const increasedGas = Web3Pure.calculateGasMargin(estimatedGas, this.gasMargin);
    const gasFeeInEth = gasPriceInEth.multipliedBy(increasedGas);
    const gasFeeInUsd = gasPriceInUsd.multipliedBy(increasedGas);

    return {
      ...instantTrade,
      gasLimit: increasedGas,
      gasPrice: Web3Pure.toWei(gasPriceInEth),
      gasFeeInUsd,
      gasFeeInEth
    };
  }

  private async getToAmountAndPath(
    fromToken: InstantTradeToken,
    fromAmountAbsolute: string,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean,
    gasCalculationMethodName: GasCalculationMethod,
    gasPriceInUsd?: BigNumber
  ): Promise<UniswapV2CalculatedInfo> {
    const routes = (await this.getAllRoutes(fromToken, toToken, fromAmountAbsolute)).sort((a, b) =>
      b.outputAbsoluteAmount.comparedTo(a.outputAbsoluteAmount)
    );
    if (routes.length === 0) {
      throw new InsufficientLiquidityError();
    }

    if (!shouldCalculateGas) {
      return {
        route: routes[0]
      };
    }

    if (this.settings.rubicOptimisation && toToken.price) {
      const gasRequests = routes.map(route =>
        gasCalculationMethodName(
          fromAmountAbsolute,
          subtractPercent(route.outputAbsoluteAmount, this.slippageTolerance).toFixed(0),
          route.path.map(token => token.address),
          this.deadline
        )
      );
      const gasLimits = gasRequests.map(item => item.defaultGasLimit);

      if (this.walletAddress) {
        const estimatedGasLimits = await this.web3Public.batchEstimatedGas(
          this.contractAbi,
          this.contractAddress,
          this.walletAddress,
          gasRequests.map(item => item.callData)
        );
        estimatedGasLimits.forEach((gas, index) => {
          if (gas?.isFinite()) {
            gasLimits[index] = gas;
          }
        });
      }

      const routesWithProfit: UniswapV2CalculatedInfoWithProfit[] = routes.map((route, index) => {
        const estimatedGas = gasLimits[index];
        const gasFeeInUsd = estimatedGas.multipliedBy(gasPriceInUsd);
        const profit = Web3Pure.fromWei(route.outputAbsoluteAmount, toToken.decimals)
          .multipliedBy(toToken.price)
          .minus(gasFeeInUsd);

        return {
          route,
          estimatedGas,
          profit
        };
      });

      const sortedRoutes = routesWithProfit
        .filter(info => info.route.outputAbsoluteAmount.gt(0))
        .sort((a, b) => b.profit.comparedTo(a.profit));

      if (!sortedRoutes.length) {
        throw new InsufficientLiquidityRubicOptimisation();
      }

      return sortedRoutes[0];
    }

    const route = routes[0];
    const estimateGasParams = gasCalculationMethodName(
      fromAmountAbsolute,
      subtractPercent(route.outputAbsoluteAmount, this.slippageTolerance).toFixed(0),
      route.path.map(token => token.address),
      this.deadline
    );
    const estimatedGas = await this.web3Public
      .getEstimatedGas(
        this.contractAbi,
        this.contractAddress,
        estimateGasParams.callData.contractMethod,
        estimateGasParams.callData.params,
        this.walletAddress,
        estimateGasParams.callData.value
      )
      .catch(() => estimateGasParams.defaultGasLimit);
    return {
      route,
      estimatedGas
    };
  }

  private async getAllRoutes(
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    amountAbsolute: string
  ): Promise<UniswapV2Route[]> {
    const vertexes: SymbolToken[] = this.routingProviders.filter(
      routerAddress =>
        !compareAddresses(routerAddress.address, toToken.address) &&
        !compareAddresses(routerAddress.address, fromToken.address)
    );
    const initialPath: SymbolToken[] = [
      {
        address: fromToken.address,
        symbol: fromToken.symbol
      }
    ];
    const routesPaths: SymbolToken[][] = [];
    const routesMethodArguments: [string, string[]][] = [];

    const maxTransitTokens = this.settings.disableMultihops ? 0 : this.maxTransitTokens;
    for (let i = 0; i <= maxTransitTokens; i++) {
      this.recGraphVisitor({
        toToken,
        amountAbsolute,
        vertexes,
        path: initialPath,
        mxTransitTokens: i,
        routesPaths,
        routesMethodArguments
      });
    }

    const routes: UniswapV2Route[] = [];
    try {
      const responses = await this.getRoutes(routesMethodArguments, 'getAmountsOut');
      responses.forEach((response, index) => {
        if (!response.success) {
          return;
        }
        const { amounts } = response.output;
        const amount = new BigNumber(amounts[amounts.length - 1]);
        const path = routesPaths[index];
        routes.push({
          outputAbsoluteAmount: amount,
          path
        });
      });
    } catch (err) {
      console.debug(err);
    }

    return routes;
  }

  private recGraphVisitor(options: RecGraphVisitorOptions): void {
    const {
      toToken,
      amountAbsolute,
      vertexes,
      path,
      mxTransitTokens,
      routesPaths,
      routesMethodArguments
    } = options;

    if (path.length === mxTransitTokens + 1) {
      const finalPath = path.concat({
        address: toToken.address,
        symbol: toToken.symbol
      });
      routesPaths.push(finalPath);
      routesMethodArguments.push([amountAbsolute, finalPath.map(token => token.address)]);
      return;
    }

    vertexes
      .filter(vertex => !path.includes(vertex))
      .forEach(vertex => {
        const extendedPath = path.concat(vertex);
        this.recGraphVisitor({
          ...options,
          path: extendedPath
        });
      });
  }

  public async createTrade(trade: InstantTrade, options: ItOptions): Promise<TransactionReceipt> {
    const skipChecks = trade.blockchain === BLOCKCHAIN_NAME.TELOS;
    const {
      methodName,
      methodArguments,
      transactionOptions: transactionOptions
    } = await this.checkAndGetTradeData(trade, options, skipChecks);
    return this.web3PrivateService.tryExecuteContractMethod(
      this.contractAddress,
      this.contractAbi,
      methodName,
      methodArguments,
      transactionOptions,
      null,
      skipChecks
    );
  }

  public async checkAndEncodeTrade(
    trade: InstantTrade,
    options: ItOptions,
    receiverAddress: string
  ): Promise<RequiredField<TransactionOptions, 'data'>> {
    const { methodName, methodArguments, transactionOptions } = await this.checkAndGetTradeData(
      trade,
      options,
      false,
      receiverAddress
    );

    return {
      ...transactionOptions,
      data: EthLikeWeb3Pure.encodeFunctionCall(this.contractAbi, methodName, methodArguments)
    };
  }

  private async checkAndGetTradeData(
    trade: InstantTrade,
    options: ItOptions,
    skipChecks = false,
    receiverAddress = this.walletAddress
  ): Promise<{
    methodName: string;
    methodArguments: unknown[];
    transactionOptions?: TransactionOptions;
  }> {
    this.walletConnectorService.checkSettings(trade.blockchain);
    await this.web3Public.checkBalance(trade.from.token, trade.from.amount, this.walletAddress);

    const uniswapV2Trade: UniswapV2Trade = {
      tokenIn: trade.from.token.address,
      tokenOut: trade.to.token.address,
      amountIn: Web3Pure.toWei(trade.from.amount, trade.from.token.decimals),
      amountOutMin: Web3Pure.toWei(
        subtractPercent(trade.to.amount, this.slippageTolerance),
        trade.to.token.decimals
      ),
      path: trade.path.map(token => token.address),
      to: receiverAddress,
      deadline: this.deadline
    };

    let getTradeDataMethod = this.getTokensToTokensTradeData;
    let getTradeSupportingFeeDataMethod = this.getTokensToTokensTradeSupportingFeeData;
    if (this.web3Public.isNativeAddress(trade.from.token.address)) {
      getTradeDataMethod = this.getEthToTokensTradeData;
      getTradeSupportingFeeDataMethod = this.getEthToTokensTradeSupportingFeeData;
    }
    if (this.web3Public.isNativeAddress(trade.to.token.address)) {
      getTradeDataMethod = this.getTokensToEthTradeData;
      getTradeSupportingFeeDataMethod = this.getTokensToEthTradeSupportingFeeData;
    }

    const tradeData = getTradeDataMethod(uniswapV2Trade, options, trade.gasLimit, trade.gasPrice);
    const tradeDataSupportingFee = getTradeSupportingFeeDataMethod(uniswapV2Trade);

    const methodName = skipChecks
      ? tradeData.methodName
      : await this.tryExecuteTradeAndGetMethodName(
          tradeData,
          tradeDataSupportingFee,
          uniswapV2Trade,
          receiverAddress
        );

    return {
      methodName,
      methodArguments: tradeData.methodArguments,
      transactionOptions: tradeData.options
    };
  }

  /**
   * Makes test calls on uniswap contract and returns one of swap functions for tokens with or without fee.
   * @param tradeData Trade data for tokens without fee.
   * @param tradeDataSupportingFee Trade data for tokens with fee.
   * @param uniswapV2Trade Uniswap v2 trade data.
   * @param receiverAddress Address to receive tokens.
   */
  private async tryExecuteTradeAndGetMethodName(
    tradeData: TradeContractData,
    tradeDataSupportingFee: TradeContractData,
    uniswapV2Trade: UniswapV2Trade,
    receiverAddress: string
  ): Promise<string | never> {
    const [isTradeSuccessful, isTradeSupportingFeeSuccessful] = await Promise.all([
      this.tryExecute(tradeData, receiverAddress, uniswapV2Trade),
      this.tryExecute(tradeDataSupportingFee, receiverAddress, uniswapV2Trade)
    ]);

    if (isTradeSuccessful) {
      return tradeData.methodName;
    }
    if (isTradeSupportingFeeSuccessful) {
      return tradeDataSupportingFee.methodName;
    }
    throw new TokenWithFeeError();
  }

  private async tryExecute(
    methodData: {
      methodName: string;
      methodArguments: unknown[];
      options?: TransactionOptions;
    },
    receiverAddress: string,
    trade: UniswapV2Trade
  ): Promise<boolean> {
    try {
      if (receiverAddress === this.walletAddress) {
        await this.web3Public.tryExecuteContractMethod(
          this.contractAddress,
          this.contractAbi,
          methodData.methodName,
          methodData.methodArguments,
          receiverAddress,
          methodData.options
        );
      } else {
        const encodedData = EthLikeWeb3Pure.encodeFunctionCall(
          this.contractAbi,
          methodData.methodName,
          methodData.methodArguments
        );
        const { feeData } = this.iframeService;
        const fee = feeData.fee * 1000;
        const methodArguments = [
          trade.tokenIn,
          trade.tokenOut,
          trade.amountIn,
          this.contractAddress,
          encodedData,
          [fee, feeData.feeTarget]
        ];

        await this.web3Public.tryExecuteContractMethod(
          IT_PROXY_FEE_CONTRACT_ADDRESS,
          IT_PROXY_FEE_CONTRACT_ABI,
          IT_PROXY_FEE_CONTRACT_METHOD.SWAP,
          methodArguments,
          this.walletAddress,
          methodData.options
        );
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

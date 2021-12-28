import { inject, Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { EthLikeWeb3Public } from 'src/app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { from, Observable, of } from 'rxjs';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { startWith } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import {
  ItOptions,
  ItProvider
} from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import {
  DefaultEstimatedGas,
  DEFAULT_ESTIMATED_GAS
} from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/constants/default-estimated-gas';
import { GetTradeData } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/GetTradeData';
import { GasCalculationMethod } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/GasCalculationMethod';
import { UniswapV2Route } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/UniswapV2Route';
import { UniswapV2Trade } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/UniswapV2Trade';
import {
  DEFAULT_SWAP_METHODS,
  ISwapMethods
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/SWAP_METHOD';
import {
  UniswapV2CalculatedInfo,
  UniswapV2CalculatedInfoWithProfit
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/UniswapV2CalculatedInfo';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { TransactionReceipt } from 'web3-eth';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { UniswapV2Constants } from '@features/instant-trade/services/instant-trade-service/models/uniswap-v2/uniswap-v2-constants';
import { AbiItem } from 'web3-utils';
import { GasService } from 'src/app/core/services/gas-service/gas.service';
import { compareAddresses, subtractPercent } from 'src/app/shared/utils/utils';
import { SymbolToken } from '@shared/models/tokens/symbol-token';
import InstantTrade from '@features/instant-trade/models/Instant-trade';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { Multicall } from 'src/app/core/services/blockchain/models/multicall';
import DefaultUniswapV2Abi from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/constants/default-uniswap-v2-abi';
import { GetTradeSupportingFeeData } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/GetTradeSupportingFeeData';
import { TradeContractData } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/TradeContractData';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { TokenWithFeeError } from '@core/errors/models/common/token-with-fee-error';
import InsufficientLiquidityError from '@core/errors/models/instant-trade/insufficient-liquidity-error';
import InsufficientLiquidityRubicOptimisation from '@core/errors/models/instant-trade/insufficient-liquidity-rubic-optimisation-error';

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
export abstract class CommonUniswapV2Service implements ItProvider {
  protected contractAbi: AbiItem[];

  protected swapsMethod: ISwapMethods;

  private readonly defaultEstimateGas: DefaultEstimatedGas;

  private readonly gasMargin: number;

  private walletAddress: string;

  private settings: ItSettingsForm;

  protected blockchainAdapter: EthLikeWeb3Public;

  // Uniswap constants
  private blockchain: BLOCKCHAIN_NAME;

  private wethAddress: string;

  protected contractAddress: string;

  private routingProviders: SymbolToken[];

  private maxTransitTokens: number;

  // Injected services
  private readonly publicBlockchainAdapterService = inject(PublicBlockchainAdapterService);

  private readonly web3PrivateService = inject(EthLikeWeb3PrivateService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly authService = inject(AuthService);

  private readonly settingsService = inject(SettingsService);

  private readonly tokensService = inject(TokensService);

  private readonly useTestingModeService = inject(UseTestingModeService);

  private readonly gasService = inject(GasService);

  protected constructor(uniswapConstants: UniswapV2Constants) {
    this.contractAbi = DefaultUniswapV2Abi;
    this.swapsMethod = DEFAULT_SWAP_METHODS;
    this.defaultEstimateGas = DEFAULT_ESTIMATED_GAS;
    this.gasMargin = 1.2; // 120%

    this.setUniswapConstants(uniswapConstants);

    this.authService.getCurrentUser().subscribe(user => {
      this.walletAddress = user?.address;
    });

    this.settingsService.instantTradeValueChanges
      .pipe(startWith(this.settingsService.instantTradeValue))
      .subscribe(settingsForm => {
        this.settings = {
          ...settingsForm,
          slippageTolerance: settingsForm.slippageTolerance / 100
        };
      });
  }

  private setUniswapConstants(uniswapConstants: UniswapV2Constants): void {
    this.blockchain = uniswapConstants.blockchain;

    BlockchainsInfo.checkIsEthLike(this.blockchain);
    this.blockchainAdapter = this.publicBlockchainAdapterService[
      this.blockchain
    ] as EthLikeWeb3Public;

    this.maxTransitTokens = uniswapConstants.maxTransitTokens;
    this.contractAddress = uniswapConstants.contractAddressNetMode.mainnet;
    this.wethAddress = uniswapConstants.wethAddressNetMode.mainnet;
    this.routingProviders = uniswapConstants.routingProvidersNetMode.mainnet;

    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.blockchainAdapter = this.publicBlockchainAdapterService[
          this.blockchain
        ] as EthLikeWeb3Public;

        this.contractAddress = uniswapConstants.contractAddressNetMode.testnet;
        this.wethAddress = uniswapConstants.wethAddressNetMode.testnet;
        this.routingProviders = uniswapConstants.routingProvidersNetMode.testnet;
      }
    });
  }

  /**
   * Makes multi call of contract's methods.
   * @param routesMethodArguments Arguments for calling uni-swap contract method.
   * @param methodName Method of contract.
   * @return Promise<Multicall[]>
   */
  protected getRoutes(routesMethodArguments: unknown[], methodName: string): Promise<Multicall[]> {
    return this.blockchainAdapter.multicallContractMethods<{ amounts: string[] }>(
      this.contractAddress,
      this.contractAbi,
      routesMethodArguments.map((methodArguments: string[]) => ({
        methodName,
        methodArguments
      }))
    );
  }

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    if (this.blockchainAdapter.isNativeAddress(tokenAddress)) {
      return of(new BigNumber(Infinity));
    }
    return from(
      this.blockchainAdapter.getAllowance({
        tokenAddress,
        ownerAddress: this.walletAddress,
        spenderAddress: this.contractAddress
      })
    );
  }

  public async approve(tokenAddress: string, options: TransactionOptions): Promise<void> {
    this.walletConnectorService.checkSettings(this.blockchain);
    await this.web3PrivateService.approveTokens(
      tokenAddress,
      this.contractAddress,
      'infinity',
      options
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

    if (this.blockchainAdapter.isNativeAddress(fromTokenClone.address)) {
      fromTokenClone.address = this.wethAddress;
      estimatedGasPredictionMethod = this.calculateEthToTokensGasLimit;
    }
    if (this.blockchainAdapter.isNativeAddress(toTokenClone.address)) {
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
    const routes = (
      await this.getAllRoutes(fromToken, toToken, fromAmountAbsolute, 'getAmountsOut')
    ).sort((a, b) => (b.outputAbsoluteAmount.gt(a.outputAbsoluteAmount) ? 1 : -1));
    if (routes.length === 0) {
      throw new InsufficientLiquidityError();
    }

    if (!shouldCalculateGas) {
      return {
        route: routes[0]
      };
    }

    const deadline = Math.floor(Date.now() / 1000) + 60 * this.settings.deadline;
    const { slippageTolerance } = this.settings;

    if (this.settings.rubicOptimisation && toToken.price) {
      const gasRequests = routes.map(route =>
        gasCalculationMethodName(
          fromAmountAbsolute,
          subtractPercent(route.outputAbsoluteAmount, slippageTolerance).toFixed(0),
          route.path.map(token => token.address),
          deadline
        )
      );
      const gasLimits = gasRequests.map(item => item.defaultGasLimit);

      if (this.walletAddress) {
        const estimatedGasLimits = await this.blockchainAdapter.batchEstimatedGas(
          this.contractAbi,
          this.contractAddress,
          this.walletAddress,
          gasRequests.map(item => item.callData)
        );
        estimatedGasLimits.forEach((elem, index) => {
          if (elem?.isFinite()) {
            gasLimits[index] = elem;
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
        .filter(el => el.route.outputAbsoluteAmount.gt(0))
        .sort((a, b) => b.profit.comparedTo(a.profit));

      if (!sortedRoutes.length) {
        throw new InsufficientLiquidityRubicOptimisation();
      }

      return sortedRoutes[0];
    }

    const route = routes[0];
    const estimateGasParams = gasCalculationMethodName(
      fromAmountAbsolute,
      subtractPercent(route.outputAbsoluteAmount, slippageTolerance).toFixed(0),
      route.path.map(token => token.address),
      deadline
    );
    const estimatedGas = await this.blockchainAdapter
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
    amountAbsolute: string,
    uniswapMethodName: 'getAmountsOut' | 'getAmountsIn'
  ): Promise<UniswapV2Route[]> {
    const vertexes: SymbolToken[] = this.routingProviders.filter(
      elem =>
        !compareAddresses(elem.address, toToken.address) &&
        !compareAddresses(elem.address, fromToken.address)
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
      const responses = await this.getRoutes(routesMethodArguments, uniswapMethodName);
      responses.forEach((response, index) => {
        if (!response.success) {
          return;
        }
        const { amounts } = response.output;
        const amount = new BigNumber(
          uniswapMethodName === 'getAmountsOut' ? amounts[amounts.length - 1] : amounts[0]
        );
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

  public async getFromAmount(
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    toAmount: BigNumber
  ): Promise<BigNumber> {
    const fromTokenClone = { ...fromToken };
    const toTokenClone = { ...toToken };

    if (this.blockchainAdapter.isNativeAddress(fromTokenClone.address)) {
      fromTokenClone.address = this.wethAddress;
    }
    if (this.blockchainAdapter.isNativeAddress(toTokenClone.address)) {
      toTokenClone.address = this.wethAddress;
    }

    const toAmountAbsolute = Web3Pure.toWei(toAmount, toToken.decimals);
    const routes = (
      await this.getAllRoutes(fromTokenClone, toTokenClone, toAmountAbsolute, 'getAmountsIn')
    ).sort((a, b) => a.outputAbsoluteAmount.comparedTo(b.outputAbsoluteAmount));
    return routes[0]?.outputAbsoluteAmount;
  }

  public async createTrade(
    trade: InstantTrade,
    options: ItOptions = {}
  ): Promise<TransactionReceipt> {
    this.walletConnectorService.checkSettings(trade.blockchain);
    await this.blockchainAdapter.checkBalance(
      trade.from.token,
      trade.from.amount,
      this.walletAddress
    );

    const uniswapV2Trade: UniswapV2Trade = {
      amountIn: Web3Pure.toWei(trade.from.amount, trade.from.token.decimals),
      amountOutMin: Web3Pure.toWei(
        subtractPercent(trade.to.amount, this.settings.slippageTolerance),
        trade.to.token.decimals
      ),
      path: trade.path.map(token => token.address),
      to: this.walletAddress,
      deadline: Math.floor(Date.now() / 1000) + 60 * this.settings.deadline
    };

    let getTradeDataMethod = this.getTokensToTokensTradeData;
    let getTradeSupportingFeeDataMethod = this.getTokensToTokensTradeSupportingFeeData;
    if (this.blockchainAdapter.isNativeAddress(trade.from.token.address)) {
      getTradeDataMethod = this.getEthToTokensTradeData;
      getTradeSupportingFeeDataMethod = this.getEthToTokensTradeSupportingFeeData;
    }
    if (this.blockchainAdapter.isNativeAddress(trade.to.token.address)) {
      getTradeDataMethod = this.getTokensToEthTradeData;
      getTradeSupportingFeeDataMethod = this.getTokensToEthTradeSupportingFeeData;
    }

    const tradeData = getTradeDataMethod(uniswapV2Trade, options, trade.gasLimit, trade.gasPrice);
    const tradeDataSupportingFee = getTradeSupportingFeeDataMethod(uniswapV2Trade);
    const methodName = await this.tryExecuteTradeAndGetMethodName(
      tradeData,
      tradeDataSupportingFee
    );

    return this.web3PrivateService.executeContractMethod(
      this.contractAddress,
      this.contractAbi,
      methodName,
      tradeData.methodArguments,
      tradeData.options
    );
  }

  /**
   * Makes test calls on uniswap contract and returns one of swap functions for tokens with or without fee.
   * @param tradeData Trade data for tokens without fee.
   * @param tradeDataSupportingFee Trade data for tokens with fee.
   */
  private async tryExecuteTradeAndGetMethodName(
    tradeData: TradeContractData,
    tradeDataSupportingFee: TradeContractData
  ): Promise<string | never> {
    const tryExecute = async (methodData: {
      methodName: string;
      methodArguments: unknown[];
      options?: TransactionOptions;
    }): Promise<boolean> => {
      try {
        await this.blockchainAdapter.tryExecuteContractMethod(
          this.contractAddress,
          this.contractAbi,
          methodData.methodName,
          methodData.methodArguments,
          this.walletAddress,
          methodData.options
        );
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    };

    const [isTradeSuccessful, isTradeSupportingFeeSuccessful] = await Promise.all([
      tryExecute(tradeData),
      tryExecute(tradeDataSupportingFee)
    ]);

    if (isTradeSuccessful && isTradeSupportingFeeSuccessful) {
      return tradeData.methodName;
    }
    if (isTradeSupportingFeeSuccessful) {
      return tradeDataSupportingFee.methodName;
    }
    throw new TokenWithFeeError();
  }
}

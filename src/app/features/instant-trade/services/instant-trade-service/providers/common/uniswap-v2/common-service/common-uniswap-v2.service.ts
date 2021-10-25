import { inject, Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import InsufficientLiquidityError from 'src/app/core/errors/models/instant-trade/insufficient-liquidity.error';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3/web3-private-service/web3-private.service';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/providers/provider-connector-service/provider-connector.service';
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
} from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import {
  DefaultEstimatedGas,
  defaultEstimatedGas
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/constants/default-estimated-gas';
import { CreateTradeMethod } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/CreateTradeMethod';
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
import { UniswapV2InstantTrade } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/UniswapV2InstantTrade';
import { TransactionReceipt } from 'web3-eth';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { UniswapV2Constants } from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapV2Constants';
import { AbiItem } from 'web3-utils';
import { GasService } from 'src/app/core/services/gas-service/gas.service';
import { subtractPercent } from 'src/app/shared/utils/utils';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3/web3-public-service/web3-public.service';
import { Multicall } from 'src/app/core/services/blockchain/models/multicall';
import defaultUniswapV2Abi from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/constants/default-uniswap-v2-abi';

@Injectable()
export abstract class CommonUniswapV2Service implements ItProvider {
  protected contractAbi: AbiItem[];

  protected swapsMethod: ISwapMethods;

  private readonly defaultEstimateGas: DefaultEstimatedGas;

  private readonly gasMargin: number;

  private walletAddress: string;

  private settings: ItSettingsForm;

  protected web3Public: Web3Public;

  // Uniswap constants
  private blockchain: BLOCKCHAIN_NAME;

  private wethAddress: string;

  protected contractAddress: string;

  private routingProviders: string[];

  private maxTransitTokens: number;

  // Injected services
  private readonly web3PublicService = inject(Web3PublicService);

  private readonly web3PrivateService = inject(Web3PrivateService);

  private readonly providerConnectorService = inject(ProviderConnectorService);

  private readonly authService = inject(AuthService);

  private readonly settingsService = inject(SettingsService);

  private readonly tokensService = inject(TokensService);

  private readonly useTestingModeService = inject(UseTestingModeService);

  private readonly gasService = inject(GasService);

  protected constructor(uniswapConstants: UniswapV2Constants) {
    this.contractAbi = defaultUniswapV2Abi;
    this.swapsMethod = DEFAULT_SWAP_METHODS;
    this.defaultEstimateGas = defaultEstimatedGas;
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

  private setUniswapConstants(uniswapConstants: UniswapV2Constants) {
    this.blockchain = uniswapConstants.blockchain;
    this.web3Public = this.web3PublicService[this.blockchain];
    this.maxTransitTokens = uniswapConstants.maxTransitTokens;

    this.contractAddress = uniswapConstants.contractAddressNetMode.mainnet;
    this.wethAddress = uniswapConstants.wethAddressNetMode.mainnet;
    this.routingProviders = uniswapConstants.routingProvidersNetMode.mainnet;

    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.web3Public = this.web3PublicService[this.blockchain];

        this.contractAddress = uniswapConstants.contractAddressNetMode.testnet;
        this.wethAddress = uniswapConstants.wethAddressNetMode.testnet;
        this.routingProviders = uniswapConstants.routingProvidersNetMode.testnet;
      }
    });
  }

  /**
   * Makes multi call method of contract.
   * @param routesMethodArguments Arguments for calling method of contract.
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

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    if (Web3Public.isNativeAddress(tokenAddress)) {
      return of(new BigNumber(Infinity));
    }
    return from(
      this.web3Public.getAllowance(tokenAddress, this.walletAddress, this.contractAddress)
    );
  }

  public async approve(tokenAddress: string, options: TransactionOptions): Promise<void> {
    this.providerConnectorService.checkSettings(this.blockchain);
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
        params: [amountIn, path, this.walletAddress, deadline],
        value: amountOutMin
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

  private createEthToTokensTrade: CreateTradeMethod = (
    trade: UniswapV2Trade,
    options: ItOptions,
    gasLimit: string,
    gasPrice?: string
  ) => {
    return this.web3PrivateService.tryExecuteContractMethod(
      this.contractAddress,
      this.contractAbi,
      this.swapsMethod.ETH_TO_TOKENS,
      [trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm,
        value: trade.amountIn,
        gas: gasLimit,
        gasPrice
      }
    );
  };

  private createTokensToEthTrade: CreateTradeMethod = (
    trade: UniswapV2Trade,
    options: ItOptions,
    gasLimit: string,
    gasPrice?: string
  ) => {
    return this.web3PrivateService.tryExecuteContractMethod(
      this.contractAddress,
      this.contractAbi,
      this.swapsMethod.TOKENS_TO_ETH,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm,
        gas: gasLimit,
        gasPrice
      }
    );
  };

  private createTokensToTokensTrade: CreateTradeMethod = (
    trade: UniswapV2Trade,
    options: ItOptions,
    gasLimit: string,
    gasPrice?: string
  ) => {
    return this.web3PrivateService.tryExecuteContractMethod(
      this.contractAddress,
      this.contractAbi,
      this.swapsMethod.TOKENS_TO_TOKENS,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm,
        gas: gasLimit,
        gasPrice
      }
    );
  };

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean
  ): Promise<UniswapV2InstantTrade> {
    let fromTokenAddress = fromToken.address;
    const toTokenClone = { ...toToken };

    let estimatedGasPredictionMethod = this.calculateTokensToTokensGasLimit;

    if (Web3Public.isNativeAddress(fromTokenAddress)) {
      fromTokenAddress = this.wethAddress;
      estimatedGasPredictionMethod = this.calculateEthToTokensGasLimit;
    }
    if (Web3Public.isNativeAddress(toTokenClone.address)) {
      toTokenClone.address = this.wethAddress;
      estimatedGasPredictionMethod = this.calculateTokensToEthGasLimit;
    }

    const fromAmountAbsolute = Web3Public.toWei(fromAmount, fromToken.decimals);

    let gasPriceInEth: BigNumber;
    let gasPriceInUsd: BigNumber;
    if (shouldCalculateGas) {
      gasPriceInEth = await this.gasService.getGasPriceInEthUnits(this.blockchain);
      const nativeCoinPrice = await this.tokensService.getNativeCoinPriceInUsd(this.blockchain);
      gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
    }

    const { route, estimatedGas } = await this.getToAmountAndPath(
      fromTokenAddress,
      fromAmountAbsolute,
      toTokenClone,
      shouldCalculateGas,
      estimatedGasPredictionMethod,
      gasPriceInUsd
    );

    const instantTrade: UniswapV2InstantTrade = {
      blockchain: this.blockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: Web3Public.fromWei(route.outputAbsoluteAmount, toToken.decimals)
      },
      path: route.path
    };

    if (!shouldCalculateGas) {
      return instantTrade;
    }

    const increasedGas = Web3Public.calculateGasMargin(estimatedGas, this.gasMargin);
    const gasFeeInEth = gasPriceInEth.multipliedBy(increasedGas);
    const gasFeeInUsd = gasPriceInUsd.multipliedBy(increasedGas);

    return {
      ...instantTrade,
      gasLimit: increasedGas,
      gasPrice: Web3Public.toWei(gasPriceInEth),
      gasFeeInUsd,
      gasFeeInEth
    };
  }

  private async getToAmountAndPath(
    fromTokenAddress: string,
    fromAmountAbsolute: string,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean,
    gasCalculationMethodName: GasCalculationMethod,
    gasPriceInUsd?: BigNumber
  ): Promise<UniswapV2CalculatedInfo> {
    const routes = (
      await this.getAllRoutes(
        fromTokenAddress,
        toToken.address,
        fromAmountAbsolute,
        'getAmountsOut'
      )
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
          route.path,
          deadline
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
        estimatedGasLimits.forEach((elem, index) => {
          if (elem?.isFinite()) {
            gasLimits[index] = elem;
          }
        });
      }

      const routesWithProfit: UniswapV2CalculatedInfoWithProfit[] = routes.map((route, index) => {
        const estimatedGas = gasLimits[index];
        const gasFeeInUsd = estimatedGas.multipliedBy(gasPriceInUsd);
        const profit = Web3Public.fromWei(route.outputAbsoluteAmount, toToken.decimals)
          .multipliedBy(toToken.price)
          .minus(gasFeeInUsd);

        return {
          route,
          estimatedGas,
          profit
        };
      });

      return routesWithProfit.sort((a, b) => b.profit.comparedTo(a.profit))[0];
    }

    const route = routes[0];
    const estimateGasParams = gasCalculationMethodName(
      fromAmountAbsolute,
      subtractPercent(route.outputAbsoluteAmount, slippageTolerance).toFixed(0),
      route.path,
      deadline
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
    fromTokenAddress: string,
    toTokenAddress: string,
    amountAbsolute: string,
    uniswapMethodName: 'getAmountsOut' | 'getAmountsIn'
  ): Promise<UniswapV2Route[]> {
    const vertexes: string[] = this.routingProviders
      .map(elem => elem.toLowerCase())
      .filter(
        elem => elem !== toTokenAddress.toLowerCase() && elem !== fromTokenAddress.toLowerCase()
      );
    const initialPath = [fromTokenAddress];
    const routesPaths: string[][] = [];
    const routesMethodArguments: [string, string[]][] = [];

    const recGraphVisitor = (path: string[], mxTransitTokens: number): void => {
      if (path.length === mxTransitTokens + 1) {
        const finalPath = path.concat(toTokenAddress);
        routesPaths.push(finalPath);
        routesMethodArguments.push([amountAbsolute, finalPath]);
        return;
      }

      vertexes
        .filter(vertex => !path.includes(vertex))
        .forEach(vertex => {
          const extendedPath = path.concat(vertex);
          recGraphVisitor(extendedPath, mxTransitTokens);
        });
    };

    const maxTransitTokens = this.settings.disableMultihops ? 0 : this.maxTransitTokens;
    for (let i = 0; i <= maxTransitTokens; i++) {
      recGraphVisitor(initialPath, i);
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

  public async getFromAmount(
    fromTokenAddress: string,
    toToken: InstantTradeToken,
    toAmount: BigNumber
  ): Promise<BigNumber> {
    const toTokenClone = { ...toToken };

    if (Web3Public.isNativeAddress(fromTokenAddress)) {
      fromTokenAddress = this.wethAddress;
    }
    if (Web3Public.isNativeAddress(toTokenClone.address)) {
      toTokenClone.address = this.wethAddress;
    }

    const toAmountAbsolute = Web3Public.toWei(toAmount, toToken.decimals);
    const routes = (
      await this.getAllRoutes(fromTokenAddress, toToken.address, toAmountAbsolute, 'getAmountsIn')
    ).sort((a, b) => a.outputAbsoluteAmount.comparedTo(b.outputAbsoluteAmount));
    return routes[0]?.outputAbsoluteAmount;
  }

  public async createTrade(
    trade: UniswapV2InstantTrade,
    options: ItOptions = {}
  ): Promise<TransactionReceipt> {
    this.providerConnectorService.checkSettings(trade.blockchain);
    await this.web3Public.checkBalance(trade.from.token, trade.from.amount, this.walletAddress);

    const uniswapV2Trade: UniswapV2Trade = {
      amountIn: Web3Public.toWei(trade.from.amount, trade.from.token.decimals),
      amountOutMin: Web3Public.toWei(
        subtractPercent(trade.to.amount, this.settings.slippageTolerance),
        trade.to.token.decimals
      ),
      path: trade.path,
      to: this.walletAddress,
      deadline: Math.floor(Date.now() / 1000) + 60 * this.settings.deadline
    };

    let createTradeMethod = this.createTokensToTokensTrade;
    if (Web3Public.isNativeAddress(trade.from.token.address)) {
      createTradeMethod = this.createEthToTokensTrade;
    }
    if (Web3Public.isNativeAddress(trade.to.token.address)) {
      createTradeMethod = this.createTokensToEthTrade;
    }

    return createTradeMethod(uniswapV2Trade, options, trade.gasLimit, trade.gasPrice);
  }
}

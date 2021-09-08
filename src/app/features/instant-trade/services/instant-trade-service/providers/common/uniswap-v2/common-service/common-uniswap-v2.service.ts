import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import InsufficientLiquidityError from 'src/app/core/errors/models/instant-trade/insufficient-liquidity.error';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { from, Observable, of } from 'rxjs';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { startWith } from 'rxjs/operators';
import {
  Web3PublicService,
  Web3SupportedBlockchains
} from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import CommonUniswapV2Abi from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/constants/commonUniswapV2Abi';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ItOptions } from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import { defaultEstimatedGas } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/constants/defaultEstimatedGas';
import { CreateTradeMethod } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/CreateTradeMethod';
import { GasCalculationMethod } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/GasCalculationMethod';
import { UniswapRoute } from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapRoute';
import { UniswapV2Trade } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/UniswapV2Trade';
import { SWAP_METHOD } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/SWAP_METHOD';
import {
  UniswapV2CalculatedInfo,
  UniswapV2CalculatedInfoWithProfit
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/UniswapV2CalculatedInfo';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { minGasPriceInBlockchain } from 'src/app/core/services/blockchain/constants/minGasPriceInBlockchain';

@Injectable({
  providedIn: 'root'
})
export class CommonUniswapV2Service {
  private readonly abi = CommonUniswapV2Abi;

  private readonly defaultEstimateGas = defaultEstimatedGas;

  private readonly GAS_MARGIN = 1.2;

  private walletAddress: string;

  private settings: ItSettingsForm;

  constructor(
    private readonly web3PublicService: Web3PublicService,
    private readonly web3Private: Web3PrivateService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly authService: AuthService,
    private readonly settingsService: SettingsService,
    private readonly tokensService: TokensService
  ) {
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

  public getAllowance(
    blockchain: BLOCKCHAIN_NAME,
    tokenAddress: string,
    contractAddress: string
  ): Observable<BigNumber> {
    const web3Public: Web3Public = this.web3PublicService[blockchain as Web3SupportedBlockchains];
    if (Web3Public.isNativeAddress(tokenAddress)) {
      return of(new BigNumber(Infinity));
    }
    return from(
      web3Public.getAllowance(tokenAddress, this.providerConnectorService.address, contractAddress)
    );
  }

  public async approve(
    blockchain: BLOCKCHAIN_NAME,
    tokenAddress: string,
    contractAddress: string,
    options: TransactionOptions
  ): Promise<void> {
    this.providerConnectorService.checkSettings(blockchain);
    await this.web3Private.approveTokens(tokenAddress, contractAddress, 'infinity', options);
  }

  private calculateTokensToTokensGasLimit: GasCalculationMethod = (
    amountIn: string,
    amountOutMin: string,
    path: string[],
    deadline: number
  ) => {
    return {
      callData: {
        contractMethod: SWAP_METHOD.TOKENS_TO_TOKENS,
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
        contractMethod: SWAP_METHOD.ETH_TO_TOKENS,
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
        contractMethod: SWAP_METHOD.TOKENS_TO_ETH,
        params: [amountIn, amountOutMin, path, this.walletAddress, deadline]
      },
      defaultGasLimit: this.defaultEstimateGas.tokensToEth[path.length - 2]
    };
  };

  private createEthToTokensTrade: CreateTradeMethod = (
    trade: UniswapV2Trade,
    options: ItOptions,
    contractAddress: string,
    gasLimit: string,
    gasPrice?: string
  ) => {
    return this.web3Private.tryExecuteContractMethod(
      contractAddress,
      this.abi,
      SWAP_METHOD.ETH_TO_TOKENS,
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
    contractAddress: string,
    gasLimit: string,
    gasPrice?: string
  ) => {
    return this.web3Private.tryExecuteContractMethod(
      contractAddress,
      this.abi,
      SWAP_METHOD.TOKENS_TO_ETH,
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
    contractAddress: string,
    gasLimit: string,
    gasPrice?: string
  ) => {
    return this.web3Private.tryExecuteContractMethod(
      contractAddress,
      this.abi,
      SWAP_METHOD.TOKENS_TO_TOKENS,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm,
        gas: gasLimit,
        gasPrice
      }
    );
  };

  public async calculateTrade(
    blockchain: BLOCKCHAIN_NAME,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    wethAddress: string,
    contractAddress: string,
    routingProviders: string[],
    maxTransitTokens: number
  ): Promise<InstantTrade> {
    let fromTokenAddress = fromToken.address;
    const toTokenClone = { ...toToken };

    let estimatedGasPredictionMethod = this.calculateTokensToTokensGasLimit;

    const web3Public: Web3Public = this.web3PublicService[blockchain as Web3SupportedBlockchains];
    if (Web3Public.isNativeAddress(fromTokenAddress)) {
      fromTokenAddress = wethAddress;
      estimatedGasPredictionMethod = this.calculateEthToTokensGasLimit;
    }
    if (Web3Public.isNativeAddress(toTokenClone.address)) {
      toTokenClone.address = wethAddress;
      estimatedGasPredictionMethod = this.calculateTokensToEthGasLimit;
    }

    const fromAmountAbsolute = Web3Public.toWei(fromAmount, fromToken.decimals);

    const gasPriceWeb3 = await web3Public.getGasPrice();
    const minGasPrice =
      minGasPriceInBlockchain[blockchain as keyof typeof minGasPriceInBlockchain] || 0;
    const gasPrice = BigNumber.max(gasPriceWeb3, minGasPrice).toFixed();
    const gasPriceInEth = Web3Public.fromWei(gasPrice);
    const nativeCoinPrice = await this.tokensService.getNativeCoinPriceInUsd(blockchain);
    const gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);

    const { route, estimatedGas } = await this.getToAmountAndPath(
      fromTokenAddress,
      fromAmountAbsolute,
      toTokenClone,
      routingProviders,
      maxTransitTokens,
      contractAddress,
      web3Public,
      estimatedGasPredictionMethod,
      gasPriceInUsd
    );

    const instantTrade = {
      blockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: Web3Public.fromWei(route.outputAbsoluteAmount, toToken.decimals)
      },
      options: {
        path: route.path
      }
    };

    const increasedGas = Web3Public.calculateGasMargin(estimatedGas, this.GAS_MARGIN);
    const gasFeeInEth = gasPriceInEth.multipliedBy(increasedGas);
    const gasFeeInUsd = gasPriceInUsd.multipliedBy(increasedGas);

    return {
      ...instantTrade,
      gasLimit: increasedGas,
      gasPrice,
      gasFeeInUsd,
      gasFeeInEth
    };
  }

  private async getToAmountAndPath(
    fromTokenAddress: string,
    fromAmountAbsolute: string,
    toToken: InstantTradeToken,
    routingProviders: string[],
    maxTransitTokens: number,
    contractAddress: string,
    web3Public: Web3Public,
    gasCalculationMethodName: GasCalculationMethod,
    gasPriceInUsd?: BigNumber
  ): Promise<UniswapV2CalculatedInfo> {
    const routes = (
      await this.getAllRoutes(
        fromTokenAddress,
        toToken.address,
        fromAmountAbsolute,
        routingProviders,
        this.settings.disableMultihops ? 0 : maxTransitTokens,
        contractAddress,
        web3Public,
        'getAmountsOut'
      )
    ).sort((a, b) => (b.outputAbsoluteAmount.gt(a.outputAbsoluteAmount) ? 1 : -1));
    if (routes.length === 0) {
      throw new InsufficientLiquidityError();
    }

    const deadline = Math.floor(Date.now() / 1000) + 60 * this.settings.deadline;
    const slippage = new BigNumber(1).minus(this.settings.slippageTolerance);

    const gasRequests = routes.map(route =>
      gasCalculationMethodName(
        fromAmountAbsolute,
        route.outputAbsoluteAmount.multipliedBy(slippage).toFixed(0),
        route.path,
        deadline
      )
    );

    const gasLimits = gasRequests.map(item => item.defaultGasLimit);

    if (this.walletAddress) {
      const estimatedGasLimits = await web3Public.batchEstimatedGas(
        CommonUniswapV2Abi,
        contractAddress,
        this.walletAddress,
        gasRequests.map(item => item.callData)
      );
      estimatedGasLimits.forEach((elem, index) => {
        if (elem && !elem.isNaN()) {
          gasLimits[index] = elem;
        }
      });
    }

    if (this.settings.rubicOptimisation && toToken.price && this.walletAddress) {
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

      const sortedByProfitRoutes = routesWithProfit.sort((a, b) =>
        b.profit.minus(a.profit).gt(0) ? 1 : -1
      );

      // TODO: remove console.debug after qa tests
      console.debug(
        `[DEBUG] calldata ${JSON.stringify({
          fromTokenAddress,
          fromAmountAbsolute,
          toToken
        })}\nreturn ${JSON.stringify({ routeWithProfit: sortedByProfitRoutes[0] })}`
      );

      return sortedByProfitRoutes[0];
    }

    // TODO: remove console.debug after qa tests
    console.debug(
      `[DEBUG] calldata ${JSON.stringify({
        fromTokenAddress,
        fromAmountAbsolute,
        toToken
      })}\nreturn ${JSON.stringify({ route: routes[0], estimatedGas: gasLimits[0] })}`
    );

    return {
      route: routes[0],
      estimatedGas: gasLimits[0]
    };
  }

  private async getAllRoutes(
    fromTokenAddress: string,
    toTokenAddress: string,
    amountAbsolute: string,
    routingProviders: string[],
    maxTransitTokens: number,
    contractAddress: string,
    web3Public: Web3Public,
    uniswapMethodName: 'getAmountsOut' | 'getAmountsIn'
  ): Promise<UniswapRoute[]> {
    const vertexes: string[] = routingProviders
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

    for (let i = 0; i <= maxTransitTokens; i++) {
      recGraphVisitor(initialPath, i);
    }

    const routes: UniswapRoute[] = [];
    await web3Public
      .multicallContractMethod<{ amounts: string[] }>(
        contractAddress,
        this.abi,
        uniswapMethodName,
        routesMethodArguments
      )
      .then(responses => {
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
      })
      .catch(err => {
        console.debug(err);
      });

    return routes;
  }

  public async getFromAmount(
    blockchain: BLOCKCHAIN_NAME,
    fromTokenAddress: string,
    toToken: InstantTradeToken,
    toAmount: BigNumber,
    wethAddress: string,
    routingProviders: string[],
    maxTransitTokens: number,
    contractAddress: string
  ): Promise<BigNumber> {
    const toTokenClone = { ...toToken };
    const web3Public: Web3Public = this.web3PublicService[blockchain as Web3SupportedBlockchains];

    if (Web3Public.isNativeAddress(fromTokenAddress)) {
      fromTokenAddress = wethAddress;
    }
    if (Web3Public.isNativeAddress(toTokenClone.address)) {
      toTokenClone.address = wethAddress;
    }

    const toAmountAbsolute = Web3Public.toWei(toAmount, toToken.decimals);
    const routes = (
      await this.getAllRoutes(
        fromTokenAddress,
        toToken.address,
        toAmountAbsolute,
        routingProviders,
        maxTransitTokens,
        contractAddress,
        web3Public,
        'getAmountsIn'
      )
    ).sort((a, b) => (b.outputAbsoluteAmount.lt(a.outputAbsoluteAmount) ? 1 : -1));
    return routes[0]?.outputAbsoluteAmount;
  }

  public async createTrade(trade: InstantTrade, contractAddress: string, options: ItOptions = {}) {
    this.providerConnectorService.checkSettings(trade.blockchain);

    const web3Public = this.web3PublicService[trade.blockchain as Web3SupportedBlockchains];
    await web3Public.checkBalance(trade.from.token, trade.from.amount, this.walletAddress);

    const uniswapV2Trade: UniswapV2Trade = {
      amountIn: Web3Public.toWei(trade.from.amount, trade.from.token.decimals),
      amountOutMin: Web3Public.toWei(
        trade.to.amount.multipliedBy(new BigNumber(1).minus(this.settings.slippageTolerance)),
        trade.to.token.decimals
      ),
      // @ts-ignore
      path: trade.options.path,
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

    return createTradeMethod(
      uniswapV2Trade,
      options,
      contractAddress,
      trade.gasLimit,
      trade.gasPrice
    );
  }
}

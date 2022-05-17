import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import InstantTradeToken from '@features/swaps/features/instant-trade/models/instant-trade-token';
import { compareAddresses } from '@shared/utils/utils';
import { MethodData } from '@shared/models/blockchain/method-data';
import { IsEthFromOrTo } from '@features/swaps/core/instant-trade/providers/common/uniswap-v3-algebra/common-service/models/is-eth-from-or-to';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { UniSwapV3QuoterController } from '@features/swaps/core/instant-trade/providers/common/uniswap-v3/utils/quoter-controller/uni-swap-v3-quoter-controller';
import {
  UniswapV3InstantTrade,
  UniswapV3Route
} from '@features/swaps/core/instant-trade/providers/common/uniswap-v3/models/uniswap-v3-instant-trade';
import { SymbolToken } from '@shared/models/tokens/symbol-token';
import {
  UniswapV3CalculatedInfo,
  UniswapV3CalculatedInfoWithProfit
} from '@features/swaps/core/instant-trade/providers/common/uniswap-v3/models/uniswap-v3-calculated-info';
import InsufficientLiquidityError from '@core/errors/models/instant-trade/insufficient-liquidity-error';
import { BatchCall } from '@core/services/blockchain/models/batch-call';
import {
  swapEstimatedGas,
  wethToEthEstimatedGas
} from '@features/swaps/core/instant-trade/providers/common/uniswap-v3/constants/estimated-gas';
import { CommonUniswapV3AlgebraService } from '@features/swaps/core/instant-trade/providers/common/uniswap-v3-algebra/common-service/common-uniswap-v3-algebra.service';
import { MAX_TRANSIT_POOL } from '@features/swaps/core/instant-trade/providers/common/uniswap-v3/common-uniswap-v3.constants';
import { UniswapV3Constants } from '@features/swaps/core/instant-trade/providers/common/uniswap-v3/models/uniswap-v3-constants';
import { UNISWAP_V3_SWAP_ROUTER_CONTRACT } from '@features/swaps/core/instant-trade/providers/common/uniswap-v3/constants/swap-router-contract-data';
import { UNISWAP_V3_QUOTER_CONTRACT } from '@features/swaps/core/instant-trade/providers/common/uniswap-v3/constants/quoter-contract-data';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';

const RUBIC_OPTIMIZATION_DISABLED = true;

@Injectable()
export abstract class CommonUniswapV3Service extends CommonUniswapV3AlgebraService {
  public readonly providerType = INSTANT_TRADE_PROVIDER.UNISWAP_V3;

  protected readonly unwrapWethMethodName = 'unwrapWETH9';

  private readonly quoterController: UniSwapV3QuoterController;

  protected constructor(uniswapV3Constants: UniswapV3Constants) {
    super({
      ...uniswapV3Constants,
      swapRouterContract: UNISWAP_V3_SWAP_ROUTER_CONTRACT
    });

    this.quoterController = new UniSwapV3QuoterController(
      this.web3Public,
      UNISWAP_V3_QUOTER_CONTRACT,
      uniswapV3Constants.routerTokens,
      uniswapV3Constants.routerLiquidityPools
    );
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean
  ): Promise<UniswapV3InstantTrade> {
    const { fromTokenWrapped, toTokenWrapped, isEth } = this.getWrappedTokens(fromToken, toToken);

    const fromAmountAbsolute = Web3Pure.toWei(fromAmount, fromToken.decimals);

    let gasPriceInEth: BigNumber;
    let gasPriceInUsd: BigNumber;
    if (shouldCalculateGas) {
      gasPriceInEth = await this.gasService.getGasPriceInEthUnits(this.blockchain);
      const nativeCoinPrice = await this.tokensService.getNativeCoinPriceInUsd(this.blockchain);
      gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
    }

    const { route, estimatedGas } = await this.getRoute(
      fromAmountAbsolute,
      fromTokenWrapped,
      toTokenWrapped,
      isEth,
      shouldCalculateGas,
      gasPriceInUsd
    );

    const initialPool = route.poolsPath[0];
    const path: SymbolToken[] = [
      compareAddresses(initialPool.token0.address, route.initialTokenAddress)
        ? initialPool.token0
        : initialPool.token1
    ];
    route.poolsPath.forEach(pool => {
      path.push(
        !compareAddresses(pool.token0.address, path[path.length - 1].address)
          ? pool.token0
          : pool.token1
      );
    });

    const trade: UniswapV3InstantTrade = {
      blockchain: this.blockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: Web3Pure.fromWei(route.outputAbsoluteAmount, toToken.decimals)
      },
      path,
      route
    };
    if (!shouldCalculateGas) {
      return trade;
    }

    const increasedGas = Web3Pure.calculateGasMargin(estimatedGas, this.gasMargin);
    const gasFeeInEth = gasPriceInEth.multipliedBy(increasedGas);
    const gasFeeInUsd = gasPriceInUsd.multipliedBy(increasedGas);

    return {
      ...trade,
      gasLimit: increasedGas,
      gasPrice: Web3Pure.toWei(gasPriceInEth),
      gasFeeInEth,
      gasFeeInUsd
    };
  }

  /**
   * Returns most profitable route and estimated gas, if {@param shouldCalculateGas} flag is true.
   * @param fromAmountAbsolute From amount in Wei.
   * @param fromToken From token.
   * @param toToken To token.
   * @param isEth Flags, showing if Eth was used as one of tokens.
   * @param shouldCalculateGas Flag whether gas should be estimated or not.
   * @param gasPriceInUsd Gas price in usd.
   */
  private async getRoute(
    fromAmountAbsolute: string,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    isEth: IsEthFromOrTo,
    shouldCalculateGas: boolean,
    gasPriceInUsd?: BigNumber
  ): Promise<UniswapV3CalculatedInfo> {
    const routes = (
      await this.quoterController.getAllRoutes(
        fromAmountAbsolute,
        fromToken,
        toToken,
        this.settings.disableMultihops ? 0 : MAX_TRANSIT_POOL
      )
    ).sort((a, b) => b.outputAbsoluteAmount.comparedTo(a.outputAbsoluteAmount));

    if (routes.length === 0) {
      throw new InsufficientLiquidityError();
    }

    if (!shouldCalculateGas) {
      return {
        route: routes[0]
      };
    }

    const deadline = Math.floor(Date.now() / 1000) + 60 * this.settings.deadline;

    if (!RUBIC_OPTIMIZATION_DISABLED && this.settings.rubicOptimisation && toToken.price) {
      const gasRequests = routes.map(route =>
        this.getEstimatedGasMethodSignature(
          route,
          fromAmountAbsolute,
          toToken.address,
          isEth,
          deadline
        )
      );
      const gasLimits = gasRequests.map(item => item.defaultGasLimit);

      if (this.walletAddress) {
        const estimatedGasLimits = await this.web3Public.batchEstimatedGas(
          this.swapRouterContract.abi,
          this.swapRouterContract.address,
          this.walletAddress,
          gasRequests.map(item => item.callData)
        );
        estimatedGasLimits.forEach((elem, index) => {
          if (elem?.isFinite()) {
            gasLimits[index] = elem;
          }
        });
      }

      const calculatedProfits: UniswapV3CalculatedInfoWithProfit[] = routes.map((route, index) => {
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

      return calculatedProfits.sort((a, b) => b.profit.comparedTo(a.profit))[0];
    }

    const route = routes[0];
    const estimateGasParams = this.getEstimatedGasMethodSignature(
      route,
      fromAmountAbsolute,
      toToken.address,
      isEth,
      deadline
    );
    const estimatedGas = this.walletAddress
      ? await this.web3Public
          .getEstimatedGas(
            this.swapRouterContract.abi,
            this.swapRouterContract.address,
            estimateGasParams.callData.contractMethod,
            estimateGasParams.callData.params,
            this.walletAddress,
            estimateGasParams.callData.value
          )
          .catch(() => estimateGasParams.defaultGasLimit)
      : estimateGasParams.defaultGasLimit;
    return {
      route,
      estimatedGas
    };
  }

  /**
   * Returns encoded data of estimated gas function and default estimated gas.
   * @param route Route to use in a swap.
   * @param fromAmountAbsolute From amount in Wei.
   * @param toTokenAddress To token address.
   * @param isEth Flags, showing if Eth was used as one of tokens.
   * @param deadline Deadline of swap in seconds.
   */
  private getEstimatedGasMethodSignature(
    route: UniswapV3Route,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    isEth: IsEthFromOrTo,
    deadline: number
  ): { callData: BatchCall; defaultGasLimit: BigNumber } {
    const defaultEstimatedGas = swapEstimatedGas[route.poolsPath.length - 1].plus(
      isEth.to ? wethToEthEstimatedGas : 0
    );

    if (!this.walletAddress) {
      return {
        callData: null,
        defaultGasLimit: defaultEstimatedGas
      };
    }

    const { methodName, methodArguments } = this.getSwapRouterMethodData(
      route,
      fromAmountAbsolute,
      toTokenAddress,
      isEth,
      deadline
    );

    return {
      callData: {
        contractMethod: methodName,
        params: methodArguments,
        value: isEth.from ? fromAmountAbsolute : null
      },
      defaultGasLimit: defaultEstimatedGas
    };
  }

  protected getSwapRouterExactInputMethodParams(
    route: UniswapV3Route,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    walletAddress: string,
    deadline: number
  ): MethodData {
    const amountOutMin = this.getAmountOutMin(route);

    if (route.poolsPath.length === 1) {
      return {
        methodName: 'exactInputSingle',
        methodArguments: [
          [
            route.initialTokenAddress,
            toTokenAddress,
            route.poolsPath[0].fee,
            walletAddress,
            deadline,
            fromAmountAbsolute,
            amountOutMin,
            0
          ]
        ]
      };
    }
    return {
      methodName: 'exactInput',
      methodArguments: [
        [
          UniSwapV3QuoterController.getEncodedPoolsPath(route.poolsPath, route.initialTokenAddress),
          walletAddress,
          deadline,
          fromAmountAbsolute,
          amountOutMin
        ]
      ]
    };
  }
}

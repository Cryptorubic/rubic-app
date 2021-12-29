import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import InsufficientLiquidityError from 'src/app/core/errors/models/instant-trade/insufficient-liquidity.error';
import { UniSwapV3QuoterController } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/quoter-controller/uni-swap-v3-quoter-controller';
import { MethodData } from 'src/app/shared/models/blockchain/MethodData';
import { BatchCall } from 'src/app/core/services/blockchain/models/BatchCall';
import {
  swapEstimatedGas,
  wethToEthEstimatedGas
} from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/constants/estimated-gas';
import {
  UniSwapV3CalculatedInfo,
  UniSwapV3CalculatedInfoWithProfit
} from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/uni-swap-v3-calculated-info';
import { compareAddresses } from 'src/app/shared/utils/utils';
import { SymbolToken } from '@shared/models/tokens/SymbolToken';
import { CommonUniV3AlgebraService } from '@features/instant-trade/services/instant-trade-service/providers/common/uni-v3-algebra/common-service/common-uni-v3-algebra.service';
import { IsEthFromOrTo } from '@features/instant-trade/services/instant-trade-service/models/is-eth-from-or-to';
import { GasService } from '@core/services/gas-service/gas.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import {
  maxTransitPools,
  quoterContract,
  uniSwapV3Constants
} from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/uni-swap-v3-constants';
import {
  UniSwapV3InstantTrade,
  UniSwapV3Route
} from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/uni-swap-v3-instant-trade';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { INSTANT_TRADES_PROVIDER } from '@shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

const RUBIC_OPTIMIZATION_DISABLED = true;

@Injectable({
  providedIn: 'root'
})
export class UniSwapV3Service extends CommonUniV3AlgebraService {
  private readonly gasMargin = 1.2;

  private readonly quoterController: UniSwapV3QuoterController;

  public get providerType(): INSTANT_TRADES_PROVIDER {
    return INSTANT_TRADES_PROVIDER.UNISWAP_V3;
  }

  constructor(
    private readonly gasService: GasService,
    private readonly tokensService: TokensService
  ) {
    super(uniSwapV3Constants);

    this.quoterController = new UniSwapV3QuoterController(this.blockchainAdapter, quoterContract);

    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.quoterController.setTestingMode();
      }
    });
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean
  ): Promise<UniSwapV3InstantTrade> {
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
    path.push(
      ...route.poolsPath.map(pool => {
        return !compareAddresses(pool.token0.address, path[path.length - 1].address)
          ? pool.token0
          : pool.token1;
      })
    );

    const trade: UniSwapV3InstantTrade = {
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
  ): Promise<UniSwapV3CalculatedInfo> {
    const routes = (
      await this.quoterController.getAllRoutes(
        fromAmountAbsolute,
        fromToken,
        toToken,
        this.settings.disableMultihops ? 0 : maxTransitPools
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
        const estimatedGasLimits = await this.blockchainAdapter.batchEstimatedGas(
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

      const calculatedProfits: UniSwapV3CalculatedInfoWithProfit[] = routes.map((route, index) => {
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
    const estimatedGas = await this.blockchainAdapter
      .getEstimatedGas(
        this.swapRouterContract.abi,
        this.swapRouterContract.address,
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

  /**
   * Returns encoded data of estimated gas function and default estimated gas.
   * @param route Route to use in a swap.
   * @param fromAmountAbsolute From amount in Wei.
   * @param toTokenAddress To token address.
   * @param isEth Flags, showing if Eth was used as one of tokens.
   * @param deadline Deadline of swap in seconds.
   */
  private getEstimatedGasMethodSignature(
    route: UniSwapV3Route,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    isEth: IsEthFromOrTo,
    deadline: number
  ): { callData: BatchCall; defaultGasLimit: BigNumber } {
    const defaultEstimatedGas = swapEstimatedGas[route.poolsPath.length - 1].plus(
      isEth.to ? wethToEthEstimatedGas : 0
    );

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
    route: UniSwapV3Route,
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

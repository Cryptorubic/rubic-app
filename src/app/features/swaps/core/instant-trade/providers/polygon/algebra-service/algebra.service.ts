import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import InstantTradeToken from '@features/swaps/features/instant-trade/models/instant-trade-token';
import { MethodData } from '@shared/models/blockchain/method-data';
import { AlgebraQuoterController } from '@features/swaps/core/instant-trade/providers/polygon/algebra-service/utils/quoter-controller/algebra-quoter-controller';
import {
  algebraConstants,
  maxTransitTokens,
  quoterContract
} from '@features/swaps/core/instant-trade/providers/polygon/algebra-service/algebra-constants';
import {
  AlgebraInstantTrade,
  AlgebraRoute
} from '@features/swaps/core/instant-trade/providers/polygon/algebra-service/models/algebra-instant-trade';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';
import InsufficientLiquidityError from '@core/errors/models/instant-trade/insufficient-liquidity-error';
import { CommonUniswapV3AlgebraService } from '@features/swaps/core/instant-trade/providers/common/uniswap-v3-algebra/common-service/common-uniswap-v3-algebra.service';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class AlgebraService extends CommonUniswapV3AlgebraService {
  protected readonly unwrapWethMethodName = 'unwrapWNativeToken';

  public readonly providerType = INSTANT_TRADE_PROVIDER.ALGEBRA;

  private readonly quoterController: AlgebraQuoterController;

  constructor() {
    super(algebraConstants);

    this.quoterController = new AlgebraQuoterController(this.web3Public, quoterContract);
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<AlgebraInstantTrade> {
    const { fromTokenWrapped, toTokenWrapped } = this.getWrappedTokens(fromToken, toToken);
    const fromAmountAbsolute = Web3Pure.toWei(fromAmount, fromToken.decimals);

    const route = await this.getRoute(fromTokenWrapped, toTokenWrapped, fromAmountAbsolute);

    return {
      blockchain: this.blockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: Web3Pure.fromWei(route.outputAbsoluteAmount, toToken.decimals)
      },
      path: route.path,
      route
    };
  }

  /**
   * Returns most profitable route.
   * @param fromToken From token.
   * @param toToken To token.
   * @param amountAbsolute From or to amount in Wei.
   */
  private async getRoute(
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    amountAbsolute: string
  ): Promise<AlgebraRoute> {
    const routes = (
      await this.quoterController.getAllRoutes(
        fromToken,
        toToken,
        amountAbsolute,
        this.settings.disableMultihops ? 0 : maxTransitTokens
      )
    ).sort((a, b) => b.outputAbsoluteAmount.comparedTo(a.outputAbsoluteAmount));

    if (routes.length === 0) {
      throw new InsufficientLiquidityError();
    }
    return routes[0];
  }

  protected getSwapRouterExactInputMethodParams(
    route: AlgebraRoute,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    walletAddress: string,
    deadline: number
  ): MethodData {
    const amountOutMin = this.getAmountOutMin(route);

    if (route.path.length === 2) {
      return {
        methodName: 'exactInputSingle',
        methodArguments: [
          [
            route.path[0].address,
            toTokenAddress,
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
          AlgebraQuoterController.getEncodedPath(route.path),
          walletAddress,
          deadline,
          fromAmountAbsolute,
          amountOutMin
        ]
      ]
    };
  }
}

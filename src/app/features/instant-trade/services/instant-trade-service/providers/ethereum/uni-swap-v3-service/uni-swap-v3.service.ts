import { Injectable } from '@angular/core';
import {
  ItOptions,
  ItProvider
} from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { from, Observable, of } from 'rxjs';
import { TransactionReceipt } from 'web3-eth';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import {
  maxTransitPools,
  uniSwapV3ContractData,
  wethAddressNetMode
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/uni-swap-v3-constants';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import InsufficientLiquidityError from 'src/app/core/errors/models/instant-trade/insufficient-liquidity.error';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import { LiquidityPoolsController } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/liquidity-pool-controller/LiquidityPoolsController';

import { UniswapV3Route } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniswapV3Route';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { UniswapV3Trade } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniswapV3Trade';
import { filter, first, startWith } from 'rxjs/operators';
import { MethodData } from 'src/app/shared/models/blockchain/MethodData';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { GasService } from 'src/app/core/services/gas-service/gas.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { BatchCall } from 'src/app/core/services/blockchain/types/BatchCall';
import {
  swapEstimatedGas,
  WETHtoETHEstimatedGas
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/constants/estimatedGas';

interface IsEthFromOrTo {
  from: boolean;
  to: boolean;
}

interface UniswapV3CalculatedInfo {
  route: UniswapV3Route;
  estimatedGas?: BigNumber;
}

interface UniswapV3CalculatedInfoWithProfit extends UniswapV3CalculatedInfo {
  estimatedGas: BigNumber;
  profit: BigNumber;
}

@Injectable({
  providedIn: 'root'
})
export class UniSwapV3Service implements ItProvider {
  private readonly blockchain: BLOCKCHAIN_NAME;

  private web3Public: Web3Public;

  private liquidityPoolsController: LiquidityPoolsController;

  private wethAddress: string;

  private settings: ItSettingsForm;

  private walletAddress: string;

  constructor(
    private readonly web3PublicService: Web3PublicService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly authService: AuthService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly settingsService: SettingsService,
    private readonly coingeckoApiService: CoingeckoApiService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly tokensService: TokensService,
    private readonly gasService: GasService
  ) {
    this.blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    this.settingsService.instantTradeValueChanges
      .pipe(startWith(this.settingsService.instantTradeValue))
      .subscribe(settingsForm => {
        this.settings = {
          ...settingsForm,
          slippageTolerance: settingsForm.slippageTolerance / 100
        };
      });

    this.authService.getCurrentUser().subscribe(user => {
      this.walletAddress = user?.address;
    });

    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      this.web3Public = this.web3PublicService[this.blockchain];
      this.liquidityPoolsController = new LiquidityPoolsController(this.web3Public, isTestingMode);
      if (!isTestingMode) {
        this.wethAddress = wethAddressNetMode.mainnet;
      } else {
        this.wethAddress = wethAddressNetMode.testnet;
      }
    });
  }

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    if (Web3Public.isNativeAddress(tokenAddress)) {
      return of(new BigNumber(Infinity));
    }
    return from(
      this.web3Public.getAllowance(
        tokenAddress,
        this.providerConnectorService.address,
        uniSwapV3ContractData.swapRouter.address
      )
    );
  }

  public async approve(tokenAddress: string, options: TransactionOptions): Promise<void> {
    this.providerConnectorService.checkSettings(this.blockchain);
    await this.web3PrivateService.approveTokens(
      tokenAddress,
      uniSwapV3ContractData.swapRouter.address,
      'infinity',
      options
    );
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean
  ): Promise<UniswapV3Trade> {
    const { fromTokenWrapped, toTokenWrapped, isEth } = this.getWrappedTokens(fromToken, toToken);

    const fromAmountAbsolute = Web3Public.toWei(fromAmount, fromToken.decimals);

    let gasPriceInEth: BigNumber;
    let gasPriceInUsd: BigNumber;
    if (shouldCalculateGas) {
      gasPriceInEth = new BigNumber(
        await this.gasService
          .getGasPrice$(this.blockchain)
          .pipe(
            filter(value => !!value),
            first()
          )
          .toPromise()
      );
      const nativeCoinPrice = await this.tokensService.getNativeCoinPriceInUsd(this.blockchain);
      gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
    }

    const { route, estimatedGas } = await this.getToAmountAndPath(
      fromAmountAbsolute,
      fromTokenWrapped.address,
      toTokenWrapped,
      isEth,
      shouldCalculateGas
    );

    const trade: UniswapV3Trade = {
      blockchain: this.blockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: Web3Public.fromWei(route.outputAbsoluteAmount, toToken.decimals)
      },
      route
    };
    if (!shouldCalculateGas) {
      return trade;
    }

    const gasFeeInEth = estimatedGas.multipliedBy(gasPriceInEth);
    const gasFeeInUsd = estimatedGas.multipliedBy(gasPriceInUsd);

    return {
      ...trade,
      gasLimit: estimatedGas.toFixed(0),
      gasFeeInEth,
      gasFeeInUsd
    };
  }

  private getWrappedTokens(
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): {
    fromTokenWrapped: InstantTradeToken;
    toTokenWrapped: InstantTradeToken;
    isEth: IsEthFromOrTo;
  } {
    const fromTokenWrapped = { ...fromToken };
    const toTokenWrapped = { ...toToken };
    const isEth: IsEthFromOrTo = {} as IsEthFromOrTo;
    if (Web3Public.isNativeAddress(fromToken.address)) {
      fromTokenWrapped.address = this.wethAddress;
      isEth.from = true;
    }
    if (Web3Public.isNativeAddress(toToken.address)) {
      toTokenWrapped.address = this.wethAddress;
      isEth.to = true;
    }
    return {
      fromTokenWrapped,
      toTokenWrapped,
      isEth
    };
  }

  private async getToAmountAndPath(
    fromAmountAbsolute: string,
    fromTokenAddress: string,
    toToken: InstantTradeToken,
    isEth: IsEthFromOrTo,
    shouldCalculateGas: boolean,
    gasPriceInUsd?: BigNumber
  ): Promise<UniswapV3CalculatedInfo> {
    const routes = (
      await this.liquidityPoolsController.getAllRoutes(
        fromAmountAbsolute,
        fromTokenAddress,
        toToken.address,
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
        uniSwapV3ContractData.swapRouter.abi,
        uniSwapV3ContractData.swapRouter.address,
        this.walletAddress,
        gasRequests.map(item => item.callData)
      );
      estimatedGasLimits.forEach((elem, index) => {
        if (elem?.isFinite()) {
          gasLimits[index] = elem;
        }
      });
    }

    if (this.settings.rubicOptimisation && toToken.price) {
      const calculatedProfits: UniswapV3CalculatedInfoWithProfit[] = routes.map((route, index) => {
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

      return calculatedProfits.sort((a, b) => b.profit.comparedTo(a.profit))[0];
    }

    const route = routes[0];
    return {
      route,
      estimatedGas: gasLimits[0]
    };
  }

  private getEstimatedGasMethodSignature(
    route: UniswapV3Route,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    isEth: IsEthFromOrTo,
    deadline: number
  ): { callData: BatchCall; defaultGasLimit: BigNumber } {
    const defaultEstimateGas = swapEstimatedGas[route.poolsPath.length - 1].plus(
      isEth.to ? WETHtoETHEstimatedGas : 0
    );

    const { methodName, methodArguments } = this.getSwapRouterExactInputMethodParams(
      route,
      fromAmountAbsolute,
      toTokenAddress,
      this.walletAddress,
      deadline
    );

    return {
      callData: {
        contractMethod: methodName,
        params: methodArguments,
        value: isEth.from ? fromAmountAbsolute : null
      },
      defaultGasLimit: defaultEstimateGas
    };
  }

  private getSwapRouterExactInputMethodParams(
    route: UniswapV3Route,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    walletAddress: string,
    deadline: number
  ): MethodData {
    const amountOutMin = route.outputAbsoluteAmount
      .multipliedBy(new BigNumber(1).minus(this.settings.slippageTolerance))
      .toFixed(0);

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
          LiquidityPoolsController.getEncodedPoolsPath(route.poolsPath, route.initialTokenAddress),
          walletAddress,
          deadline,
          fromAmountAbsolute,
          amountOutMin
        ]
      ]
    };
  }

  public async createTrade(
    trade: UniswapV3Trade,
    options: { onConfirm?: (hash: string) => void; onApprove?: (hash: string | null) => void }
  ): Promise<TransactionReceipt> {
    this.providerConnectorService.checkSettings(this.blockchain);
    await this.web3Public.checkBalance(trade.from.token, trade.from.amount, this.walletAddress);

    const fromToken = trade.from.token;
    const toToken = trade.to.token;
    const fromAmountAbsolute = Web3Public.toWei(trade.from.amount, trade.from.token.decimals);
    const { toTokenWrapped, isEth } = this.getWrappedTokens(fromToken, toToken);

    const { route } = trade;
    return this.swapTokens(route, fromAmountAbsolute, toTokenWrapped.address, isEth, options);
  }

  private swapTokens(
    route: UniswapV3Route,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    isEth: IsEthFromOrTo,
    options: ItOptions
  ): Promise<TransactionReceipt> {
    const deadline = Math.floor(Date.now() / 1000) + 60 * this.settings.deadline;
    const amountOutMin = route.outputAbsoluteAmount
      .multipliedBy(new BigNumber(1).minus(this.settings.slippageTolerance))
      .toFixed(0);

    let methodName: string;
    let methodArguments: unknown[];
    if (!isEth.to) {
      const { methodName: exactInputMethodName, methodArguments: exactInputMethodArguments } =
        this.getSwapRouterExactInputMethodParams(
          route,
          fromAmountAbsolute,
          toTokenAddress,
          this.walletAddress,
          deadline
        );
      methodName = exactInputMethodName;
      methodArguments = exactInputMethodArguments;
    } else {
      const { methodName: exactInputMethodName, methodArguments: exactInputMethodArguments } =
        this.getSwapRouterExactInputMethodParams(
          route,
          fromAmountAbsolute,
          toTokenAddress,
          NATIVE_TOKEN_ADDRESS,
          deadline
        );
      const exactInputMethodEncoded = this.web3Public.encodeFunctionCall(
        uniSwapV3ContractData.swapRouter.abi,
        exactInputMethodName,
        exactInputMethodArguments
      );
      const unwrapWETHMethodEncoded = this.web3Public.encodeFunctionCall(
        uniSwapV3ContractData.swapRouter.abi,
        'unwrapWETH9',
        [amountOutMin, this.walletAddress]
      );

      methodName = 'multicall';
      methodArguments = [[exactInputMethodEncoded, unwrapWETHMethodEncoded]];
    }

    return this.web3PrivateService.tryExecuteContractMethod(
      uniSwapV3ContractData.swapRouter.address,
      uniSwapV3ContractData.swapRouter.abi,
      methodName,
      methodArguments,
      {
        value: isEth.from ? fromAmountAbsolute : null,
        onTransactionHash: options.onConfirm
      }
    );
  }
}

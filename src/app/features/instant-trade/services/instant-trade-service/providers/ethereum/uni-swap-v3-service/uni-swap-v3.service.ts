import { Injectable } from '@angular/core';
import {
  ItOptions,
  ItProvider
} from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { from, Observable, of } from 'rxjs';
import { TransactionReceipt } from 'web3-eth';
import { Web3Public } from 'src/app/core/services/blockchain/blockchain-adapters/web3/web3-public';
import { BlockchainPublicService } from 'src/app/core/services/blockchain/blockchain-public/blockchain-public.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/providers/provider-connector-service/provider-connector.service';
import {
  maxTransitPools,
  uniSwapV3ContractData,
  wethAddressNetMode
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/uni-swap-v3-constants';
import InsufficientLiquidityError from 'src/app/core/errors/models/instant-trade/insufficient-liquidity.error';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { LiquidityPoolsController } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/liquidity-pool-controller/LiquidityPoolsController';

import { UniswapV3Route } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniswapV3Route';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { UniswapV3Trade } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniswapV3Trade';
import { startWith } from 'rxjs/operators';
import { MethodData } from 'src/app/shared/models/blockchain/MethodData';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { GasService } from 'src/app/core/services/gas-service/gas.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { BatchCall } from 'src/app/core/services/blockchain/models/BatchCall';
import {
  swapEstimatedGas,
  WETHtoETHEstimatedGas
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/constants/estimatedGas';
import {
  UniswapV3CalculatedInfo,
  UniswapV3CalculatedInfoWithProfit
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniswapV3CalculatedInfo';
import { subtractPercent } from 'src/app/shared/utils/utils';
import { Web3Pure } from 'src/app/core/services/blockchain/blockchain-adapters/web3/web3-pure';
import { BlockchainPublicAdapter } from 'src/app/core/services/blockchain/blockchain-public/types';

/**
 * Shows whether Eth is used as from or to token.
 */
interface IsEthFromOrTo {
  from: boolean;
  to: boolean;
}

const RUBIC_OPTIMIZATION_DISABLED = true;

@Injectable({
  providedIn: 'root'
})
export class UniSwapV3Service implements ItProvider {
  /**
   * Amount by which estimated gas should be increased (1.2 = 120%).
   */
  private readonly gasMargin: number;

  private readonly blockchain: BLOCKCHAIN_NAME;

  private blockchainPublicAdapter: BlockchainPublicAdapter;

  private liquidityPoolsController: LiquidityPoolsController;

  private wethAddress: string;

  private settings: ItSettingsForm;

  private walletAddress: string;

  constructor(
    private readonly blockchainPublicService: BlockchainPublicService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly authService: AuthService,
    private readonly settingsService: SettingsService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly tokensService: TokensService,
    private readonly gasService: GasService
  ) {
    this.gasMargin = 1.2;

    this.blockchain = BLOCKCHAIN_NAME.ETHEREUM;
    this.blockchainPublicAdapter = this.blockchainPublicService.adapters[this.blockchain];
    this.liquidityPoolsController = new LiquidityPoolsController(this.blockchainPublicAdapter);
    this.wethAddress = wethAddressNetMode.mainnet;

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
      if (isTestingMode) {
        this.blockchainPublicAdapter = this.blockchainPublicService.adapters[this.blockchain];
        this.liquidityPoolsController = new LiquidityPoolsController(
          this.blockchainPublicAdapter,
          true
        );
        this.wethAddress = wethAddressNetMode.testnet;
      }
    });
  }

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    const blockchainPublicAdapter = this.blockchainPublicService.adapters[this.blockchain];

    if (blockchainPublicAdapter.isNativeAddress(tokenAddress)) {
      return of(new BigNumber(Infinity));
    }
    return from(
      this.blockchainPublicAdapter.getAllowance(
        tokenAddress,
        this.walletAddress,
        uniSwapV3ContractData.swapRouter.address
      )
    );
  }

  public async approve(tokenAddress: string, options: TransactionOptions): Promise<void> {
    this.providerConnectorService.checkSettings(this.blockchain);
    await this.providerConnectorService.provider.approveTokens(
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

    const fromAmountAbsolute = BlockchainPublicService.toWei(fromAmount, fromToken.decimals);

    let gasPriceInEth: BigNumber;
    let gasPriceInUsd: BigNumber;
    if (shouldCalculateGas) {
      gasPriceInEth = await this.gasService.getGasPriceInEthUnits(this.blockchain);
      const nativeCoinPrice = await this.tokensService.getNativeCoinPriceInUsd(this.blockchain);
      gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
    }

    const { route, estimatedGas } = await this.getToAmountAndPath(
      fromAmountAbsolute,
      fromTokenWrapped.address,
      toTokenWrapped,
      isEth,
      shouldCalculateGas,
      gasPriceInUsd
    );

    const trade: UniswapV3Trade = {
      blockchain: this.blockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: BlockchainPublicService.fromWei(route.outputAbsoluteAmount, toToken.decimals)
      },
      route
    };
    if (!shouldCalculateGas) {
      return trade;
    }

    const increasedGas = Web3Public.calculateGasMargin(estimatedGas, this.gasMargin);
    const gasFeeInEth = gasPriceInEth.multipliedBy(increasedGas);
    const gasFeeInUsd = gasPriceInUsd.multipliedBy(increasedGas);

    return {
      ...trade,
      gasLimit: increasedGas,
      gasPrice: BlockchainPublicService.toWei(gasPriceInEth),
      gasFeeInEth,
      gasFeeInUsd
    };
  }

  /**
   * Returns passed tokens with updated addresses to use in contracts.
   * @param fromToken From token.
   * @param toToken To token.
   */
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
    const blockchainPublicAdapter = this.blockchainPublicService.adapters[this.blockchain];

    if (blockchainPublicAdapter.isNativeAddress(fromToken.address)) {
      fromTokenWrapped.address = this.wethAddress;
      isEth.from = true;
    }
    if (blockchainPublicAdapter.isNativeAddress(toToken.address)) {
      toTokenWrapped.address = this.wethAddress;
      isEth.to = true;
    }
    return {
      fromTokenWrapped,
      toTokenWrapped,
      isEth
    };
  }

  /**
   * Returns most profitable route and possibly estimated gas, if {@param shouldCalculateGas} flag is true.
   * @param fromAmountAbsolute From amount in Wei.
   * @param fromTokenAddress From token address.
   * @param toToken To token address.
   * @param isEth Flags, showing if Eth was used as one of tokens.
   * @param shouldCalculateGas Flag whether gas should be estimated or not.
   * @param gasPriceInUsd Gas price in usd.
   */
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
        const estimatedGasLimits = await this.blockchainPublicAdapter.batchEstimatedGas(
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

      const calculatedProfits: UniswapV3CalculatedInfoWithProfit[] = routes.map((route, index) => {
        const estimatedGas = gasLimits[index];
        const gasFeeInUsd = estimatedGas.multipliedBy(gasPriceInUsd);
        const profit = BlockchainPublicService.fromWei(route.outputAbsoluteAmount, toToken.decimals)
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
    const estimatedGas = await this.blockchainPublicAdapter
      .getEstimatedGas(
        uniSwapV3ContractData.swapRouter.abi,
        uniSwapV3ContractData.swapRouter.address,
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

  /**
   * Returns swap method's name and argument to use in Swap contract.
   * @param route Route to use in a swap.
   * @param fromAmountAbsolute From amount in Wei.
   * @param toTokenAddress To token address.
   * @param walletAddress Wallet address, making swap.
   * @param deadline Deadline of swap in seconds.
   */
  private getSwapRouterExactInputMethodParams(
    route: UniswapV3Route,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    walletAddress: string,
    deadline: number
  ): MethodData {
    const amountOutMin = subtractPercent(
      route.outputAbsoluteAmount,
      this.settings.slippageTolerance
    ).toFixed(0);

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
    await this.blockchainPublicAdapter.checkBalance(
      trade.from.token,
      trade.from.amount,
      this.walletAddress
    );

    const fromToken = trade.from.token;
    const toToken = trade.to.token;
    const fromAmountAbsolute = BlockchainPublicService.toWei(
      trade.from.amount,
      trade.from.token.decimals
    );
    const { toTokenWrapped, isEth } = this.getWrappedTokens(fromToken, toToken);

    return this.swapTokens(trade, fromAmountAbsolute, toTokenWrapped.address, isEth, options);
  }

  /**
   * Executes swap method in Swap contract.
   * @param trade Uniswap v3 trade.
   * @param fromAmountAbsolute From amount in Wei.
   * @param toTokenAddress To token address.
   * @param isEth Flags, showing if Eth was used as one of tokens.
   * @param options Instant trade options.
   */
  private async swapTokens(
    trade: UniswapV3Trade,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    isEth: IsEthFromOrTo,
    options: ItOptions
  ): Promise<TransactionReceipt> {
    const { route } = trade;
    const deadline = Math.floor(Date.now() / 1000) + 60 * this.settings.deadline;
    const amountOutMin = subtractPercent(
      route.outputAbsoluteAmount,
      this.settings.slippageTolerance
    ).toFixed(0);

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
      const exactInputMethodEncoded = await Web3Pure.encodeFunctionCall(
        uniSwapV3ContractData.swapRouter.abi,
        exactInputMethodName,
        exactInputMethodArguments
      );
      const unwrapWETHMethodEncoded = await Web3Pure.encodeFunctionCall(
        uniSwapV3ContractData.swapRouter.abi,
        'unwrapWETH9',
        [amountOutMin, this.walletAddress]
      );

      methodName = 'multicall';
      methodArguments = [[exactInputMethodEncoded, unwrapWETHMethodEncoded]];
    }

    return this.providerConnectorService.provider.tryExecuteContractMethod(
      uniSwapV3ContractData.swapRouter.address,
      uniSwapV3ContractData.swapRouter.abi,
      methodName,
      methodArguments,
      {
        value: isEth.from ? fromAmountAbsolute : undefined,
        onTransactionHash: options.onConfirm,
        gas: trade.gasLimit,
        gasPrice: trade.gasPrice
      }
    );
  }
}

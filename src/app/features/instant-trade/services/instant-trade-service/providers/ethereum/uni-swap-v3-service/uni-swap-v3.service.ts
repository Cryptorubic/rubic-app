import { Injectable } from '@angular/core';
import {
  ItOptions,
  ItProvider
} from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { from, Observable, of } from 'rxjs';
import { TransactionReceipt } from 'web3-eth';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { PublicBlockchainAdapterService } from 'src/app/core/services/blockchain/web3/web3-public-service/public-blockchain-adapter.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import {
  maxTransitPools,
  uniSwapV3ContractData,
  wethAddressNetMode
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/uni-swap-v3-constants';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3/web3-private-service/web3-private.service';
import InsufficientLiquidityError from 'src/app/core/errors/models/instant-trade/insufficient-liquidity.error';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { LiquidityPoolsController } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/liquidity-pool-controller/LiquidityPoolsController';

import { UniswapV3Route } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniswapV3Route';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { NATIVE_ETH_LIKE_TOKEN_ADDRESS } from '@shared/constants/blockchain/NATIVE_ETH_LIKE_TOKEN_ADDRESS';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { UniswapV3InstantTrade } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniswapV3InstantTrade';
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
import { compareAddresses, subtractPercent } from 'src/app/shared/utils/utils';
import { Web3Pure } from 'src/app/core/services/blockchain/web3/web3-pure/web3-pure';
import { SymbolToken } from '@shared/models/tokens/SymbolToken';

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

  private web3Public: Web3Public;

  private liquidityPoolsController: LiquidityPoolsController;

  private wethAddress: string;

  private settings: ItSettingsForm;

  private walletAddress: string;

  constructor(
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly providerConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly settingsService: SettingsService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly tokensService: TokensService,
    private readonly gasService: GasService
  ) {
    this.gasMargin = 1.2;

    this.blockchain = BLOCKCHAIN_NAME.ETHEREUM;
    this.web3Public = this.publicBlockchainAdapterService[this.blockchain];
    this.liquidityPoolsController = new LiquidityPoolsController(this.web3Public);
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
        this.web3Public = this.publicBlockchainAdapterService[this.blockchain] as Web3Public;
        this.liquidityPoolsController = new LiquidityPoolsController(this.web3Public, true);
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
        this.walletAddress,
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
  ): Promise<UniswapV3InstantTrade> {
    const { fromTokenWrapped, toTokenWrapped, isEth } = this.getWrappedTokens(fromToken, toToken);

    const fromAmountAbsolute = Web3Public.toWei(fromAmount, fromToken.decimals);

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

    const trade: UniswapV3InstantTrade = {
      blockchain: this.blockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: Web3Public.fromWei(route.outputAbsoluteAmount, toToken.decimals)
      },
      path,
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
      gasPrice: Web3Public.toWei(gasPriceInEth),
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
      await this.liquidityPoolsController.getAllRoutes(
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
    const estimateGasParams = this.getEstimatedGasMethodSignature(
      route,
      fromAmountAbsolute,
      toToken.address,
      isEth,
      deadline
    );
    const estimatedGas = await this.web3Public
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
    trade: UniswapV3InstantTrade,
    options: { onConfirm?: (hash: string) => void; onApprove?: (hash: string | null) => void }
  ): Promise<TransactionReceipt> {
    this.providerConnectorService.checkSettings(this.blockchain);
    await this.web3Public.checkBalance(trade.from.token, trade.from.amount, this.walletAddress);

    const fromToken = trade.from.token;
    const toToken = trade.to.token;
    const fromAmountAbsolute = Web3Public.toWei(trade.from.amount, trade.from.token.decimals);
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
    trade: UniswapV3InstantTrade,
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
          NATIVE_ETH_LIKE_TOKEN_ADDRESS,
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

    return this.web3PrivateService.tryExecuteContractMethod(
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

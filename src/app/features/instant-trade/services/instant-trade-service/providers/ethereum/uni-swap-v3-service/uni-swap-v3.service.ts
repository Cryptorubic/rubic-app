import { Injectable } from '@angular/core';
import { ItProvider } from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
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
import { Gas } from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap.types';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import { LiquidityPoolsController } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/liquidity-pool-controller/LiquidityPoolsController';
import {
  swapEstimatedGas,
  WETHtoETHEstimatedGas
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/constants/estimatedGas';
import { UniswapV3Route } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniswapV3Route';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { UniswapV3Trade } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniswapV3Trade';

interface IsEthFromOrTo {
  from: boolean;
  to: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UniSwapV3Service implements ItProvider {
  private web3Public: Web3Public;

  private liquidityPoolsController: LiquidityPoolsController;

  private wethAddress: string;

  private settings: ItSettingsForm;

  constructor(
    private readonly web3PublicService: Web3PublicService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly settingsService: SettingsService,
    private readonly coingeckoApiService: CoingeckoApiService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly tokensService: TokensService
  ) {
    const settingsForm = this.settingsService.settingsForm.controls.INSTANT_TRADE;
    this.setSettings(settingsForm.value);
    settingsForm.valueChanges.subscribe(formValue => {
      this.setSettings(formValue);
    });

    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      this.web3Public = this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM];
      this.liquidityPoolsController = new LiquidityPoolsController(this.web3Public, isTestingMode);
      if (!isTestingMode) {
        this.wethAddress = wethAddressNetMode.mainnet;
      } else {
        this.wethAddress = wethAddressNetMode.testnet;
      }
    });
  }

  private static getSwapRouterExactInputMethodParams(
    route: UniswapV3Route,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    amountOutMin: string,
    walletAddress: string,
    deadline: number
  ): { methodName: string; methodArguments: unknown[] } {
    let methodName: string;
    let methodArguments: unknown[];
    if (route.poolsPath.length === 1) {
      methodName = 'exactInputSingle';
      methodArguments = [
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
      ];
    } else {
      methodName = 'exactInput';
      methodArguments = [
        [
          LiquidityPoolsController.getEncodedPoolsPath(route.poolsPath, route.initialTokenAddress),
          walletAddress,
          deadline,
          fromAmountAbsolute,
          amountOutMin
        ]
      ];
    }

    return { methodName, methodArguments };
  }

  private setSettings(settingsFormValue: ItSettingsForm): void {
    this.settings = {
      ...settingsFormValue,
      slippageTolerance: settingsFormValue.slippageTolerance / 100
    };
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

  public async approve(
    tokenAddress: string,
    options: { onTransactionHash?: (hash: string) => void }
  ): Promise<void> {
    this.providerConnectorService.checkSettings(BLOCKCHAIN_NAME.ETHEREUM);
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
    toToken: InstantTradeToken
  ): Promise<UniswapV3Trade> {
    const { fromTokenWrapped, toTokenWrapped, isEth } = this.getWrappedTokens(fromToken, toToken);

    const fromAmountAbsolute = Web3Public.toWei(fromAmount, fromToken.decimals);
    const { route, gasData } = await this.getToAmountAndPath(
      fromAmountAbsolute,
      fromTokenWrapped.address,
      toTokenWrapped,
      isEth,
      this.settings.rubicOptimisation,
      BLOCKCHAIN_NAME.ETHEREUM
    );

    return {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: Web3Public.fromWei(route.outputAbsoluteAmount, toToken.decimals)
      },
      gasLimit: gasData.gasLimit.toFixed(),
      gasFeeInUsd: gasData.gasFeeInUsd,
      gasFeeInEth: gasData.gasFeeInEth,
      route
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

  private async getGasFees(
    estimatedGas: BigNumber,
    gasPrice?: BigNumber,
    ethPrice?: BigNumber
  ): Promise<{ gasFeeInEth: BigNumber; gasFeeInUsd: BigNumber }> {
    gasPrice = gasPrice || (await this.web3Public.getGasPriceInETH());
    ethPrice =
      ethPrice ||
      new BigNumber(await this.tokensService.getNativeCoinPriceInUsd(BLOCKCHAIN_NAME.ETHEREUM));
    const gasFeeInEth = estimatedGas.multipliedBy(gasPrice);
    const gasFeeInUsd = gasFeeInEth.multipliedBy(ethPrice);
    return {
      gasFeeInEth,
      gasFeeInUsd
    };
  }

  private async getToAmountAndPath(
    fromAmountAbsolute: string,
    fromTokenAddress: string,
    toToken: InstantTradeToken,
    isEth: IsEthFromOrTo,
    shouldOptimiseGas: boolean,
    blockchain: BLOCKCHAIN_NAME
  ): Promise<{ route: UniswapV3Route; gasData: Gas }> {
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

    const walletAddress = this.providerConnectorService.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * this.settings.deadline;
    const gasPrice = await this.web3Public.getGasPriceInETH();
    const ethPrice = await this.tokensService.getNativeCoinPriceInUsd(blockchain);

    const getGasData = async (route: UniswapV3Route): Promise<Gas> => {
      const estimatedGas = await this.getEstimatedGas(
        fromAmountAbsolute,
        toToken.address,
        isEth,
        route,
        walletAddress,
        deadline
      );
      const { gasFeeInEth, gasFeeInUsd } = await this.getGasFees(
        estimatedGas,
        gasPrice,
        new BigNumber(ethPrice)
      );
      return {
        gasLimit: estimatedGas,
        gasFeeInEth,
        gasFeeInUsd
      };
    };

    if (shouldOptimiseGas && toToken.price) {
      const promises: Promise<{
        route: UniswapV3Route;
        gasData: Gas;
        profit: BigNumber;
      }>[] = routes.map(async route => {
        const gasData = await getGasData(route);
        const profit = route.outputAbsoluteAmount
          .div(10 ** toToken.decimals)
          .multipliedBy(toToken.price)
          .minus(gasData.gasFeeInUsd);
        return {
          route,
          gasData,
          profit
        };
      });

      const results = await Promise.all(promises);
      return results.sort((a, b) => b.profit.comparedTo(a.profit))[0];
    }

    const route = routes[0];
    const gasData = await getGasData(route);
    return {
      route,
      gasData
    };
  }

  private async getEstimatedGas(
    fromAmountAbsolute: string,
    toTokenAddress: string,
    isEth: IsEthFromOrTo,
    route: UniswapV3Route,
    walletAddress: string,
    deadline: number
  ): Promise<BigNumber> {
    if (!walletAddress) {
      return swapEstimatedGas[route.poolsPath.length - 1].plus(
        isEth.to ? WETHtoETHEstimatedGas : 0
      );
    }

    const allowance = isEth.from
      ? new BigNumber(Infinity)
      : await this.web3Public.getAllowance(
          route.initialTokenAddress,
          walletAddress,
          uniSwapV3ContractData.swapRouter.address
        );
    const balance = isEth.from
      ? await this.web3Public.getBalance(walletAddress, { inWei: true })
      : await this.web3Public.getTokenBalance(walletAddress, route.initialTokenAddress);
    if (!allowance.gte(fromAmountAbsolute) || !balance.gte(fromAmountAbsolute)) {
      return swapEstimatedGas[route.poolsPath.length - 1].plus(
        isEth.to ? WETHtoETHEstimatedGas : 0
      );
    }

    const amountOutMin = route.outputAbsoluteAmount
      .multipliedBy(new BigNumber(1).minus(this.settings.slippageTolerance))
      .toFixed(0);
    const { methodName, methodArguments } = UniSwapV3Service.getSwapRouterExactInputMethodParams(
      route,
      fromAmountAbsolute,
      toTokenAddress,
      amountOutMin,
      walletAddress,
      deadline
    );
    return this.web3Public.getEstimatedGas(
      uniSwapV3ContractData.swapRouter.abi,
      uniSwapV3ContractData.swapRouter.address,
      methodName,
      methodArguments,
      walletAddress,
      isEth.from ? fromAmountAbsolute : null
    );
  }

  public async createTrade(
    trade: UniswapV3Trade,
    options: { onConfirm?: (hash: string) => void; onApprove?: (hash: string | null) => void }
  ): Promise<TransactionReceipt> {
    this.providerConnectorService.checkSettings(BLOCKCHAIN_NAME.ETHEREUM);

    const walletAddress = this.providerConnectorService.address;
    await this.web3Public.checkBalance(trade.from.token, trade.from.amount, walletAddress);

    const fromToken = trade.from.token;
    const toToken = trade.to.token;
    const fromAmountAbsolute = trade.from.amount
      .multipliedBy(10 ** trade.from.token.decimals)
      .toFixed(0);
    const { toTokenWrapped, isEth } = this.getWrappedTokens(fromToken, toToken);

    const { route } = trade;
    return this.swapTokens(
      route,
      fromAmountAbsolute,
      toTokenWrapped.address,
      isEth,
      walletAddress,
      options
    );
  }

  private swapTokens(
    route: UniswapV3Route,
    fromAmountAbsolute: string,
    toTokenAddress: string,
    isEth: IsEthFromOrTo,
    walletAddress: string,
    options: { onConfirm?: (hash: string) => void }
  ): Promise<TransactionReceipt> {
    const deadline = Math.floor(Date.now() / 1000) + 60 * this.settings.deadline;
    const amountOutMin = route.outputAbsoluteAmount
      .multipliedBy(new BigNumber(1).minus(this.settings.slippageTolerance))
      .toFixed(0);

    let methodName: string;
    let methodArguments: unknown[];
    if (!isEth.to) {
      const { methodName: exactInputMethodName, methodArguments: exactInputMethodArguments } =
        UniSwapV3Service.getSwapRouterExactInputMethodParams(
          route,
          fromAmountAbsolute,
          toTokenAddress,
          amountOutMin,
          walletAddress,
          deadline
        );
      methodName = exactInputMethodName;
      methodArguments = exactInputMethodArguments;
    } else {
      const { methodName: exactInputMethodName, methodArguments: exactInputMethodArguments } =
        UniSwapV3Service.getSwapRouterExactInputMethodParams(
          route,
          fromAmountAbsolute,
          toTokenAddress,
          amountOutMin,
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
        [amountOutMin, walletAddress]
      );

      methodName = 'multicall';
      methodArguments = [[exactInputMethodEncoded, unwrapWETHMethodEncoded]];
    }

    return this.web3PrivateService.executeContractMethod(
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

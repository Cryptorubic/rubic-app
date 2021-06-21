import { Injectable } from '@angular/core';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { ErrorsOldService } from 'src/app/core/services/errors-old/errors-old.service';
import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/swaps-page-old/instant-trades/models/InstantTradeToken';
import {
  abi,
  ethToTokensEstimatedGas,
  maxTransitTokens,
  routingProviders,
  tokensToEthEstimatedGas,
  tokensToTokensEstimatedGas,
  uniSwapContracts,
  WETH
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/pancake-swap-service/pankace-swap-constants';
import { TransactionReceipt } from 'web3-eth';
import { WalletError } from 'src/app/shared/models/errors/provider/WalletError';
import { AccountError } from 'src/app/shared/models/errors/provider/AccountError';
import InsufficientFundsError from 'src/app/shared/models/errors/instant-trade/InsufficientFundsError';

interface UniSwapTrade {
  amountIn: string;
  amountOutMin: string;
  path: string[];
  to: string;
  deadline: number;
}

interface UniswapRoute {
  path: string[];
  outputAbsoluteAmount: BigNumber;
}

interface Gas {
  estimatedGas;
  gasFeeInUsd;
  gasFeeInEth;
}

enum SWAP_METHOD {
  TOKENS_TO_TOKENS = 'swapExactTokensForTokens',
  ETH_TO_TOKENS = 'swapExactETHForTokens',
  TOKENS_TO_ETH = 'swapExactTokensForETH'
}

@Injectable({
  providedIn: 'root'
})
export class PancakeSwapService {
  protected blockchain: BLOCKCHAIN_NAME;

  protected shouldCalculateGas: boolean;

  private web3Public: any;

  private slippagePercent: number;

  constructor(
    private readonly coingeckoApiService: CoingeckoApiService,
    private readonly web3Private: Web3PrivateService,
    private readonly w3Public: Web3PublicService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly errorsService: ErrorsOldService
  ) {
    useTestingModeService.isTestingMode.subscribe(value => {
      if (value) {
        this.web3Public = w3Public[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET];
      }
    });
    this.web3Public = w3Public[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];
    this.blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
    this.shouldCalculateGas = true;
    this.slippagePercent = 0.15;
  }

  public setSlippagePercent(slippagePercent: number): void {
    this.slippagePercent = slippagePercent;
  }

  public async calculateTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    gasOptimization: boolean = true
  ): Promise<any> {
    const fromTokenClone = { ...fromToken };
    const toTokenClone = { ...toToken };
    let estimatedGasPredictionMethod = 'calculateTokensToTokensGasLimit';

    if (this.web3Public.isNativeAddress(fromTokenClone.address)) {
      fromTokenClone.address = WETH.address;
      estimatedGasPredictionMethod = 'calculateEthToTokensGasLimit';
    }

    if (this.web3Public.isNativeAddress(toTokenClone.address)) {
      toTokenClone.address = WETH.address;
      estimatedGasPredictionMethod = 'calculateTokensToEthGasLimit';
    }

    const amountIn = fromAmount.multipliedBy(10 ** fromTokenClone.decimals).toFixed(0);

    const { route, gasData } = await this.getToAmountAndPath(
      gasOptimization,
      amountIn,
      fromTokenClone,
      toTokenClone,
      estimatedGasPredictionMethod
    );

    return {
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: route.outputAbsoluteAmount.div(10 ** toToken.decimals)
      },
      estimatedGas: gasData.estimatedGas,
      gasFeeInUsd: gasData.gasFeeInUsd,
      gasFeeInEth: gasData.gasFeeInEth,
      options: {
        path: route.path,
        gasOptimization
      }
    };
  }

  private async calculateTokensToTokensGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    walletAddress: string,
    deadline: number
  ): Promise<BigNumber> {
    let estimatedGas = tokensToTokensEstimatedGas[path.length - 2];
    try {
      if (walletAddress) {
        const allowance = await this.web3Public.getAllowance(
          path[0],
          walletAddress,
          uniSwapContracts.address
        );
        const balance = await this.web3Public.getTokenBalance(walletAddress, path[0]);
        if (allowance.gte(amountIn) && balance.gte(amountIn)) {
          estimatedGas = await this.web3Public.getEstimatedGas(
            abi,
            uniSwapContracts.address,
            SWAP_METHOD.TOKENS_TO_TOKENS,
            [amountIn, amountOutMin, path, walletAddress, deadline],
            walletAddress
          );
        }
      }

      return estimatedGas || tokensToTokensEstimatedGas[path.length - 2];
    } catch (e) {
      console.debug(e);
      return tokensToTokensEstimatedGas[path.length - 2];
    }
  }

  private async calculateEthToTokensGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    walletAddress: string,
    deadline: number
  ): Promise<BigNumber> {
    try {
      if (walletAddress) {
        const balance = await this.web3Public.getBalance(walletAddress);
        if (balance.gte(amountIn)) {
          const gas = await this.web3Public.getEstimatedGas(
            abi,
            uniSwapContracts.address,
            SWAP_METHOD.ETH_TO_TOKENS,
            [amountOutMin, path, walletAddress, deadline],
            walletAddress,
            amountIn
          );
          return gas || ethToTokensEstimatedGas[path.length - 2];
        }
        return ethToTokensEstimatedGas[path.length - 2];
      }
      return ethToTokensEstimatedGas[path.length - 2];
    } catch (e) {
      console.debug(e);
      return ethToTokensEstimatedGas[path.length - 2];
    }
  }

  private async calculateTokensToEthGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    walletAddress: string,
    deadline: number
  ): Promise<BigNumber> {
    let estimatedGas = tokensToEthEstimatedGas[path.length - 2];
    try {
      if (walletAddress) {
        const allowance = await this.web3Public.getAllowance(
          path[0],
          walletAddress,
          uniSwapContracts.address
        );
        const balance = await this.web3Public.getTokenBalance(walletAddress, path[0]);
        if (allowance.gte(amountIn) && balance.gte(amountIn)) {
          estimatedGas = await this.web3Public.getEstimatedGas(
            abi,
            uniSwapContracts.address,
            SWAP_METHOD.TOKENS_TO_ETH,
            [amountIn, amountOutMin, path, walletAddress, deadline],
            walletAddress
          );
        }
      }

      return estimatedGas || tokensToEthEstimatedGas[path.length - 2];
    } catch (e) {
      console.debug(e);
      return tokensToEthEstimatedGas[path.length - 2];
    }
  }

  public async createTrade(
    trade: any,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    await this.checkSettings(this.blockchain);
    await this.checkBalance(trade);

    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    const amountOutMin = trade.to.amount
      .multipliedBy(new BigNumber(1).minus(this.slippagePercent))
      .multipliedBy(10 ** trade.to.token.decimals)
      .toFixed(0);
    const { path } = trade.options;
    const to = this.providerConnectorService.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    const uniSwapTrade: UniSwapTrade = { amountIn, amountOutMin, path, to, deadline };

    if (this.web3Public.isNativeAddress(trade.from.token.address)) {
      return this.createEthToTokensTrade(uniSwapTrade, options);
    }

    if (this.web3Public.isNativeAddress(trade.to.token.address)) {
      return this.createTokensToEthTrade(uniSwapTrade, options);
    }

    return this.createTokensToTokensTrade(uniSwapTrade, options);
  }

  private async createEthToTokensTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    return this.web3Private.executeContractMethod(
      uniSwapContracts.address,
      abi,
      SWAP_METHOD.ETH_TO_TOKENS,
      [trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm,
        value: trade.amountIn
      }
    );
  }

  private async createTokensToEthTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    await this.provideAllowance(
      trade.path[0],
      new BigNumber(trade.amountIn),
      uniSwapContracts.address,
      options.onApprove
    );

    return this.web3Private.executeContractMethod(
      uniSwapContracts.address,
      abi,
      SWAP_METHOD.TOKENS_TO_ETH,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm
      }
    );
  }

  private async createTokensToTokensTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    await this.provideAllowance(
      trade.path[0],
      new BigNumber(trade.amountIn),
      uniSwapContracts.address,
      options.onApprove
    );

    return this.web3Private.executeContractMethod(
      uniSwapContracts.address,
      abi,
      SWAP_METHOD.TOKENS_TO_TOKENS,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      { onTransactionHash: options.onConfirm }
    );
  }

  private async getToAmountAndPath(
    shouldOptimiseGas: boolean,
    fromAmountAbsolute: string,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    gasCalculationMethodName: string
  ): Promise<{ route: UniswapRoute; gasData: Gas }> {
    const routes = (await this.getAllRoutes(fromAmountAbsolute, fromToken, toToken)).sort((a, b) =>
      b.outputAbsoluteAmount.gt(a.outputAbsoluteAmount) ? 1 : -1
    );
    if (shouldOptimiseGas && this.shouldCalculateGas && toToken.price) {
      return this.getOptimalRouteAndGas(
        fromAmountAbsolute,
        toToken,
        routes,
        this[gasCalculationMethodName].bind(this)
      );
    }

    const route = routes[0];

    if (this.shouldCalculateGas) {
      const to = this.providerConnectorService.address;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time\
      const ethPrice = await this.coingeckoApiService.getEtherPriceInUsd();
      const gasPrice = await this.web3Public.getGasPriceInETH();

      const amountOutMin = route.outputAbsoluteAmount
        .multipliedBy(new BigNumber(1).minus(this.slippagePercent))
        .toFixed(0);

      const estimatedGas = await this[gasCalculationMethodName].call(
        this,
        fromAmountAbsolute,
        amountOutMin,
        route.path,
        to,
        deadline
      );

      const gasFeeInEth = estimatedGas.multipliedBy(gasPrice);
      const gasFeeInUsd = gasFeeInEth.multipliedBy(ethPrice);

      return {
        route,
        gasData: {
          estimatedGas,
          gasFeeInEth,
          gasFeeInUsd
        }
      };
    }

    return {
      route,
      gasData: {
        estimatedGas: new BigNumber(0),
        gasFeeInEth: new BigNumber(0),
        gasFeeInUsd: new BigNumber(0)
      }
    };
  }

  private async getAllRoutes(
    fromAmountAbsolute: string,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ): Promise<UniswapRoute[]> {
    const vertexes: string[] = routingProviders.addresses
      .map(elem => elem.toLowerCase())
      .filter(elem => elem !== toToken.address.toLowerCase());
    const initialPath = [fromToken.address];
    const routePromises: Promise<UniswapRoute>[] = [];

    const addPath = (path: string[]) => {
      routePromises.push(
        new Promise<UniswapRoute>((resolve, reject) => {
          this.web3Public
            .callContractMethod(uniSwapContracts.address, abi, 'getAmountsOut', {
              methodArguments: [fromAmountAbsolute, path]
            })
            .then(response => {
              const amount = new BigNumber(response[response.length - 1]);
              resolve({
                outputAbsoluteAmount: amount,
                path
              });
            })
            .catch(err => {
              console.debug(err);
              reject();
            });
        })
      );
    };

    const recGraphVisitor = (path: string[], mxTransitTokens): void => {
      if (path.length === mxTransitTokens + 1) {
        addPath(path.concat(toToken.address));
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

    return (await Promise.allSettled(routePromises))
      .filter(res => res.status === 'fulfilled')
      .map((res: PromiseFulfilledResult<UniswapRoute>) => res.value);
  }

  private async getOptimalRouteAndGas(
    amountIn: string,
    toToken: InstantTradeToken,
    routes: UniswapRoute[],
    gasCalculationMethod: (
      amountIn: string,
      amountOutMin: string,
      path: string[],
      walletAddress: string,
      deadline: number
    ) => Promise<BigNumber>
  ): Promise<{ route: UniswapRoute; gasData: Gas }> {
    const to = this.providerConnectorService.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time\

    const ethPrice = await this.coingeckoApiService.getEtherPriceInUsd();
    const gasPrice = await this.web3Public.getGasPriceInETH();

    const promises: Promise<{
      route: UniswapRoute;
      gasData: Gas;
      profit: BigNumber;
    }>[] = routes.map(async route => {
      const amountOutMin = route.outputAbsoluteAmount
        .multipliedBy(new BigNumber(1).minus(this.slippagePercent))
        .toFixed(0);

      const estimatedGas = await gasCalculationMethod(
        amountIn,
        amountOutMin,
        route.path,
        to,
        deadline
      );

      const gasFeeInEth = estimatedGas.multipliedBy(gasPrice);
      const gasFeeInUsd = gasFeeInEth.multipliedBy(ethPrice);

      const profit = route.outputAbsoluteAmount
        .div(10 ** toToken.decimals)
        .multipliedBy(toToken.price)
        .minus(gasFeeInUsd);

      return {
        route,
        gasData: {
          estimatedGas,
          gasFeeInUsd,
          gasFeeInEth
        },
        profit
      };
    });

    const results = await Promise.all(promises);

    return results.sort((a, b) => (b.profit.minus(a.profit).gt(0) ? 1 : -1))[0];
  }

  protected checkSettings(selectedBlockchain: BLOCKCHAIN_NAME) {
    if (!this.providerConnectorService.isProviderActive) {
      this.errorsService.throw(new WalletError());
    }

    if (!this.providerConnectorService.address) {
      this.errorsService.throw(new AccountError());
    }
  }

  protected async checkBalance(trade: any): Promise<void> {
    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    if (this.web3Public.isNativeAddress(trade.from.token.address)) {
      const balance = await this.web3Public.getBalance(this.providerConnectorService.address, {
        inWei: true
      });
      if (balance.lt(amountIn)) {
        const formattedBalance = this.web3Public.weiToEth(balance);
        this.errorsService.throw(
          new InsufficientFundsError(
            trade.from.token.symbol,
            formattedBalance,
            trade.from.amount.toString()
          )
        );
      }
    } else {
      const tokensBalance = await this.web3Public.getTokenBalance(
        this.providerConnectorService.address,
        trade.from.token.address
      );
      if (tokensBalance.lt(amountIn)) {
        const formattedTokensBalance = tokensBalance
          .div(10 ** trade.from.token.decimals)
          .toString();
        this.errorsService.throw(
          new InsufficientFundsError(
            trade.from.token.symbol,
            formattedTokensBalance,
            trade.from.amount.toString()
          )
        );
      }
    }
  }

  protected async provideAllowance(
    tokenAddress: string,
    value: BigNumber,
    targetAddress: string,
    onApprove?: (hash: string) => void
  ): Promise<void> {
    const allowance = await this.web3Public.getAllowance(
      tokenAddress,
      this.providerConnectorService.address,
      targetAddress
    );
    if (value.gt(allowance)) {
      const uintInfinity = new BigNumber(2).pow(256).minus(1);
      await this.web3Private.approveTokens(tokenAddress, targetAddress, uintInfinity, {
        onTransactionHash: onApprove
      });
    }
  }
}

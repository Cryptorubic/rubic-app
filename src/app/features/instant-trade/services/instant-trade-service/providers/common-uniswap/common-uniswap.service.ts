import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import {
  Gas,
  GasCalculationMethod,
  SWAP_METHOD,
  UniswapRoute,
  UniSwapTrade
} from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap.types';
import { TransactionReceipt } from 'web3-eth';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import InsufficientLiquidityError from 'src/app/core/errors/models/instant-trade/insufficient-liquidity.error';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { WalletError } from 'src/app/core/errors/models/provider/WalletError';
import { AccountError } from 'src/app/core/errors/models/provider/AccountError';
import { WALLET_NAME } from 'src/app/core/header/components/header/components/wallets-modal/models/providers';
import { NetworkError } from 'src/app/core/errors/models/provider/NetworkError';
import { NotSupportedNetworkError } from 'src/app/core/errors/models/provider/NotSupportedNetwork';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import InsufficientFundsError from 'src/app/core/errors/models/instant-trade/InsufficientFundsError';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import { ItSettingsForm } from 'src/app/features/swaps/services/settings-service/settings.service';
import { AbiItem } from 'web3-utils';
import { from, Observable, of } from 'rxjs';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';

@Injectable({
  providedIn: 'root'
})
export class CommonUniswapService {
  constructor(
    private readonly web3Private: Web3PrivateService,
    public providerConnectorService: ProviderConnectorService,
    private readonly coingeckoApiService: CoingeckoApiService
  ) {}

  public getAllowance(
    tokenAddress: string,
    contractAddress: string,
    web3Public: Web3Public
  ): Observable<BigNumber> {
    if (web3Public.isNativeAddress(tokenAddress)) {
      return of(new BigNumber(Infinity));
    }
    return from(
      web3Public.getAllowance(tokenAddress, this.providerConnectorService.address, contractAddress)
    );
  }

  public async approve(
    tokenAddress: string,
    contractAddress: string,
    options: TransactionOptions
  ): Promise<void> {
    const uintInfinity = new BigNumber(2).pow(256).minus(1);
    await this.web3Private.approveTokens(tokenAddress, contractAddress, uintInfinity, options);
  }

  public async calculateTokensToTokensGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    walletAddress: string,
    deadline: number,
    contractAddress: string,
    web3Public: Web3Public,
    tokensToTokensEstimatedGas: BigNumber[],
    abi: AbiItem[]
  ): Promise<BigNumber> {
    let estimatedGas = tokensToTokensEstimatedGas[path.length - 2];
    try {
      if (walletAddress) {
        const allowance = await web3Public.getAllowance(path[0], walletAddress, contractAddress);
        const balance = await web3Public.getTokenBalance(walletAddress, path[0]);
        if (allowance.gte(amountIn) && balance.gte(amountIn)) {
          estimatedGas = await web3Public.getEstimatedGas(
            abi,
            contractAddress,
            SWAP_METHOD.TOKENS_TO_TOKENS,
            [amountIn, amountOutMin, path, walletAddress, deadline],
            walletAddress
          );
        }
      }

      return estimatedGas || tokensToTokensEstimatedGas[path.length - 2];
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.debug(e);
      return tokensToTokensEstimatedGas[path.length - 2];
    }
  }

  public async calculateEthToTokensGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    walletAddress: string,
    deadline: number,
    contractAddress: string,
    web3Public: Web3Public,
    ethToTokensEstimatedGas: BigNumber[],
    abi: AbiItem[]
  ): Promise<BigNumber> {
    try {
      if (walletAddress) {
        const balance = await web3Public.getBalance(walletAddress);
        if (balance.gte(amountIn)) {
          const gas = await web3Public.getEstimatedGas(
            abi,
            contractAddress,
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
      // tslint:disable-next-line:no-console
      console.debug(e);
      return ethToTokensEstimatedGas[path.length - 2];
    }
  }

  public async calculateTokensToEthGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    walletAddress: string,
    deadline: number,
    contractAddress: string,
    web3Public: Web3Public,
    tokensToEthEstimatedGas: BigNumber[],
    abi: AbiItem[]
  ): Promise<BigNumber> {
    let estimatedGas = tokensToEthEstimatedGas[path.length - 2];
    try {
      if (walletAddress) {
        const allowance = await web3Public.getAllowance(path[0], walletAddress, contractAddress);
        const balance = await web3Public.getTokenBalance(walletAddress, path[0]);
        if (allowance.gte(amountIn) && balance.gte(amountIn)) {
          estimatedGas = await web3Public.getEstimatedGas(
            abi,
            contractAddress,
            SWAP_METHOD.TOKENS_TO_ETH,
            [amountIn, amountOutMin, path, walletAddress, deadline],
            walletAddress
          );
        }
      }

      return estimatedGas || tokensToEthEstimatedGas[path.length - 2];
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.debug(e);
      return tokensToEthEstimatedGas[path.length - 2];
    }
  }

  public async createEthToTokensTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {},
    contractAddress: string,
    abi: AbiItem[]
  ): Promise<TransactionReceipt> {
    return this.web3Private.executeContractMethod(
      contractAddress,
      abi,
      SWAP_METHOD.ETH_TO_TOKENS,
      [trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm,
        value: trade.amountIn
      }
    );
  }

  public async createTokensToEthTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {},
    contractAddress: string,
    abi: AbiItem[]
  ): Promise<TransactionReceipt> {
    return this.web3Private.executeContractMethod(
      contractAddress,
      abi,
      SWAP_METHOD.TOKENS_TO_ETH,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      {
        onTransactionHash: options.onConfirm
      }
    );
  }

  public async createTokensToTokensTrade(
    trade: UniSwapTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {},
    contractAddress: string,
    abi: AbiItem[]
  ): Promise<TransactionReceipt> {
    return this.web3Private.executeContractMethod(
      contractAddress,
      abi,
      SWAP_METHOD.TOKENS_TO_TOKENS,
      [trade.amountIn, trade.amountOutMin, trade.path, trade.to, trade.deadline],
      { onTransactionHash: options.onConfirm }
    );
  }

  public async getToAmountAndPath(
    shouldOptimiseGas: boolean,
    fromAmountAbsolute: string,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    gasCalculationMethodName: string,
    settings: ItSettingsForm,
    web3Public: Web3Public,
    routingProviders: string[],
    contractAddress: string,
    abi: AbiItem[],
    maxTransitTokens: number,
    estimatedGasArray: BigNumber[]
  ): Promise<{ route: UniswapRoute; gasData: Gas }> {
    const allRoutes = (
      await this.getAllRoutes(
        fromAmountAbsolute,
        fromToken,
        toToken,
        routingProviders,
        contractAddress,
        web3Public,
        abi,
        maxTransitTokens
      )
    ).sort((a, b) => (b.outputAbsoluteAmount.gt(a.outputAbsoluteAmount) ? 1 : -1));
    const routes = settings.disableMultihops
      ? allRoutes.filter(el => el.path.length < 3)
      : allRoutes;

    if (routes.length === 0) {
      throw new InsufficientLiquidityError();
    }
    if (shouldOptimiseGas && toToken.price && this.providerConnectorService.isProviderActive) {
      return this.getOptimalRouteAndGas(
        fromAmountAbsolute,
        toToken,
        routes,
        this[gasCalculationMethodName],
        web3Public,
        settings,
        contractAddress,
        estimatedGasArray,
        abi
      );
    }

    const route = routes[0];

    const to =
      this.providerConnectorService.isProviderActive && this.providerConnectorService?.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * settings.deadline;
    const ethPrice = await this.coingeckoApiService.getEtherPriceInUsd();
    const gasPrice = await web3Public.getGasPriceInETH();

    const amountOutMin = route.outputAbsoluteAmount
      .multipliedBy(new BigNumber(1).minus(settings.slippageTolerance))
      .toFixed(0);

    const estimatedGas = await (this[gasCalculationMethodName] as GasCalculationMethod)(
      fromAmountAbsolute,
      amountOutMin,
      route.path,
      to,
      deadline,
      contractAddress,
      web3Public,
      estimatedGasArray,
      abi
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

  private async getAllRoutes(
    fromAmountAbsolute: string,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    routingProviders: string[],
    contractAddress: string,
    web3Public: Web3Public,
    abi: AbiItem[],
    maxTransitTokens: number
  ): Promise<UniswapRoute[]> {
    const vertexes: string[] = routingProviders
      .map(elem => elem.toLowerCase())
      .filter(elem => elem !== toToken.address.toLowerCase());
    const initialPath = [fromToken.address];
    const routePromises: Promise<UniswapRoute>[] = [];

    const addPath = (path: string[]) => {
      routePromises.push(
        new Promise<UniswapRoute>((resolve, reject) => {
          web3Public
            .callContractMethod(contractAddress, abi, 'getAmountsOut', {
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
              // tslint:disable-next-line:no-console
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
    gasCalculationMethod: GasCalculationMethod,
    web3Public: Web3Public,
    settings: ItSettingsForm,
    contractAddress: string,
    estimatedGasArray: BigNumber[],
    abi: AbiItem[]
  ): Promise<{ route: UniswapRoute; gasData: Gas }> {
    const to = this.providerConnectorService.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * settings.deadline;

    const ethPrice = await this.coingeckoApiService.getEtherPriceInUsd();
    const gasPrice = await web3Public.getGasPriceInETH();

    const promises: Promise<{
      route: UniswapRoute;
      gasData: Gas;
      profit: BigNumber;
    }>[] = routes.map(async route => {
      const amountOutMin = route.outputAbsoluteAmount
        .multipliedBy(new BigNumber(1).minus(settings.slippageTolerance))
        .toFixed(0);

      const estimatedGas = await (gasCalculationMethod as GasCalculationMethod)(
        amountIn,
        amountOutMin,
        route.path,
        to,
        deadline,
        contractAddress,
        web3Public,
        estimatedGasArray,
        abi
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

  public checkSettings(selectedBlockchain: BLOCKCHAIN_NAME) {
    if (!this.providerConnectorService.isProviderActive) {
      throw new WalletError();
    }
    if (!this.providerConnectorService.address) {
      throw new AccountError();
    }
    if (this.providerConnectorService.networkName !== selectedBlockchain) {
      if (this.providerConnectorService.networkName !== `${selectedBlockchain}_TESTNET`) {
        if (this.providerConnectorService.providerName === WALLET_NAME.METAMASK) {
          throw new NetworkError(selectedBlockchain);
        } else {
          throw new NotSupportedNetworkError(selectedBlockchain);
        }
      }
    }
  }

  async checkBalance(trade: InstantTrade, web3Public: Web3Public): Promise<void> {
    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    if (web3Public.isNativeAddress(trade.from.token.address)) {
      const balance = await web3Public.getBalance(this.providerConnectorService.address, {
        inWei: true
      });
      if (balance.lt(amountIn)) {
        const formattedBalance = web3Public.weiToEth(balance);
        throw new InsufficientFundsError(
          trade.from.token.symbol,
          formattedBalance,
          trade.from.amount.toFixed()
        );
      }
    } else {
      const tokensBalance = await web3Public.getTokenBalance(
        this.providerConnectorService.address,
        trade.from.token.address
      );
      if (tokensBalance.lt(amountIn)) {
        const formattedTokensBalance = tokensBalance.div(10 ** trade.from.token.decimals).toFixed();
        throw new InsufficientFundsError(
          trade.from.token.symbol,
          formattedTokensBalance,
          trade.from.amount.toFixed()
        );
      }
    }
  }
}

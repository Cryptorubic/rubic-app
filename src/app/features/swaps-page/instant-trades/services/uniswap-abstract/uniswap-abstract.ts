import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import InstantTradeService from '../InstantTradeService';
import InstantTrade from '../../models/InstantTrade';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import InstantTradeToken from '../../models/InstantTradeToken';
import { UseTestingModeService } from '../../../../../core/services/use-testing-mode/use-testing-mode.service';
import { CoingeckoApiService } from '../../../../../core/services/external-api/coingecko-api/coingecko-api.service';

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

export class UniswapAbstract extends InstantTradeService {
  protected tokensToTokensEstimatedGas: BigNumber[];

  protected tokensToEthEstimatedGas: BigNumber[];

  protected ethToTokensEstimatedGas: BigNumber[];

  protected slippageTolerance = 0.015; // 1.5%

  protected coingeckoApiService: CoingeckoApiService;

  protected blockchain: BLOCKCHAIN_NAME;

  protected shouldCalculateGas: boolean;

  private WETHAddress: string;

  private uniswapContractAddress: string;

  private routingProviders: string[];

  constructor(
    useTestingModeService: UseTestingModeService,
    WETH: {
      address: string;
      testnetAddress: string;
    },
    uniswapContract: {
      address: string;
      testnetAddress: string;
    },
    routingProviders: {
      addresses: string[];
      testnetAddresses: string[];
    },
    private maxTransitTokens: number,
    private abi
  ) {
    super();
    this.isTestingMode = useTestingModeService.isTestingMode;
    this.WETHAddress = WETH.address;
    this.uniswapContractAddress = uniswapContract.address;
    this.routingProviders = routingProviders.addresses;

    useTestingModeService.isTestingMode.subscribe(value => {
      if (value) {
        this.WETHAddress = WETH.testnetAddress;
        this.uniswapContractAddress = uniswapContract.testnetAddress;
        this.routingProviders = routingProviders.testnetAddresses;
      }
    });
  }

  public async calculateTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    gasOptimisation: boolean
  ): Promise<InstantTrade> {
    const fromTokenClone = { ...fromToken };
    const toTokenClone = { ...toToken };
    let estimatedGasPredictionMethod = 'calculateTokensToTokensGasLimit';

    if (this.web3Public.isNativeAddress(fromTokenClone.address)) {
      fromTokenClone.address = this.WETHAddress;
      estimatedGasPredictionMethod = 'calculateEthToTokensGasLimit';
    }

    if (this.web3Public.isNativeAddress(toTokenClone.address)) {
      toTokenClone.address = this.WETHAddress;
      estimatedGasPredictionMethod = 'calculateTokensToEthGasLimit';
    }

    const amountIn = fromAmount.multipliedBy(10 ** fromTokenClone.decimals).toFixed(0);

    const { route, gasData } = await this.getToAmountAndPath(
      gasOptimisation,
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
        gasOptimisation
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
    let estimatedGas = this.tokensToTokensEstimatedGas[path.length - 2];
    try {
      if (walletAddress) {
        const allowance = await this.web3Public.getAllowance(
          path[0],
          walletAddress,
          this.uniswapContractAddress
        );
        const balance = await this.web3Public.getTokenBalance(walletAddress, path[0]);
        if (allowance.gte(amountIn) && balance.gte(amountIn)) {
          estimatedGas = await this.web3Public.getEstimatedGas(
            this.abi,
            this.uniswapContractAddress,
            SWAP_METHOD.TOKENS_TO_TOKENS,
            [amountIn, amountOutMin, path, walletAddress, deadline],
            walletAddress
          );
        }
      }

      return estimatedGas || this.tokensToTokensEstimatedGas[path.length - 2];
    } catch (e) {
      console.debug(e);
      return this.tokensToTokensEstimatedGas[path.length - 2];
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
            this.abi,
            this.uniswapContractAddress,
            SWAP_METHOD.ETH_TO_TOKENS,
            [amountOutMin, path, walletAddress, deadline],
            walletAddress,
            amountIn
          );
          return gas || this.ethToTokensEstimatedGas[path.length - 2];
        }
        return this.ethToTokensEstimatedGas[path.length - 2];
      }
      return this.ethToTokensEstimatedGas[path.length - 2];
    } catch (e) {
      console.debug(e);
      return this.ethToTokensEstimatedGas[path.length - 2];
    }
  }

  private async calculateTokensToEthGasLimit(
    amountIn: string,
    amountOutMin: string,
    path: string[],
    walletAddress: string,
    deadline: number
  ): Promise<BigNumber> {
    let estimatedGas = this.tokensToEthEstimatedGas[path.length - 2];
    try {
      if (walletAddress) {
        const allowance = await this.web3Public.getAllowance(
          path[0],
          walletAddress,
          this.uniswapContractAddress
        );
        const balance = await this.web3Public.getTokenBalance(walletAddress, path[0]);
        if (allowance.gte(amountIn) && balance.gte(amountIn)) {
          estimatedGas = await this.web3Public.getEstimatedGas(
            this.abi,
            this.uniswapContractAddress,
            SWAP_METHOD.TOKENS_TO_ETH,
            [amountIn, amountOutMin, path, walletAddress, deadline],
            walletAddress
          );
        }
      }

      return estimatedGas || this.tokensToEthEstimatedGas[path.length - 2];
    } catch (e) {
      console.debug(e);
      return this.tokensToEthEstimatedGas[path.length - 2];
    }
  }

  public async createTrade(
    trade: InstantTrade,
    options: {
      onConfirm?: (hash: string) => void;
      onApprove?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    await this.checkSettings(this.blockchain);
    await this.checkBalance(trade);

    const amountIn = trade.from.amount.multipliedBy(10 ** trade.from.token.decimals).toFixed(0);

    const amountOutMin = trade.to.amount
      .multipliedBy(new BigNumber(1).minus(this.slippageTolerance))
      .multipliedBy(10 ** trade.to.token.decimals)
      .toFixed(0);
    const { path } = trade.options;
    const to = this.web3Private.address;
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
      this.uniswapContractAddress,
      this.abi,
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
      this.uniswapContractAddress,
      options.onApprove
    );

    return this.web3Private.executeContractMethod(
      this.uniswapContractAddress,
      this.abi,
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
      this.uniswapContractAddress,
      options.onApprove
    );

    return this.web3Private.executeContractMethod(
      this.uniswapContractAddress,
      this.abi,
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
    if (shouldOptimiseGas && this.shouldCalculateGas) {
      return this.getOptimalRouteAndGas(
        fromAmountAbsolute,
        toToken,
        routes,
        this[gasCalculationMethodName].bind(this)
      );
    }

    const route = routes[0];

    if (this.shouldCalculateGas) {
      const to = this.web3Private.address;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time\
      const ethPrice = await this.coingeckoApiService.getEtherPriceInUsd();
      const gasPrice = await this.web3Public.getGasPriceInETH();

      const amountOutMin = route.outputAbsoluteAmount
        .multipliedBy(new BigNumber(1).minus(this.slippageTolerance))
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
    const vertexes: string[] = this.routingProviders
      .map(elem => elem.toLowerCase())
      .filter(elem => elem !== toToken.address.toLowerCase());
    const initialPath = [fromToken.address];
    const routePromises: Promise<UniswapRoute>[] = [];

    const addPath = (path: string[]) => {
      routePromises.push(
        new Promise<UniswapRoute>((resolve, reject) => {
          this.web3Public
            .callContractMethod(this.uniswapContractAddress, this.abi, 'getAmountsOut', {
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

    const recGraphVisitor = (path: string[], maxTransitTokens): void => {
      if (path.length === maxTransitTokens + 1) {
        addPath(path.concat(toToken.address));
        return;
      }
      vertexes
        .filter(vertex => !path.includes(vertex))
        .forEach(vertex => {
          const extendedPath = path.concat(vertex);
          recGraphVisitor(extendedPath, maxTransitTokens);
        });
    };

    for (let i = 0; i <= this.maxTransitTokens; i++) {
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
    const to = this.web3Private.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time\

    const ethPrice = await this.coingeckoApiService.getEtherPriceInUsd();
    const gasPrice = await this.web3Public.getGasPriceInETH();

    const promises: Promise<{
      route: UniswapRoute;
      gasData: Gas;
      profit: BigNumber;
    }>[] = routes.map(async route => {
      const amountOutMin = route.outputAbsoluteAmount
        .multipliedBy(new BigNumber(1).minus(this.slippageTolerance))
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
}

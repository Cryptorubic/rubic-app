import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { factoryContractData } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/controllers/constants/factoryContractData';
import {
  routerLiquidityPoolsWithMode,
  routerTokensWithMode
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/controllers/constants/routerLiqudityPools';
import {
  FeeAmount,
  LiquidityPool
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/controllers/models/LiquidityPool';
import { poolContractAbi } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/controllers/constants/poolContractAbi';
import { UniswapV3Route } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniswapV3Route';
import { uniSwapV3Contracts } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/uni-swap-v3-constants';
import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract/types';
import { EMPTY_ADDRESS } from 'src/app/shared/constants/order-book/empty-address';

interface Immutables {
  token0: string;
  token1: string;
  fee: number;
}

interface OptionsRecGraphVisitor {
  routesLiquidityPools: LiquidityPool[];
  fromAmountAbsolute: string;
  fromTokenAddress: string;
  toTokenAddress: string;
  routesPromises: Promise<UniswapV3Route>[];
}

export class LiquidityPoolsController {
  private readonly routerTokens: {
    [symbol: string]: string;
  };

  private readonly routerLiquidityPools: LiquidityPool[];

  private readonly factoryContract;

  private readonly feeAmounts: FeeAmount[];

  constructor(private readonly web3Public: Web3Public, isTestingMode: boolean) {
    if (!isTestingMode) {
      this.routerTokens = routerTokensWithMode.mainnet;
      this.routerLiquidityPools = routerLiquidityPoolsWithMode.mainnet;
    } else {
      this.routerTokens = routerTokensWithMode.testnet;
      this.routerLiquidityPools = routerLiquidityPoolsWithMode.testnet;
    }

    this.factoryContract = this.web3Public.getContract(
      factoryContractData.address,
      factoryContractData.abi
    );
    this.feeAmounts = [500, 3000, 10000];
  }

  public static isPoolWithTokens(pool: LiquidityPool, tokenA: string, tokenB: string): boolean {
    return (
      (pool.token0.toLowerCase() === tokenA.toLowerCase() &&
        pool.token1.toLowerCase() === tokenB.toLowerCase()) ||
      (pool.token1.toLowerCase() === tokenA.toLowerCase() &&
        pool.token0.toLowerCase() === tokenB.toLowerCase())
    );
  }

  public static getContractPoolsPath(pools: LiquidityPool[], initialTokenAddress: string): string {
    let contractPath = initialTokenAddress.slice(2).toLowerCase();
    let lastTokenAddress = initialTokenAddress;
    pools.forEach(pool => {
      contractPath += pool.fee.toString(16).padStart(6, '0');
      const newTokenAddress =
        pool.token0.toLowerCase() === lastTokenAddress.toLowerCase() ? pool.token1 : pool.token0;
      contractPath += newTokenAddress.slice(2).toLowerCase();
      lastTokenAddress = newTokenAddress;
    });
    return `0x${contractPath}`;
  }

  private async getPoolImmutables(poolContract: Contract): Promise<Immutables> {
    return Promise.all([
      poolContract.methods.token0().call(),
      poolContract.methods.token1().call(),
      poolContract.methods.fee().call()
    ]).then(([token0, token1, fee]) => ({
      token0,
      token1,
      fee: parseInt(fee)
    }));
  }

  private async getPoolByAddress(poolAddress: string): Promise<LiquidityPool> {
    const foundPool = this.routerLiquidityPools.find(pool => pool.address === poolAddress);
    if (foundPool) {
      return foundPool;
    }

    try {
      const poolContract = this.web3Public.getContract(poolAddress, poolContractAbi);
      const immutables = await this.getPoolImmutables(poolContract);
      return {
        address: poolAddress,
        token0: immutables.token0,
        token1: immutables.token1,
        fee: immutables.fee as FeeAmount
      };
    } catch (err) {
      console.debug(`Pool Address: ${poolAddress}`, err);
      return null;
    }
  }

  private async getRoutesLiquidityPools(
    fromTokenAddress: string,
    toTokenAddress: string
  ): Promise<LiquidityPool[]> {
    const poolsAddressesPromises: Promise<string>[] = [];
    Object.values(this.routerTokens).forEach(routeTokenAddress => {
      this.feeAmounts.forEach(fee => {
        if (
          fromTokenAddress.toLowerCase() !== routeTokenAddress.toLowerCase() &&
          toTokenAddress.toLowerCase() !== routeTokenAddress.toLowerCase()
        ) {
          poolsAddressesPromises.push(
            this.factoryContract.methods.getPool(fromTokenAddress, routeTokenAddress, fee).call()
          );
          poolsAddressesPromises.push(
            this.factoryContract.methods.getPool(toTokenAddress, routeTokenAddress, fee).call()
          );
        }
      });
    });
    this.feeAmounts.forEach(fee => {
      poolsAddressesPromises.push(
        this.factoryContract.methods.getPool(fromTokenAddress, toTokenAddress, fee).call()
      );
    });

    const poolsAddresses = await Promise.all(poolsAddressesPromises);
    const poolsPromises = [...new Set(poolsAddresses)]
      .filter(poolAddress => poolAddress !== EMPTY_ADDRESS)
      .map(poolAddress => this.getPoolByAddress(poolAddress));
    return (await Promise.all(poolsPromises)).filter(pool => Boolean(pool));
  }

  public async getAllRoutes(
    fromAmountAbsolute: string,
    fromTokenAddress: string,
    toTokenAddress: string,
    routeMaxTransitPools: number
  ): Promise<UniswapV3Route[]> {
    const routesLiquidityPools = await this.getRoutesLiquidityPools(
      fromTokenAddress,
      toTokenAddress
    );
    const routesPromises: Promise<UniswapV3Route>[] = [];

    const optionsRecGraphVisitor: OptionsRecGraphVisitor = {
      routesLiquidityPools,
      fromTokenAddress,
      fromAmountAbsolute,
      toTokenAddress,
      routesPromises
    };

    for (let i = 0; i <= routeMaxTransitPools; i++) {
      this.recGraphVisitor(optionsRecGraphVisitor, [], fromTokenAddress, i);
    }

    return (await Promise.allSettled(routesPromises))
      .filter(res => res.status === 'fulfilled')
      .map((res: PromiseFulfilledResult<UniswapV3Route>) => res.value);
  }

  private recGraphVisitor(
    options: OptionsRecGraphVisitor,
    path: LiquidityPool[],
    lastTokenAddress: string,
    maxTransitPools: number
  ) {
    const {
      routesLiquidityPools,
      fromAmountAbsolute,
      fromTokenAddress,
      toTokenAddress,
      routesPromises
    } = options;

    if (path.length === maxTransitPools) {
      const pools = routesLiquidityPools.filter(pool =>
        LiquidityPoolsController.isPoolWithTokens(pool, lastTokenAddress, toTokenAddress)
      );
      pools.forEach(pool => {
        routesPromises.push(
          this.getRoutePromise(
            path.concat(pool),
            fromAmountAbsolute,
            fromTokenAddress,
            toTokenAddress
          )
        );
      });
      return;
    }

    routesLiquidityPools
      .filter(pool => !path.includes(pool))
      .forEach(pool => {
        if (pool.token0.toLowerCase() === lastTokenAddress.toLowerCase()) {
          const extendedPath = path.concat(pool);
          this.recGraphVisitor(options, extendedPath, pool.token1, maxTransitPools);
        }
        if (pool.token1.toLowerCase() === lastTokenAddress.toLowerCase()) {
          const extendedPath = path.concat(pool);
          this.recGraphVisitor(options, extendedPath, pool.token0, maxTransitPools);
        }
      });
  }

  private getRoutePromise(
    poolsPath: LiquidityPool[],
    fromAmountAbsolute: string,
    fromTokenAddress: string,
    toTokenAddress: string
  ): Promise<UniswapV3Route> {
    return new Promise<UniswapV3Route>((resolve, reject) => {
      let methodName: string;
      let methodArguments: unknown[];
      if (poolsPath.length === 1) {
        methodName = 'quoteExactInputSingle';
        methodArguments = [
          fromTokenAddress,
          toTokenAddress,
          poolsPath[0].fee,
          fromAmountAbsolute,
          0
        ];
      } else {
        methodName = 'quoteExactInput';
        methodArguments = [
          LiquidityPoolsController.getContractPoolsPath(poolsPath, fromTokenAddress),
          fromAmountAbsolute
        ];
      }

      this.web3Public
        .callContractMethod(
          uniSwapV3Contracts.quoter.address,
          uniSwapV3Contracts.quoter.abi,
          methodName,
          {
            methodArguments
          }
        )
        .then((response: string) => {
          resolve({
            outputAbsoluteAmount: new BigNumber(response),
            poolsPath,
            initialTokenAddress: fromTokenAddress
          });
        })
        .catch(err => {
          console.debug(err);
          reject();
        });
    });
  }
}

import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import {
  routerLiquidityPoolsWithMode,
  routerTokensNetMode
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/liquidity-pool-controller/constants/routerLiqudityPools';
import {
  FeeAmount,
  LiquidityPool
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/liquidity-pool-controller/models/LiquidityPool';
import { UniswapV3Route } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/UniswapV3Route';
import { EMPTY_ADDRESS } from 'src/app/shared/constants/blockchain/EMPTY_ADDRESS';
import {
  factoryContractAbi,
  factoryContractAddress
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/liquidity-pool-controller/constants/factoryContractData';
import { MethodData } from 'src/app/shared/models/blockchain/MethodData';
import { PCacheable } from 'ts-cacheable';
import { uniSwapV3ContractData } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/uni-swap-v3-constants';
import BigNumber from 'bignumber.js';

interface RecGraphVisitorOptions {
  routesLiquidityPools: LiquidityPool[];
  fromAmountAbsolute: string;
  fromTokenAddress: string;
  toTokenAddress: string;
}

export class LiquidityPoolsController {
  private readonly routerTokens: Record<string, string>;

  private readonly routerLiquidityPools: LiquidityPool[];

  private readonly feeAmounts: FeeAmount[];

  public static getEncodedPoolsPath(pools: LiquidityPool[], initialTokenAddress: string): string {
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

  private static getQuoterMethodData(
    poolsPath: LiquidityPool[],
    fromAmountAbsolute: string,
    fromTokenAddress: string,
    toTokenAddress: string
  ): {
    poolsPath: LiquidityPool[];
    methodData: MethodData;
  } {
    if (poolsPath.length === 1) {
      return {
        poolsPath,
        methodData: {
          methodName: 'quoteExactInputSingle',
          methodArguments: [
            fromTokenAddress,
            toTokenAddress,
            poolsPath[0].fee,
            fromAmountAbsolute,
            0
          ]
        }
      };
    }
    return {
      poolsPath,
      methodData: {
        methodName: 'quoteExactInput',
        methodArguments: [
          LiquidityPoolsController.getEncodedPoolsPath(poolsPath, fromTokenAddress),
          fromAmountAbsolute
        ]
      }
    };
  }

  constructor(private readonly web3Public: Web3Public, isTestingMode = false) {
    if (!isTestingMode) {
      this.routerTokens = routerTokensNetMode.mainnet;
      this.routerLiquidityPools = routerLiquidityPoolsWithMode.mainnet;
    } else {
      this.routerTokens = routerTokensNetMode.testnet;
      this.routerLiquidityPools = routerLiquidityPoolsWithMode.testnet;
    }

    this.feeAmounts = [500, 3000, 10000];
  }

  @PCacheable({
    maxAge: 1000 * 60 * 10
  })
  private async getAllLiquidityPools(
    fromTokenAddress: string,
    toTokenAddress: string
  ): Promise<LiquidityPool[]> {
    let getPoolMethodArguments: { tokenA: string; tokenB: string; fee: FeeAmount }[] = [];
    getPoolMethodArguments.push(
      ...Object.values(this.routerTokens)
        .filter(
          routerTokenAddress =>
            fromTokenAddress.toLowerCase() !== routerTokenAddress.toLowerCase() &&
            toTokenAddress.toLowerCase() !== routerTokenAddress.toLowerCase()
        )
        .map(routerTokenAddress =>
          this.feeAmounts
            .map(fee => [
              { tokenA: fromTokenAddress, tokenB: routerTokenAddress, fee },
              { tokenA: toTokenAddress, tokenB: routerTokenAddress, fee }
            ])
            .flat()
        )
        .flat()
    );
    getPoolMethodArguments.push(
      ...this.feeAmounts.map(fee => ({ tokenA: fromTokenAddress, tokenB: toTokenAddress, fee }))
    );
    getPoolMethodArguments = getPoolMethodArguments.filter(
      methodArguments =>
        !this.routerLiquidityPools.find(
          pool =>
            LiquidityPool.isPoolWithTokens(pool, methodArguments.tokenA, methodArguments.tokenB) &&
            pool.fee === methodArguments.fee
        )
    );

    const poolsAddresses = (
      await this.web3Public.multicallContractMethods<{ 0: string }>(
        factoryContractAddress,
        factoryContractAbi,
        getPoolMethodArguments.map(methodArguments => ({
          methodName: 'getPool',
          methodArguments: [methodArguments.tokenA, methodArguments.tokenB, methodArguments.fee]
        }))
      )
    ).map(result => result.output[0]);

    return poolsAddresses
      .map((poolAddress, index) => {
        if (poolAddress !== EMPTY_ADDRESS) {
          return new LiquidityPool(
            poolAddress,
            getPoolMethodArguments[index].tokenA,
            getPoolMethodArguments[index].tokenB,
            getPoolMethodArguments[index].fee
          );
        }
        return null;
      })
      .filter(pool => pool !== null)
      .concat(this.routerLiquidityPools);
  }

  public async getAllRoutes(
    fromAmountAbsolute: string,
    fromTokenAddress: string,
    toTokenAddress: string,
    routeMaxTransitPools: number
  ): Promise<UniswapV3Route[]> {
    const routesLiquidityPools = await this.getAllLiquidityPools(fromTokenAddress, toTokenAddress);
    const options: RecGraphVisitorOptions = {
      routesLiquidityPools,
      fromTokenAddress,
      fromAmountAbsolute,
      toTokenAddress
    };
    const quoterMethodsData = [...Array(routeMaxTransitPools + 1)]
      .map((_, index) => this.getQuoterMethodsData(options, [], fromTokenAddress, index))
      .flat();

    return this.web3Public
      .multicallContractMethods<{ 0: string }>(
        uniSwapV3ContractData.quoter.address,
        uniSwapV3ContractData.quoter.abi,
        quoterMethodsData.map(quoterMethodData => quoterMethodData.methodData)
      )
      .then(results => {
        return results
          .map((result, index) => {
            if (result.success) {
              return {
                outputAbsoluteAmount: new BigNumber(result.output[0]),
                poolsPath: quoterMethodsData[index].poolsPath,
                initialTokenAddress: fromTokenAddress
              };
            }
            return null;
          })
          .filter(route => route !== null);
      });
  }

  private getQuoterMethodsData(
    options: RecGraphVisitorOptions,
    path: LiquidityPool[],
    lastTokenAddress: string,
    maxTransitPools: number
  ): { poolsPath: LiquidityPool[]; methodData: MethodData }[] {
    const { routesLiquidityPools, fromAmountAbsolute, fromTokenAddress, toTokenAddress } = options;

    if (path.length === maxTransitPools) {
      const pools = routesLiquidityPools.filter(pool =>
        LiquidityPool.isPoolWithTokens(pool, lastTokenAddress, toTokenAddress)
      );
      return pools.map(pool =>
        LiquidityPoolsController.getQuoterMethodData(
          path.concat(pool),
          fromAmountAbsolute,
          fromTokenAddress,
          toTokenAddress
        )
      );
    }

    return routesLiquidityPools
      .filter(pool => !path.includes(pool))
      .map(pool => {
        const methodsData: { poolsPath: LiquidityPool[]; methodData: MethodData }[] = [];
        if (pool.token0.toLowerCase() === lastTokenAddress.toLowerCase()) {
          const extendedPath = path.concat(pool);
          methodsData.push(
            ...this.getQuoterMethodsData(options, extendedPath, pool.token1, maxTransitPools)
          );
        }
        if (pool.token1.toLowerCase() === lastTokenAddress.toLowerCase()) {
          const extendedPath = path.concat(pool);
          methodsData.push(
            ...this.getQuoterMethodsData(options, extendedPath, pool.token0, maxTransitPools)
          );
        }
        return methodsData;
      })
      .flat();
  }
}

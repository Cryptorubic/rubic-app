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
import { compareAddresses } from 'src/app/shared/utils/utils';
import { Web3Public } from 'src/app/core/services/blockchain/blockchain-adapters/web3/web3-public';

interface RecGraphVisitorOptions {
  routesLiquidityPools: LiquidityPool[];
  fromAmountAbsolute: string;
  fromTokenAddress: string;
  toTokenAddress: string;
}

/**
 * Works with requests, related to Uniswap v3 liquidity pools.
 */
export class LiquidityPoolsController {
  private readonly routerTokens: Record<string, string>;

  private readonly routerLiquidityPools: LiquidityPool[];

  private readonly feeAmounts: FeeAmount[];

  /**
   * Converts uni v3 route to encoded bytes string to pass it to contract.
   * Structure of encoded string: '0x${tokenAddress_0}${toHex(fee_0)}${tokenAddress_1}${toHex(fee_1)}...${tokenAddress_n}.
   * toHex(fee_i) must be of length 6, so leading zeroes are added.
   * @param pools Liquidity pools, included in route.
   * @param initialTokenAddress From token address.
   * @return string Encoded string.
   */
  public static getEncodedPoolsPath(pools: LiquidityPool[], initialTokenAddress: string): string {
    let contractPath = initialTokenAddress.slice(2).toLowerCase();
    let lastTokenAddress = initialTokenAddress;
    pools.forEach(pool => {
      contractPath += pool.fee.toString(16).padStart(6, '0');
      const newTokenAddress = compareAddresses(pool.token0, lastTokenAddress)
        ? pool.token1
        : pool.token0;
      contractPath += newTokenAddress.slice(2).toLowerCase();
      lastTokenAddress = newTokenAddress;
    });
    return `0x${contractPath}`;
  }

  /**
   * Returns swap method's name and arguments to pass it to Quoter contract.
   * @param poolsPath Pools, included in route.
   * @param fromAmountAbsolute From amount.
   * @param fromTokenAddress From token address.
   * @param toTokenAddress To token address.
   */
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

  constructor(public readonly blockchainPublicAdapter: Web3Public, isTestingMode = false) {
    this.feeAmounts = [500, 3000, 10000];

    if (!isTestingMode) {
      this.routerTokens = routerTokensNetMode.mainnet;
      this.routerLiquidityPools = routerLiquidityPoolsWithMode.mainnet;
    } else {
      this.routerTokens = routerTokensNetMode.testnet;
      this.routerLiquidityPools = routerLiquidityPoolsWithMode.testnet;
    }
  }

  /**
   * Returns all liquidity pools, containing passed tokens addresses, and concatenates with most popular pools.
   * @param firstTokenAddress First token address.
   * @param secondTokenAddress Second token address.
   */
  @PCacheable({
    maxAge: 1000 * 60 * 10
  })
  private async getAllLiquidityPools(
    firstTokenAddress: string,
    secondTokenAddress: string
  ): Promise<LiquidityPool[]> {
    let getPoolMethodArguments: { tokenA: string; tokenB: string; fee: FeeAmount }[] = [];
    getPoolMethodArguments.push(
      ...Object.values(this.routerTokens)
        .filter(
          routerTokenAddress =>
            !compareAddresses(firstTokenAddress, routerTokenAddress) &&
            !compareAddresses(secondTokenAddress, routerTokenAddress)
        )
        .map(routerTokenAddress =>
          this.feeAmounts
            .map(fee => [
              { tokenA: firstTokenAddress, tokenB: routerTokenAddress, fee },
              { tokenA: secondTokenAddress, tokenB: routerTokenAddress, fee }
            ])
            .flat()
        )
        .flat()
    );
    getPoolMethodArguments.push(
      ...this.feeAmounts.map(fee => ({
        tokenA: firstTokenAddress,
        tokenB: secondTokenAddress,
        fee
      }))
    );
    getPoolMethodArguments = getPoolMethodArguments.filter(
      methodArguments =>
        !this.routerLiquidityPools.find(
          pool =>
            pool.isPoolWithTokens(methodArguments.tokenA, methodArguments.tokenB) &&
            pool.fee === methodArguments.fee
        )
    );

    const poolsAddresses = (
      await this.blockchainPublicAdapter.multicallContractMethods<{ 0: string }>(
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

  /**
   * Returns all routes between given tokens with output amount.
   * @param fromAmountAbsolute From token amount in Wei.
   * @param fromTokenAddress From token address.
   * @param toTokenAddress To token address.
   * @param routeMaxTransitPools Max amount of transit pools.
   */
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

    return this.blockchainPublicAdapter
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

  /**
   * Returns swap methods' names and arguments, built with passed pools' addresses, to use it in Quoter contract.
   * @param options
   * @param path
   * @param lastTokenAddress
   * @param maxTransitPools
   * @private
   */
  private getQuoterMethodsData(
    options: RecGraphVisitorOptions,
    path: LiquidityPool[],
    lastTokenAddress: string,
    maxTransitPools: number
  ): { poolsPath: LiquidityPool[]; methodData: MethodData }[] {
    const { routesLiquidityPools, fromAmountAbsolute, fromTokenAddress, toTokenAddress } = options;

    if (path.length === maxTransitPools) {
      const pools = routesLiquidityPools.filter(pool =>
        pool.isPoolWithTokens(lastTokenAddress, toTokenAddress)
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
        if (compareAddresses(pool.token0, lastTokenAddress)) {
          const extendedPath = path.concat(pool);
          methodsData.push(
            ...this.getQuoterMethodsData(options, extendedPath, pool.token1, maxTransitPools)
          );
        }
        if (compareAddresses(pool.token1, lastTokenAddress)) {
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

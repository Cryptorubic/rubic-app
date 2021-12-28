import { EthLikeWeb3Public } from 'src/app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import {
  ROUTER_LIQUIDITY_POOLS_WITH_MODE,
  ROUTER_TOKENS_NET_MODE
} from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/quoter-controller/constants/router-liquidity-pools';
import {
  FeeAmount,
  LiquidityPool
} from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/quoter-controller/models/liquidity-pool';
import { EMPTY_ADDRESS } from '@shared/constants/blockchain/empty-address';
import {
  FACTORY_CONTRACT_ABI,
  FACTORY_CONTRACT_ADDRESS
} from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/quoter-controller/constants/factory-contract-data';
import { MethodData } from '@shared/models/blockchain/method-data';
import { PCacheable } from 'ts-cacheable';
import BigNumber from 'bignumber.js';
import { compareAddresses } from 'src/app/shared/utils/utils';
import { SymbolToken } from '@shared/models/tokens/symbol-token';
import { ContractData } from '@shared/models/blockchain/contract-data';
import { UniSwapV3Route } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/uni-swap-v3-instant-trade';

interface RecGraphVisitorOptions {
  routesLiquidityPools: LiquidityPool[];
  fromAmountAbsolute: string;
  fromTokenAddress: string;
  toTokenAddress: string;
}

/**
 * Works with requests, related to Uniswap v3 liquidity pools.
 */
export class UniSwapV3QuoterController {
  private routerTokens: Record<string, SymbolToken>;

  private routerLiquidityPools: LiquidityPool[];

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
      const newToken = compareAddresses(pool.token0.address, lastTokenAddress)
        ? pool.token1
        : pool.token0;
      contractPath += newToken.address.slice(2).toLowerCase();
      lastTokenAddress = newToken.address;
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
          UniSwapV3QuoterController.getEncodedPoolsPath(poolsPath, fromTokenAddress),
          fromAmountAbsolute
        ]
      }
    };
  }

  constructor(
    private readonly web3Public: EthLikeWeb3Public,
    private readonly quoterContract: ContractData
  ) {
    this.feeAmounts = [500, 3000, 10000];

    this.routerTokens = ROUTER_TOKENS_NET_MODE.mainnet;
    this.routerLiquidityPools = ROUTER_LIQUIDITY_POOLS_WITH_MODE.mainnet;
  }

  public setTestingMode(): void {
    this.routerTokens = ROUTER_TOKENS_NET_MODE.testnet;
    this.routerLiquidityPools = ROUTER_LIQUIDITY_POOLS_WITH_MODE.testnet;
  }

  /**
   * Returns all liquidity pools, containing passed tokens addresses, and concatenates with most popular pools.
   * @param firstTokenAddress First token address.
   * @param secondTokenAddress Second token address.
   * @param firstTokenSymbol First token symbol.
   * @param secondTokenSymbol Second token symbol.
   * @return Promise<LiquidityPool[]> All liquidity pools between route and given tokens.
   */
  @PCacheable({
    maxAge: 1000 * 60 * 10,
    maxCacheCount: 10
  })
  private async getAllLiquidityPools(
    firstTokenAddress: string,
    secondTokenAddress: string,
    firstTokenSymbol: string,
    secondTokenSymbol: string
  ): Promise<LiquidityPool[]> {
    const firstToken: SymbolToken = {
      address: firstTokenAddress,
      symbol: firstTokenSymbol
    };
    const secondToken: SymbolToken = {
      address: secondTokenAddress,
      symbol: secondTokenSymbol
    };

    let getPoolMethodArguments: { tokenA: SymbolToken; tokenB: SymbolToken; fee: FeeAmount }[] = [];
    getPoolMethodArguments.push(
      ...Object.values(this.routerTokens)
        .filter(
          routerToken =>
            !compareAddresses(firstTokenAddress, routerToken.address) &&
            !compareAddresses(secondTokenAddress, routerToken.address)
        )
        .map(routerToken =>
          this.feeAmounts
            .map(fee => [
              { tokenA: firstToken, tokenB: routerToken, fee },
              { tokenA: secondToken, tokenB: routerToken, fee }
            ])
            .flat()
        )
        .flat()
    );
    getPoolMethodArguments.push(
      ...this.feeAmounts.map(fee => ({
        tokenA: firstToken,
        tokenB: secondToken,
        fee
      }))
    );
    getPoolMethodArguments = getPoolMethodArguments.filter(
      methodArguments =>
        !this.routerLiquidityPools.find(
          pool =>
            pool.isPoolWithTokens(methodArguments.tokenA.address, methodArguments.tokenB.address) &&
            pool.fee === methodArguments.fee
        )
    );

    const poolsAddresses = (
      await this.web3Public.multicallContractMethods<{ 0: string }>(
        FACTORY_CONTRACT_ADDRESS,
        FACTORY_CONTRACT_ABI,
        getPoolMethodArguments.map(methodArguments => ({
          methodName: 'getPool',
          methodArguments: [
            methodArguments.tokenA.address,
            methodArguments.tokenB.address,
            methodArguments.fee
          ]
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
   * @param fromToken From token.
   * @param toToken To token.
   * @param routeMaxTransitPools Max amount of transit pools.
   */
  public async getAllRoutes(
    fromAmountAbsolute: string,
    fromToken: SymbolToken,
    toToken: SymbolToken,
    routeMaxTransitPools: number
  ): Promise<UniSwapV3Route[]> {
    const routesLiquidityPools = await this.getAllLiquidityPools(
      fromToken.address,
      toToken.address,
      fromToken.symbol,
      toToken.symbol
    );
    const options: RecGraphVisitorOptions = {
      routesLiquidityPools,
      fromTokenAddress: fromToken.address,
      fromAmountAbsolute,
      toTokenAddress: toToken.address
    };
    const quoterMethodsData = [...Array(routeMaxTransitPools + 1)]
      .map((_, index) => this.getQuoterMethodsData(options, [], fromToken.address, index))
      .flat();

    const results = await this.web3Public.multicallContractMethods<{ 0: string }>(
      this.quoterContract.address,
      this.quoterContract.abi,
      quoterMethodsData.map(quoterMethodData => quoterMethodData.methodData)
    );

    return results
      .map((result, index) => {
        if (result.success) {
          return {
            outputAbsoluteAmount: new BigNumber(result.output[0]),
            poolsPath: quoterMethodsData[index].poolsPath,
            initialTokenAddress: fromToken.address
          };
        }
        return null;
      })
      .filter(route => route !== null);
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
        UniSwapV3QuoterController.getQuoterMethodData(
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
        if (compareAddresses(pool.token0.address, lastTokenAddress)) {
          const extendedPath = path.concat(pool);
          methodsData.push(
            ...this.getQuoterMethodsData(
              options,
              extendedPath,
              pool.token1.address,
              maxTransitPools
            )
          );
        }
        if (compareAddresses(pool.token1.address, lastTokenAddress)) {
          const extendedPath = path.concat(pool);
          methodsData.push(
            ...this.getQuoterMethodsData(
              options,
              extendedPath,
              pool.token0.address,
              maxTransitPools
            )
          );
        }
        return methodsData;
      })
      .flat();
  }
}

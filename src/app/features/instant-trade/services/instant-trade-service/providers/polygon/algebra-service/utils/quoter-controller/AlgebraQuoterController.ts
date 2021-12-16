import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { MethodData } from 'src/app/shared/models/blockchain/MethodData';
import BigNumber from 'bignumber.js';
import { compareAddresses } from 'src/app/shared/utils/utils';
import { SymbolToken } from '@shared/models/tokens/SymbolToken';
import { routerTokensNetMode } from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/utils/quoter-controller/constants/routerTokens';
import { ContractData } from '@shared/models/blockchain/ContractData';
import { AlgebraRoute } from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/models/AlgebraInstantTrade';

interface RecGraphVisitorOptions {
  routesTokens: SymbolToken[];
  fromAmountAbsolute: string;
  toToken: SymbolToken;
  maxTransitTokens: number;
}

/**
 * Works with requests, related to Uniswap v3 liquidity pools.
 */
export class AlgebraQuoterController {
  private routerTokens: SymbolToken[];

  /**
   * Converts algebra route to encoded bytes string to pass it to contract.
   * Structure of encoded string: '0x${tokenAddress_0}${tokenAddress_1}...${tokenAddress_n}.
   * @param path Symbol tokens, included in route.
   * @return string Encoded string.
   */
  public static getEncodedPath(path: SymbolToken[]): string {
    const encodedPath = path.reduce(
      (accEncodedPath, token) => accEncodedPath + token.address.slice(2).toLowerCase(),
      ''
    );
    return `0x${encodedPath}`;
  }

  /**
   * Returns swap method's name and arguments to pass it to Quoter contract.
   * @param path Pools, included in route.
   * @param fromAmountAbsolute From amount.
   */
  private static getQuoterMethodData(
    path: SymbolToken[],
    fromAmountAbsolute: string
  ): {
    path: SymbolToken[];
    methodData: MethodData;
  } {
    if (path.length === 2) {
      return {
        path: path,
        methodData: {
          methodName: 'quoteExactInputSingle',
          methodArguments: [path[0].address, path[1].address, fromAmountAbsolute, 0]
        }
      };
    }
    return {
      path: path,
      methodData: {
        methodName: 'quoteExactInput',
        methodArguments: [AlgebraQuoterController.getEncodedPath(path), fromAmountAbsolute]
      }
    };
  }

  constructor(
    private readonly web3Public: Web3Public,
    private readonly quoterContract: ContractData
  ) {
    this.routerTokens = routerTokensNetMode.mainnet;
  }

  public setTestingMode(): void {
    this.routerTokens = routerTokensNetMode.testnet;
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
  ): Promise<AlgebraRoute[]> {
    const routesTokens = this.routerTokens.filter(
      token =>
        !compareAddresses(token.address, fromToken.address) &&
        !compareAddresses(token.address, toToken.address)
    );
    const options: Omit<RecGraphVisitorOptions, 'maxTransitTokens'> = {
      routesTokens,
      fromAmountAbsolute,
      toToken
    };
    const quoterMethodsData = [...Array(routeMaxTransitPools + 1)]
      .map((_, maxTransitTokens) =>
        this.getQuoterMethodsData(
          {
            ...options,
            maxTransitTokens
          },
          [fromToken]
        )
      )
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
            path: quoterMethodsData[index].path
          };
        }
        return null;
      })
      .filter(route => route !== null);
  }

  /**
   * Returns swap methods' names and arguments, built with passed pools' addresses, to use it in Quoter contract.
   */
  private getQuoterMethodsData(
    options: RecGraphVisitorOptions,
    path: SymbolToken[]
  ): { path: SymbolToken[]; methodData: MethodData }[] {
    const { routesTokens, fromAmountAbsolute, toToken, maxTransitTokens } = options;

    if (path.length === maxTransitTokens + 1) {
      return [
        AlgebraQuoterController.getQuoterMethodData(path.concat(toToken), fromAmountAbsolute)
      ];
    }

    return routesTokens
      .filter(token => !path.includes(token))
      .map(token => this.getQuoterMethodsData(options, path.concat(token)))
      .flat();
  }
}

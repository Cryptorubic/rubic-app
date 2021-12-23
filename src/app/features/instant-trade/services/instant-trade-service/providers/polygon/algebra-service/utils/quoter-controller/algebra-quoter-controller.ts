import { MethodData } from 'src/app/shared/models/blockchain/MethodData';
import BigNumber from 'bignumber.js';
import { compareAddresses } from 'src/app/shared/utils/utils';
import { SymbolToken } from '@shared/models/tokens/SymbolToken';
import { routerTokensNetMode } from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/utils/quoter-controller/constants/router-tokens';
import { ContractData } from '@shared/models/blockchain/ContractData';
import { AlgebraRoute } from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/models/algebra-instant-trade';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { ExactMethod } from '@features/instant-trade/services/instant-trade-service/models/exact-method';

interface RecGraphVisitorOptions {
  routesTokens: SymbolToken[];
  toToken: SymbolToken;
  amountAbsolute: string;
  exactMethod: ExactMethod;
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
   * @param amountAbsolute From or to amount.
   * @param exactMethod Defines which method will be used - 'input' or 'output'.
   */
  private static getQuoterMethodData(
    path: SymbolToken[],
    amountAbsolute: string,
    exactMethod: ExactMethod
  ): {
    path: SymbolToken[];
    methodData: MethodData;
  } {
    if (path.length === 2) {
      return {
        path: path,
        methodData: {
          methodName: exactMethod === 'input' ? 'quoteExactInputSingle' : 'quoteExactOutputSingle',
          methodArguments: [path[0].address, path[1].address, amountAbsolute, 0]
        }
      };
    }

    let encodedPath = AlgebraQuoterController.getEncodedPath(path);
    if (exactMethod === 'output') {
      encodedPath = '0x' + encodedPath.slice(2).split('').reverse().join('');
    }

    return {
      path: path,
      methodData: {
        methodName: exactMethod === 'input' ? 'quoteExactInput' : 'quoteExactOutput',
        methodArguments: [encodedPath, amountAbsolute]
      }
    };
  }

  constructor(
    private readonly web3Public: EthLikeWeb3Public,
    private readonly quoterContract: ContractData
  ) {
    this.routerTokens = routerTokensNetMode.mainnet;
  }

  public setTestingMode(): void {
    this.routerTokens = routerTokensNetMode.testnet;
  }

  /**
   * Returns all routes between given tokens with output amount.
   * @param fromToken From token.
   * @param toToken To token.
   * @param amountAbsolute From or to token amount in Wei.
   * @param routeMaxTransitPools Max amount of transit pools.
   * @param exactMethod Defines which method will be used - 'input' or 'output'.
   */
  public async getAllRoutes(
    fromToken: SymbolToken,
    toToken: SymbolToken,
    amountAbsolute: string,
    routeMaxTransitPools: number,
    exactMethod: ExactMethod
  ): Promise<AlgebraRoute[]> {
    const routesTokens = this.routerTokens.filter(
      token =>
        !compareAddresses(token.address, fromToken.address) &&
        !compareAddresses(token.address, toToken.address)
    );
    const options: Omit<RecGraphVisitorOptions, 'maxTransitTokens'> = {
      routesTokens,
      toToken,
      amountAbsolute,
      exactMethod
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
    const { routesTokens, toToken, amountAbsolute, exactMethod, maxTransitTokens } = options;

    if (path.length === maxTransitTokens + 1) {
      return [
        AlgebraQuoterController.getQuoterMethodData(
          path.concat(toToken),
          amountAbsolute,
          exactMethod
        )
      ];
    }

    return routesTokens
      .filter(token => !path.includes(token))
      .map(token => this.getQuoterMethodsData(options, path.concat(token)))
      .flat();
  }
}

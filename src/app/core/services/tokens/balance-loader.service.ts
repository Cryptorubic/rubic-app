import { Injectable } from '@angular/core';
import { Token } from '@app/shared/models/tokens/token';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { isTokenAmount } from '@app/shared/utils/is-token';
import BigNumber from 'bignumber.js';
import { List } from 'immutable';
import { BlockchainName, BlockchainsInfo, Injector, Web3Public, Web3Pure } from 'rubic-sdk';
import { AuthService } from '../auth/auth.service';
import pTimeout from 'rubic-sdk/lib/common/utils/p-timeout';

@Injectable({
  providedIn: 'root'
})
export class BalanceLoaderService {
  constructor(private readonly authService: AuthService) {}

  public async getTokensWithBalancesAndPatchImmediately(
    tokensList: List<TokenAmount | Token>,
    _patchTokensInGeneralList: (
      tokensWithBalances: List<TokenAmount>,
      patchAllChains: boolean
    ) => void
  ): Promise<List<TokenAmount>> {
    const tokensByChain: Record<BlockchainName | 'TOP_CHAINS', Token[]> = {} as Record<
      BlockchainName | 'TOP_CHAINS',
      Token[]
    >;
    // @TODO handle TOP_CHAINS firstly

    for (const token of tokensList) {
      const chainTokensList = tokensByChain[token.blockchain];
      if (!Array.isArray(chainTokensList)) {
        tokensByChain[token.blockchain] = [] as Token[];
      }
      if (isTokenAmount(token)) {
        tokensByChain[token.blockchain].push(token);
      } else {
        tokensByChain[token.blockchain].push(
          this.getTokensWithNullBalances(List([token]), false).get(0)
        );
      }
    }

    return List([]);
  }

  /**
   * @param tokensList list of tokens, tokens can be from different chains in same list
   * @returns list of tokens from store with balances
   */
  public async getTokensWithBalance(
    tokensList: List<TokenAmount | Token>
  ): Promise<List<TokenAmount>> {
    const tokensByChain: Record<BlockchainName, Token[]> = {} as Record<BlockchainName, Token[]>;

    for (const token of tokensList) {
      const chainTokensList = tokensByChain[token.blockchain];
      if (!Array.isArray(chainTokensList)) {
        tokensByChain[token.blockchain] = [] as Token[];
      }
      if (isTokenAmount(token)) {
        tokensByChain[token.blockchain].push(token);
      } else {
        tokensByChain[token.blockchain].push(
          this.getTokensWithNullBalances(List([token]), false).get(0)
        );
      }
    }

    try {
      const promises = Object.entries(tokensByChain).map(
        ([chain, tokens]: [BlockchainName, Token[]]) => {
          const doesWalletSupportsTokenChain =
            BlockchainsInfo.getChainType(chain) === this.authService.userChainType;
          // if EVM-address used -> it will fetch only evm address etc.
          if (!doesWalletSupportsTokenChain) return tokens.map(() => new BigNumber(NaN));

          const web3Public = Injector.web3PublicService.getWeb3Public(chain) as Web3Public;
          const chainBalancesPromise = web3Public.getTokensBalances(
            this.authService.userAddress,
            tokens.map(t => t.address)
          );

          const withTimeout = pTimeout(
            chainBalancesPromise,
            3_000,
            new Error(`chainTokensBalances_Timeout for chain ${chain}.`)
          ).catch((): Array<BigNumber> => tokens.map(() => new BigNumber(NaN)));

          return withTimeout;
        }
      );

      const resp = await Promise.all(promises);
      const allTokensBalances = resp.flat();
      const allTokensWithAmountArray = Object.values(tokensByChain)
        .flat()
        .map((token, index) => ({
          ...token,
          amount: allTokensBalances[index]
            ? Web3Pure.fromWei(allTokensBalances[index], token.decimals)
            : new BigNumber(NaN)
        })) as TokenAmount[];

      return List(allTokensWithAmountArray);
    } catch (err) {
      console.log('%cgetAllChainsTokenBalances_ERROR', 'color: red; font-size: 20px;', err);
      return List([]);
    }
  }

  /**
   * Sets default tokens params.
   * @param tokens Tokens list.
   * @param isFavorite Is tokens list favorite.
   */
  public getTokensWithNullBalances(tokens: List<Token>, isFavorite: boolean): List<TokenAmount> {
    return tokens.map(token => ({
      ...token,
      amount: new BigNumber(NaN),
      favorite: isFavorite
    }));
  }
}

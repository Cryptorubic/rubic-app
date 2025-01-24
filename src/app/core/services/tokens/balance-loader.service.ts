import { Injectable } from '@angular/core';
import { Token } from '@app/shared/models/tokens/token';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { List } from 'immutable';
import { BlockchainName, BlockchainsInfo, Injector, Web3Public, Web3Pure } from 'rubic-sdk';
import { AuthService } from '../auth/auth.service';
import pTimeout from 'rubic-sdk/lib/common/utils/p-timeout';
import { ChainsToLoadFirstly, isTopChain } from './constants/first-loaded-chains';
import { TokensUpdaterService } from './tokens-updater.service';
import { AssetType } from '@app/features/trade/models/asset';
import { BehaviorSubject } from 'rxjs';

type TokensListOfTopChainsWithOtherChains = {
  [key in BlockchainName]: Token[];
} & {
  TOP_CHAINS: {
    [key in ChainsToLoadFirstly]: Token[];
  };
};

@Injectable({
  providedIn: 'root'
})
export class BalanceLoaderService {
  constructor(
    private readonly authService: AuthService,
    private readonly tokensUpdaterService: TokensUpdaterService
  ) {}

  public updateAllChainsTokensWithBalances(
    tokensList: List<TokenAmount | Token>,
    patchTokensInGeneralList: (
      tokensWithBalances: List<TokenAmount>,
      patchAllChains: boolean
    ) => void,
    isBalanceAlreadyCalculatedForChain: Record<AssetType, boolean>,
    isBalanceLoading$: Record<AssetType, BehaviorSubject<boolean>>
  ): void {
    const tokensByChain: TokensListOfTopChainsWithOtherChains = {
      TOP_CHAINS: {}
    } as TokensListOfTopChainsWithOtherChains;

    for (const token of tokensList) {
      if (isTopChain(token.blockchain)) {
        if (!Array.isArray(tokensByChain.TOP_CHAINS[token.blockchain])) {
          tokensByChain.TOP_CHAINS[token.blockchain] = [] as Token[];
        }
        tokensByChain.TOP_CHAINS[token.blockchain].push(token);
      } else {
        if (!Array.isArray(tokensByChain[token.blockchain])) {
          tokensByChain[token.blockchain] = [] as Token[];
        }
        tokensByChain[token.blockchain].push(token);
      }
    }

    for (const key in tokensByChain) {
      if (key === 'TOP_CHAINS') {
        const topChainsTokens = tokensByChain.TOP_CHAINS;
        const promises = Object.entries(topChainsTokens).map(
          ([chain, tokens]: [BlockchainName, Token[]]) => {
            if (!this.isChainSupportedByWallet(chain)) return tokens.map(() => new BigNumber(NaN));

            const web3Public = Injector.web3PublicService.getWeb3Public(chain) as Web3Public;
            return web3Public
              .getTokensBalances(
                this.authService.userAddress,
                tokens.map(t => t.address)
              )
              .catch(() => tokens.map(() => new BigNumber(NaN)));
          }
        );

        Promise.all(promises).then(balances => {
          const flattenBalances = balances.flat();
          const flattenTokens = Object.values(topChainsTokens).flat();
          const tokensWithBalances = flattenTokens.map((token, idx) => ({
            ...token,
            amount: flattenBalances[idx]
              ? Web3Pure.fromWei(flattenBalances[idx], token.decimals)
              : new BigNumber(NaN)
          })) as TokenAmount[];

          patchTokensInGeneralList(List(tokensWithBalances), true);
          this.tokensUpdaterService.triggerUpdateTokens();

          isBalanceAlreadyCalculatedForChain.allChains = true;
          isBalanceLoading$.allChains.next(false);
        });
      } else {
        const chain = key as Exclude<keyof TokensListOfTopChainsWithOtherChains, 'TOP_CHAINS'>;
        const chainTokens = tokensByChain[chain];
        const web3Public = Injector.web3PublicService.getWeb3Public(chain) as Web3Public;

        web3Public
          .getTokensBalances(
            this.authService.userAddress,
            chainTokens.map(t => t.address)
          )
          .catch(() => chainTokens.map(() => new BigNumber(NaN)))
          .then(balances => {
            const tokensWithBalances = chainTokens.map((token, idx) => ({
              ...token,
              amount: balances[idx]
                ? Web3Pure.fromWei(balances[idx], token.decimals)
                : new BigNumber(NaN)
            })) as TokenAmount[];

            patchTokensInGeneralList(List(tokensWithBalances), true);
            this.tokensUpdaterService.triggerUpdateTokens();
          });
      }
    }
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
      tokensByChain[token.blockchain].push(token);
    }

    try {
      const promises = Object.entries(tokensByChain).map(
        ([chain, tokens]: [BlockchainName, Token[]]) => {
          if (!this.isChainSupportedByWallet(chain)) return tokens.map(() => new BigNumber(NaN));

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

  /* if EVM-address used -> it will fetch only evm address etc. */
  private isChainSupportedByWallet(chain: BlockchainName): boolean {
    return BlockchainsInfo.getChainType(chain) === this.authService.userChainType;
  }
}

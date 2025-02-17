import { Injectable } from '@angular/core';
import { Token } from '@app/shared/models/tokens/token';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { List } from 'immutable';
import { BlockchainName, BlockchainsInfo, Injector, Web3Public, Web3Pure } from 'rubic-sdk';
import { AuthService } from '../auth/auth.service';
import { ChainsToLoadFirstly, isTopChain } from './constants/first-loaded-chains';
import { BalanceLoadingStateService } from './balance-loading-state.service';
import { AssetType } from '@app/features/trade/models/asset';
import { getWeb3PublicSafe } from '@app/shared/utils/is-native-address-safe';

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
    private readonly balanceLoadingStateService: BalanceLoadingStateService
  ) {}

  public updateBalancesForAllChains(
    tokensList: List<TokenAmount | Token>,
    onBalanceLoaded: (tokensWithBalances: List<TokenAmount>, patchAllChains: boolean) => void
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

    this.balanceLoadingStateService.setBalanceLoading('allChains', true);

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

          onBalanceLoaded(List(tokensWithBalances), true);
          this.balanceLoadingStateService.setBalanceCalculated('allChains', true);
          this.balanceLoadingStateService.setBalanceLoading('allChains', false);
        });
      } else {
        const chain = key as Exclude<keyof TokensListOfTopChainsWithOtherChains, 'TOP_CHAINS'>;
        const chainTokens = tokensByChain[chain];
        const web3Public = getWeb3PublicSafe(chain);

        const balancesPromise = web3Public
          ? web3Public
              .getTokensBalances(
                this.authService.userAddress,
                chainTokens.map(t => t.address)
              )
              .catch(() => chainTokens.map(() => new BigNumber(NaN)))
          : Promise.resolve(chainTokens.map(() => new BigNumber(NaN)));

        balancesPromise.then(balances => {
          const tokensWithBalances = chainTokens.map((token, idx) => ({
            ...token,
            amount: balances[idx]
              ? Web3Pure.fromWei(balances[idx], token.decimals)
              : new BigNumber(NaN)
          })) as TokenAmount[];

          onBalanceLoaded(List(tokensWithBalances), true);
        });
      }
    }
  }

  public async updateBalancesForSpecificChain(
    tokensList: List<Token>,
    blockchain: AssetType,
    onBalanceLoaded: (tokensWithBalances: List<TokenAmount>, patchAllChains: boolean) => void
  ): Promise<void> {
    this.balanceLoadingStateService.setBalanceLoading(blockchain, true);
    const tokensWithBalances = await this.getTokensWithBalance(tokensList);

    onBalanceLoaded(tokensWithBalances, false);
    this.balanceLoadingStateService.setBalanceCalculated(blockchain, true);
    this.balanceLoadingStateService.setBalanceLoading(blockchain, false);
  }

  /**
   * @param tokensList list of tokens, tokens can be from different chains in same list
   * @returns list of tokens from store with balances
   */
  public async getTokensWithBalance(tokensList: List<Token>): Promise<List<TokenAmount>> {
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
          const chainBalancesPromise = web3Public
            .getTokensBalances(
              this.authService.userAddress,
              tokens.map(t => t.address)
            )
            .catch((): Array<BigNumber> => tokens.map(() => new BigNumber(NaN)));

          return chainBalancesPromise;
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
    try {
      return BlockchainsInfo.getChainType(chain) === this.authService.userChainType;
    } catch {
      return false;
    }
  }
}

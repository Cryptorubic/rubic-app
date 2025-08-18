import { Injectable } from '@angular/core';
import { Token } from '@app/shared/models/tokens/token';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { List } from 'immutable';
import {
  BlockchainName,
  BlockchainsInfo,
  Injector,
  waitFor,
  Web3Public,
  Web3Pure
} from '@cryptorubic/sdk';
import { AuthService } from '../auth/auth.service';
import { ChainsToLoadFirstly, isTopChain } from './constants/first-loaded-chains';
import { BalanceLoadingStateService } from './balance-loading-state.service';
import { AssetType } from '@app/features/trade/models/asset';
import { getWeb3PublicSafe } from '@app/shared/utils/is-native-address-safe';
import { AssetsSelectorStateService } from '@app/features/trade/components/assets-selector/services/assets-selector-state/assets-selector-state.service';
import { BalanceLoadingAssetData } from './models/balance-loading-types';
import { TokenFilter } from '@app/features/trade/components/assets-selector/models/token-filters';
import { Iterable } from './utils/iterable';

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
    private readonly balanceLoadingStateService: BalanceLoadingStateService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService
  ) {}

  public updateBalancesForAllChains(
    tokensList: List<TokenAmount | Token>,
    options: {
      allChainsFilterToPatch?: TokenFilter;
      onChainLoaded: (tokensWithBalances: List<TokenAmount>) => void;
      onFinish?: (allChainsTokensWithBalances: List<TokenAmount>) => void;
    }
  ): void {
    //  can be empty when v2/tokens/allchains response lower then first startBalanceCalculating call in app.component.ts
    if (!tokensList.size) return;

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

    const assetDataForBalanceStatus = {
      assetType: this.assetsSelectorStateService.assetType,
      tokenFilter: options.allChainsFilterToPatch ?? this.assetsSelectorStateService.tokenFilter
    } as BalanceLoadingAssetData;

    this.balanceLoadingStateService.setBalanceLoading(assetDataForBalanceStatus, true);

    const allTokensWithPositiveBalances = List([]).asMutable() as List<TokenAmount>;
    const chainsCount = Object.keys(tokensByChain).length;
    const iterator = new Iterable(chainsCount);

    // calls onFinish() when every chain from tokensByChain loaded tokens with balances
    if (options.onFinish) {
      (async () => {
        while (!iterator.done && !!this.authService.userAddress) {
          await waitFor(100);
        }
        options.onFinish(allTokensWithPositiveBalances);
      })();
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

        Promise.all(promises)
          .then(balances => {
            const flattenBalances = balances.flat();
            const flattenTokens = Object.values(topChainsTokens).flat();
            const tokensWithBalancesList = List(
              flattenTokens.map((token, idx) => ({
                ...token,
                amount: flattenBalances[idx]
                  ? Web3Pure.fromWei(flattenBalances[idx], token.decimals)
                  : new BigNumber(NaN)
              })) as TokenAmount[]
            );

            const tokensWithPositiveBalances = tokensWithBalancesList.filter(
              t => !t.amount.isNaN() && t.amount.gt(0)
            );
            allTokensWithPositiveBalances.concat(tokensWithPositiveBalances);

            if (balances.length) {
              this.balanceLoadingStateService.setBalanceCalculated(assetDataForBalanceStatus, true);
              this.balanceLoadingStateService.setBalanceLoading(assetDataForBalanceStatus, false);
            }

            options.onChainLoaded(tokensWithBalancesList);
          })
          .finally(() => iterator.next());
      } else {
        const chain = key as Exclude<keyof TokensListOfTopChainsWithOtherChains, 'TOP_CHAINS'>;
        const chainTokens = tokensByChain[chain];
        const web3Public = getWeb3PublicSafe(chain, this.authService.userAddress);

        const balancesPromise = web3Public.then(chainAdapter => {
          if (!chainAdapter) {
            return chainTokens.map(() => new BigNumber(NaN));
          }
          return chainAdapter
            .getTokensBalances(
              this.authService.userAddress,
              chainTokens.map(t => t.address)
            )
            .catch(() => chainTokens.map(() => new BigNumber(NaN)));
        });

        balancesPromise
          .then(balances => {
            const tokensWithBalancesList = List(
              chainTokens.map((token, idx) => ({
                ...token,
                amount: balances[idx]
                  ? Web3Pure.fromWei(balances[idx], token.decimals)
                  : new BigNumber(NaN)
              })) as TokenAmount[]
            );

            const tokensWithPositiveBalances = tokensWithBalancesList.filter(
              t => !t.amount.isNaN() && t.amount.gt(0)
            );
            allTokensWithPositiveBalances.concat(tokensWithPositiveBalances);

            options.onChainLoaded(tokensWithBalancesList);
          })
          .finally(() => iterator.next());
      }
    }
  }

  public async updateBalancesForSpecificChain(
    tokensList: List<Token>,
    blockchain: AssetType,
    onFinish: (tokensWithBalances: List<TokenAmount>) => void
  ): Promise<void> {
    this.balanceLoadingStateService.setBalanceLoading({ assetType: blockchain }, true);
    const tokensWithBalances = await this.getTokensWithBalance(tokensList);

    this.balanceLoadingStateService.setBalanceCalculated({ assetType: blockchain }, true);
    this.balanceLoadingStateService.setBalanceLoading({ assetType: blockchain }, false);
    onFinish(tokensWithBalances);
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

  /* if EVM-wallet used -> it will fetch only evm addresses etc. */
  private isChainSupportedByWallet(chain: BlockchainName): boolean {
    try {
      return BlockchainsInfo.getChainType(chain) === this.authService.userChainType;
    } catch {
      return false;
    }
  }
}

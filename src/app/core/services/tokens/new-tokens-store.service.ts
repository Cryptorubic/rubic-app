import { Injectable } from '@angular/core';
import { Token } from '@shared/models/tokens/token';
import {
  BlockchainUtilityState,
  TokenRef,
  TokensState
} from '@core/services/tokens/models/new-token-types';
import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';
import { BehaviorSubject, combineLatest, combineLatestWith } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';

@Injectable({
  providedIn: 'root'
})
export class NewTokensStoreService {
  public readonly tokens = this.createTokenStore();

  public allTokens$ = combineLatest([...Object.values(this.tokens).map(t => t.tokens$)]).pipe(
    map(([...allArrays]) => {
      const allTokens = allArrays.flat();
      return allTokens;
    })
  );

  constructor(private readonly apiService: NewTokensApiService) {}

  public addInitialBlockchainTokens(
    blockchain: BlockchainName,
    tokens: { list: Token[]; total: number; haveMore: boolean }
  ): void {
    try {
      const chainObject = this.tokens[blockchain];

      chainObject._pageLoading$.next(true);
      const currentTokens = chainObject._tokensObject$;

      const newValues = tokens.list
        .sort((a, b) => {
          const aTotalRank = a.rank * (a?.networkRank || 1);
          const bTotalRank = b.rank * (b?.networkRank || 1);
          return aTotalRank > bTotalRank ? -1 : 1;
        })
        .reduce((acc, token) => ({ ...acc, [token.address]: token }), {});
      currentTokens.next({ ...currentTokens.value, ...newValues });
      chainObject._pageLoading$.next(false);
      chainObject.page = chainObject.page + 1;
      chainObject.totalTokens = tokens.total;
      chainObject.allowFetching = tokens.haveMore;
    } catch (err) {
      console.error(err);
    }
  }

  public addNewBlockchainTokens(blockchain: BlockchainName, tokens: ReadonlyArray<Token>): void {
    const currentTokens = this.tokens[blockchain]._tokensObject$;
    const newValues = tokens.reduce((acc, token) => ({ ...acc, [token.address]: token }), {});
    currentTokens.next({ ...currentTokens.value, ...newValues });
  }

  public addBlockchainBalanceTokens(blockchain: BlockchainName, tokens: BalanceToken[]): void {
    const currentTokens = this.tokens[blockchain]._tokensObject$;
    const newValues = tokens.reduce((acc, token) => ({ ...acc, [token.address]: token }), {});
    currentTokens.next({ ...currentTokens.value, ...newValues });
  }

  public updateBlockchainTokens(blockchain: BlockchainName, newTokens: ReadonlyArray<Token>): void {
    const tokens = this.tokens[blockchain]._tokensObject$;
    newTokens.forEach(token => {
      if (tokens.value[token.address]) {
        tokens.value[token.address] = { ...tokens.value[token.address], ...token };
      }
    });
    tokens.next(tokens.value);
  }

  // updateTokens(tokens: ReadonlyArray<Token>): void;
  //
  // clearBalances(): void {
  //   return Object.values(BLOCKCHAIN_NAME).forEach(blockchain => {
  //     const tokens = this.tokens[blockchain]._tokens$.value;
  //     Object.values(tokens).forEach(token => (token.b = undefined)
  //   });
  // }

  private createBlockchainUtilityStore(): BlockchainUtilityState {
    return Object.values(BLOCKCHAIN_NAME).reduce((acc, blockchain) => {
      const tokensSubject$ = new BehaviorSubject<Record<string, BalanceToken>>({});
      const loadingSubject$ = new BehaviorSubject(true);
      const balanceLoadingSubject$ = new BehaviorSubject(false);

      acc[blockchain] = {
        _pageLoading$: loadingSubject$,
        pageLoading$: loadingSubject$.asObservable(),

        _balanceLoading$: balanceLoadingSubject$,
        balanceLoading$: balanceLoadingSubject$.asObservable(),

        blockchain,

        _tokensObject$: tokensSubject$,
        tokensObject$: tokensSubject$.asObservable(),
        tokens$: tokensSubject$.asObservable().pipe(map(el => Object.values(el)))
      };
      return acc;
    }, {} as unknown as BlockchainUtilityState);
  }

  private createTokenStore(): TokensState {
    return Object.values(BLOCKCHAIN_NAME).reduce((acc, blockchain) => {
      const tokensSubject$ = new BehaviorSubject<Record<string, BalanceToken>>({});
      const loadingSubject$ = new BehaviorSubject(true);
      const balanceLoadingSubject$ = new BehaviorSubject(false);
      const searchRefsSubject$ = new BehaviorSubject<TokenRef[]>([]);
      const searchQuerySubject$ = new BehaviorSubject<string>('');
      const searchQuery$ = searchQuerySubject$.asObservable();

      acc[blockchain] = {
        _pageLoading$: loadingSubject$,
        pageLoading$: loadingSubject$.asObservable().pipe(distinctUntilChanged()),

        _balanceLoading$: balanceLoadingSubject$,
        balanceLoading$: balanceLoadingSubject$.asObservable().pipe(distinctUntilChanged()),

        blockchain,

        _tokensObject$: tokensSubject$,
        tokensObject$: tokensSubject$.asObservable(),
        tokens$: tokensSubject$.asObservable().pipe(
          combineLatestWith(searchQuery$),
          switchMap(([tokens, searchQuery]) => {
            const allTokens = Object.values(tokens);
            if (searchQuery && searchQuery.length > 2) {
              const filteredTokens = allTokens.filter(
                token =>
                  token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  token.address.toLowerCase().includes(searchQuery.toLowerCase())
              );
              return [filteredTokens];
            }
            return [allTokens];
          })
        ),

        _searchRefs$: searchRefsSubject$,
        searchRefs$: searchRefsSubject$.asObservable(),
        _searchQuery$: searchQuerySubject$,
        searchQuery$: searchQuery$,

        totalTokens: null,
        page: 0,
        allowFetching: true,
        getTokens: () => tokensSubject$.getValue()
      };
      return acc;
    }, {} as unknown as TokensState);
  }

  public getAllTokens(): BalanceToken[] {
    return Object.values(this.tokens).reduce((acc, chainStore) => {
      return [...acc, ...Object.values(chainStore._tokensObject$.getValue())];
    }, []);
  }

  public clearAllBalances(): void {
    Object.values(this.tokens).forEach(chainStore => {
      const tokens = chainStore._tokensObject$.getValue();
      Object.keys(tokens).forEach(address => {
        tokens[address].amount = new BigNumber(NaN);
      });
      chainStore._tokensObject$.next(tokens);
    });
  }

  public setQueryAndFetch(blockchain: BlockchainName, query: string): void {
    this.tokens[blockchain]._searchQuery$.next(query);
    this.fetchQueryTokens(query, blockchain);
  }

  private fetchQueryTokens(query: string, blockchain: BlockchainName): void {
    const tokensObject = this.tokens[blockchain];

    tokensObject._pageLoading$.next(true);
    this.apiService
      .fetchQueryTokens(query, blockchain)
      .pipe(
        tap(tokens => {
          const refs = tokens.map(token => ({
            blockchain: token.blockchain,
            address: token.address
          }));
          tokensObject._searchRefs$.next(refs);

          const chainTokens: Partial<Record<BlockchainName, Token[]>> = {};
          tokens.forEach(token => {
            if (!chainTokens[token.blockchain]) {
              chainTokens[token.blockchain] = [];
            }
            chainTokens[token.blockchain].push(token);
          });
          Object.entries(chainTokens).forEach(
            ([chain, blockchainTokens]: [BlockchainName, Token[]]) => {
              this.addNewBlockchainTokens(chain, blockchainTokens);
            }
          );

          tokensObject._pageLoading$.next(false);
        })
      )
      .subscribe();
  }
}

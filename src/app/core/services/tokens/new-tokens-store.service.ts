import { Injectable } from '@angular/core';
import { Token } from '@shared/models/tokens/token';
import {
  BlockchainUtilityState,
  TokenRef,
  TokensState,
  UtilityState
} from '@core/services/tokens/models/new-token-types';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { BehaviorSubject, combineLatestWith } from 'rxjs';
import { BlockchainName } from '@cryptorubic/sdk';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NewTokensStoreService {
  public readonly tokens = this.createTokenStore();

  public readonly gainers = this.createUtilityStore();

  public readonly losers = this.createUtilityStore();

  public readonly favorite = this.createUtilityStore();

  public readonly trending = this.createUtilityStore();

  public readonly searched = this.createUtilityStore();

  public readonly all = this.createUtilityStore();

  constructor() {}

  public addInitialBlockchainTokens(
    blockchain: BlockchainName,
    tokens: { list: Token[]; total: number; haveMore: boolean }
  ): void {
    try {
      const chainObject = this.tokens[blockchain];

      chainObject._pageLoading$.next(true);
      const currentTokens = chainObject._tokensObject$;

      const newValues = tokens.list.reduce(
        (acc, token) => ({ ...acc, [token.address]: token }),
        {}
      );
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

      acc[blockchain] = {
        _pageLoading$: loadingSubject$,
        pageLoading$: loadingSubject$.asObservable(),

        _balanceLoading$: balanceLoadingSubject$,
        balanceLoading$: balanceLoadingSubject$.asObservable(),

        blockchain,

        _tokensObject$: tokensSubject$,
        tokensObject$: tokensSubject$.asObservable(),
        tokens$: tokensSubject$.asObservable().pipe(map(el => Object.values(el))),

        totalTokens: null,
        page: 0,
        allowFetching: true
      };
      return acc;
    }, {} as unknown as TokensState);
  }

  private createUtilityStore(): UtilityState {
    const loadingSubject$ = new BehaviorSubject(true);
    const balanceLoadingSubject$ = new BehaviorSubject(false);
    const refsSubject$ = new BehaviorSubject<TokenRef[]>([]);

    return {
      _pageLoading$: loadingSubject$,
      pageLoading$: loadingSubject$.asObservable(),

      _balanceLoading$: balanceLoadingSubject$,
      balanceLoading$: balanceLoadingSubject$.asObservable(),

      _refs$: refsSubject$,
      refs$: refsSubject$.asObservable(),

      tokens$: refsSubject$.asObservable().pipe(
        combineLatestWith(
          ...Object.values(this.tokens).map(t =>
            t.tokens$.pipe(map(el => ({ chain: t.blockchain, list: el })))
          )
        ),
        map(([utilityTokens, ...allTokens]) => {
          return utilityTokens.map(ref => {
            const chainTokens = allTokens.find(el => el.chain === ref.blockchain)!;
            const foundToken = chainTokens.list.find(t => t.address === ref.address);

            if (!foundToken) {
              throw new Error(
                `Token not found in all tokens store: ${ref.blockchain} - ${ref.address}`
              );
            }
            return foundToken;
          });
        })
      )
    };
  }
}

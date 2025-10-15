import { Injectable } from '@angular/core';
import { Token } from '@shared/models/tokens/token';
import { TokensState, UtilityState } from '@core/services/tokens/models/new-token-types';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { BehaviorSubject } from 'rxjs';
import { BlockchainName } from '@cryptorubic/sdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';

@Injectable({
  providedIn: 'root'
})
export class NewTokensStoreService {
  public readonly tokens = this.createTokenStore();

  public readonly gainers = this.createUtilityStore();

  public readonly losers = this.createUtilityStore();

  public readonly trending = this.createUtilityStore();

  public readonly all = this.createUtilityStore();

  constructor() {}

  public addInitialBlockchainTokens(
    blockchain: BlockchainName,
    tokens: ReadonlyArray<Token>
  ): void {
    try {
      this.tokens[blockchain]._loading$.next(true);
      const currentTokens = this.tokens[blockchain]._tokens$;
      const newValues = tokens.reduce((acc, token) => ({ ...acc, [token.address]: token }), {});
      currentTokens.next({ ...currentTokens.value, ...newValues });
      this.tokens[blockchain]._loading$.next(false);
      console.log(`tokens added to ${blockchain} store`);
    } catch (err) {
      console.log(err);
    }
  }

  public addNewBlockchainTokens(blockchain: BlockchainName, tokens: ReadonlyArray<Token>): void {
    const currentTokens = this.tokens[blockchain]._tokens$;
    const newValues = tokens.reduce((acc, token) => ({ ...acc, [token.address]: token }), {});
    currentTokens.next({ ...currentTokens.value, ...newValues });
  }

  public updateBlockchainTokens(blockchain: BlockchainName, newTokens: ReadonlyArray<Token>): void {
    const tokens = this.tokens[blockchain]._tokens$;
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

  private createTokenStore(): TokensState {
    return Object.values(BLOCKCHAIN_NAME).reduce((acc, blockchain) => {
      const tokensSubject$ = new BehaviorSubject<Record<string, TokenAmount>>({});
      const loadingSubject$ = new BehaviorSubject(true);
      acc[blockchain] = {
        _loading$: loadingSubject$,
        loading$: loadingSubject$.asObservable(),

        _tokens$: tokensSubject$,
        tokens$: tokensSubject$.asObservable(),

        totalTokens: null,
        page: 1
      };
      return acc;
    }, {} as unknown as TokensState);
  }

  private createUtilityStore(): UtilityState {
    const loadingSubject$ = new BehaviorSubject(true);

    return {
      _loading$: loadingSubject$,
      loading$: loadingSubject$.asObservable(),

      refs: [],
      tokens$: new BehaviorSubject<TokenAmount[]>([]).asObservable()
    };
  }
}

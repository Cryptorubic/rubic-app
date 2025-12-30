import { Token } from '@shared/models/tokens/token';
import { BehaviorSubject, Observable } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { BlockchainName } from '@cryptorubic/core';

export interface TokenRef {
  readonly blockchain: BlockchainName;
  readonly address: string;
}

export type BlockchainTokenState = {
  readonly _pageLoading$: BehaviorSubject<boolean>;
  readonly pageLoading$: Observable<boolean>;

  readonly _balanceLoading$: BehaviorSubject<boolean>;
  readonly balanceLoading$: Observable<boolean>;

  readonly _tokensObject$: BehaviorSubject<Record<string, BalanceToken>>;
  readonly tokensObject$: Observable<Record<string, BalanceToken>>;
  readonly tokens$: Observable<BalanceToken[]>;

  readonly _searchRefs$: BehaviorSubject<TokenRef[]>;
  readonly searchRefs$: Observable<TokenRef[]>;
  readonly _searchQuery$: BehaviorSubject<string>;
  readonly searchQuery$: Observable<string>;

  readonly blockchain: BlockchainName;
  totalTokens: number | null;
  page: number;
  allowFetching: boolean;
  getTokens: () => Record<string, BalanceToken>;
};

export type BlockchainUtilityTokenState = {
  readonly _pageLoading$: BehaviorSubject<boolean>;
  readonly pageLoading$: Observable<boolean>;

  readonly _balanceLoading$: BehaviorSubject<boolean>;
  readonly balanceLoading$: Observable<boolean>;

  readonly _tokensObject$: BehaviorSubject<Record<string, BalanceToken>>;
  readonly tokensObject$: Observable<Record<string, BalanceToken>>;
  readonly tokens$: Observable<BalanceToken[]>;

  readonly blockchain: BlockchainName;
};

export type TokensState = Record<BlockchainName, BlockchainTokenState>;

export type UtilityState = {
  readonly _pageLoading$: BehaviorSubject<boolean>;
  readonly pageLoading$: Observable<boolean>;

  readonly _balanceLoading$: BehaviorSubject<boolean>;
  readonly balanceLoading$: Observable<boolean>;

  readonly _refs$: BehaviorSubject<TokenRef[]>;
  readonly refs$: Observable<TokenRef[]>;

  readonly tokens$: Observable<BalanceToken[]>;
};

export type BlockchainUtilityState = Record<BlockchainName, BlockchainUtilityTokenState>;

export interface TokensStore {
  tokens: TokensState;
  gainers: UtilityState;
  losers: UtilityState;
  trending: UtilityState;
  popular: UtilityState;

  addTokens(tokens: ReadonlyArray<Token>): void;

  updateTokens(tokens: ReadonlyArray<Token>): void;

  clearBalances(): void;
}

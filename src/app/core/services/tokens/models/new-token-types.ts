import { BlockchainName } from '@cryptorubic/sdk';
import { Token } from '@shared/models/tokens/token';
import { BehaviorSubject, Observable } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';

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

  readonly blockchain: BlockchainName;
  totalTokens: number | null;
  page: number;
  allowFetching: boolean;
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

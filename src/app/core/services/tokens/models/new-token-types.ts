import { BlockchainName } from '@cryptorubic/sdk';
import { Token } from '@shared/models/tokens/token';
import { BehaviorSubject, Observable } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';

export interface TokenRef {
  readonly blockchain: BlockchainName;
  readonly address: string;
}

export type TokensState = Record<
  BlockchainName,
  {
    readonly _loading$: BehaviorSubject<boolean>;
    readonly loading$: Observable<boolean>;

    readonly _tokens$: BehaviorSubject<Record<string, BalanceToken>>;
    readonly tokens$: Observable<Record<string, BalanceToken>>;

    totalTokens: number | null;
    page: number;
  }
>;

export type UtilityState = {
  readonly _loading$: BehaviorSubject<boolean>;
  readonly loading$: Observable<boolean>;

  readonly refs: TokenRef[];
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

import { BlockchainName } from '@cryptorubic/sdk';
import { Token } from '@shared/models/tokens/token';
import { BehaviorSubject, Observable } from 'rxjs';
import { TokenAmount } from '@shared/models/tokens/token-amount';

export interface TokenRef {
  readonly blockchain: BlockchainName;
  readonly address: string;
}

export type TokensState = Record<
  BlockchainName,
  {
    readonly _loading$: BehaviorSubject<boolean>;
    readonly loading$: Observable<boolean>;

    readonly _tokens$: BehaviorSubject<Record<string, TokenAmount>>;
    readonly tokens$: Observable<Record<string, TokenAmount>>;
  }
>;

export type UtilityState = {
  readonly _loading$: BehaviorSubject<boolean>;
  readonly loading$: Observable<boolean>;

  readonly refs: TokenRef[];
  readonly tokens$: Observable<TokenAmount[]>;
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

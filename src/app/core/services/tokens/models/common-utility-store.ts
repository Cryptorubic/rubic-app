import { TokenRef } from '@core/services/tokens/models/new-token-types';
import { auditTime, BehaviorSubject, combineLatestWith, Observable } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { RatedToken, Token } from '@shared/models/tokens/token';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { BlockchainName } from '@cryptorubic/core';

export abstract class CommonUtilityStore {
  protected readonly useLocalSearch: boolean = true;

  protected readonly _pageLoading$ = new BehaviorSubject(true);

  public readonly pageLoading$ = this._pageLoading$.asObservable();

  protected readonly _balanceLoading$ = new BehaviorSubject(false);

  public readonly balanceLoading$ = this._balanceLoading$.asObservable();

  protected readonly _storedRefs$ = new BehaviorSubject<TokenRef[]>([]);

  public readonly storedRefs$ = this._storedRefs$.asObservable();

  protected readonly _searchRefs$ = new BehaviorSubject<TokenRef[]>([]);

  public readonly searchRefs$ = this._searchRefs$.asObservable();

  protected readonly _searchQuery$ = new BehaviorSubject('');

  public readonly searchQuery$ = this._searchQuery$.asObservable();

  public readonly refs$ = this.searchQuery$.pipe(
    switchMap(query =>
      query && query?.length >= 2 && !this.useLocalSearch ? this.searchRefs$ : this.storedRefs$
    ),
    debounceTime(20)
  );

  public readonly tokens$ = this.refs$.pipe(
    combineLatestWith(this.tokensStore.allTokens$),
    auditTime(0),
    map(([refs, allTokens]) => {
      const tokens = refs
        .map(ref =>
          allTokens.find(token => {
            const similarChain = ref?.blockchain === token?.blockchain;
            const similarAddress = ref?.address === token?.address;
            const similarToken = compareTokens(ref, token);
            return (similarChain && similarAddress) || similarToken;
          })
        )
        .filter(Boolean);
      const searchQuery = this._searchQuery$.value;
      const filteredTokens =
        searchQuery && searchQuery.length >= 2 && tokens.length && this.useLocalSearch
          ? tokens.filter(
              token =>
                token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                compareAddresses(searchQuery, token.address)
            )
          : tokens;
      return filteredTokens;
    }),
    debounceTime(30)
  );

  constructor(protected readonly tokensStore: NewTokensStoreService) {}

  public init(): this {
    return this;
  }

  public abstract getTokenRefs(tokens: Token[]): TokenRef[];

  public abstract fetchTokens(): Observable<Token[]>;

  public addMissedUtilityTokens(tokens: (RatedToken | Token)[]): void {
    const chainObject = {} as Partial<Record<BlockchainName, (RatedToken | Token)[]>>;
    tokens.forEach(token => {
      if (token.blockchain in chainObject === false) {
        Object.assign(chainObject, { [token.blockchain]: [] });
      }
      chainObject[token.blockchain] = [...chainObject?.[token.blockchain], token];
    });
    Object.entries(chainObject).forEach(([blockchain, blockchainTokens]) => {
      const chainTokens = this.tokensStore.tokens[blockchain as BlockchainName];
      if (!chainTokens) {
        return;
      }
      const existingTokens = chainTokens._tokensObject$.value;
      const missedTokens = blockchainTokens.filter(token => !existingTokens[token.address]);
      if (missedTokens.length) {
        console.log('added missed tokens: ', missedTokens);
        this.tokensStore.addNewBlockchainTokens(blockchain as BlockchainName, missedTokens);
      }
    });
  }

  protected buildInitialList(): void {
    this._pageLoading$.next(true);
    this.fetchTokens().subscribe(tokens => {
      this.addMissedUtilityTokens(tokens);
      const refs = this.getTokenRefs(tokens);
      this._storedRefs$.next(refs);
      this._pageLoading$.next(false);
    });
  }

  public updateTokenSync(tokens: Token[]): void {
    this._pageLoading$.next(true);
    const refs = this.getTokenRefs(tokens);
    this._storedRefs$.next(refs);
    this._pageLoading$.next(false);
  }

  public setQuery(value: string): void {
    this._searchQuery$.next(value);
  }

  public setBalanceLoading(value: boolean): void {
    this._balanceLoading$.next(value);
  }
}

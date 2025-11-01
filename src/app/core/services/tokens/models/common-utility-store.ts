import { TokenRef } from '@core/services/tokens/models/new-token-types';
import { BehaviorSubject, combineLatestWith, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RatedToken, Token } from '@shared/models/tokens/token';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { BlockchainName } from '@cryptorubic/sdk';

export abstract class CommonUtilityStore {
  protected readonly _pageLoading$ = new BehaviorSubject(true);

  public readonly pageLoading$ = this._pageLoading$.asObservable();

  protected readonly _balanceLoading$ = new BehaviorSubject(false);

  public readonly balanceLoading$ = this._balanceLoading$.asObservable();

  protected readonly _refs$ = new BehaviorSubject<TokenRef[]>([]);

  public readonly refs$ = this._refs$.asObservable();

  public readonly tokens$ = this.refs$.pipe(
    combineLatestWith(
      ...Object.values(this.tokensStore.tokens).map(t =>
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
  );

  constructor(private readonly tokensStore: NewTokensStoreService) {}

  public init(): this {
    this.buildInitialList();
    return this;
  }

  public abstract getTokenRefs(tokens: Token[]): TokenRef[];

  public abstract fetchTokens(): Observable<Token[]>;

  protected addMissedUtilityTokens(tokens: (RatedToken | Token)[]): void {
    const chainObject = {} as Partial<Record<BlockchainName, (RatedToken | Token)[]>>;
    tokens.forEach(token => {
      if (token.blockchain in chainObject === false) {
        Object.assign(chainObject, { [token.blockchain]: [] });
      }
      chainObject[token.blockchain] = [...chainObject?.[token.blockchain], token];
    });
    Object.entries(chainObject).forEach(([blockchain, blockchainTokens]) => {
      const existingTokens =
        this.tokensStore.tokens[blockchain as BlockchainName]._tokensObject$.value;
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
      this._refs$.next(refs);
      this._pageLoading$.next(false);
    });
  }

  public updateTokenSync(tokens: Token[]): void {
    this._pageLoading$.next(true);
    const refs = this.getTokenRefs(tokens);
    this._refs$.next(refs);
    this._pageLoading$.next(false);
  }
}

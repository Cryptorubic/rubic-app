import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { BlockchainName } from '@cryptorubic/core';
import { MinimalToken } from '@shared/models/tokens/minimal-token';
import { compareTokens } from '@shared/utils/utils';

@Injectable({
  providedIn: 'root'
})
export class TransferTokensService {
  private readonly _transferTokens$ = new BehaviorSubject<BalanceToken[]>([]);

  public readonly transferTokens$ = this._transferTokens$.asObservable();

  public get transferTokens(): BalanceToken[] {
    return this._transferTokens$.getValue();
  }

  public readonly transferBlockchains$ = this.transferTokens$.pipe(
    map(tokens => [...new Set(tokens.map(token => token.blockchain))])
  );

  public get transferBlockchains(): BlockchainName[] {
    return [...new Set(this.transferTokens.map(token => token.blockchain))];
  }

  private readonly _loaded$ = new BehaviorSubject<boolean>(false);

  public readonly loaded$ = this._loaded$.asObservable();

  public get isLoaded(): boolean {
    return this._loaded$.getValue();
  }

  public setTokens(tokens: BalanceToken[]): void {
    this._transferTokens$.next(tokens);
    this._loaded$.next(true);
  }

  public hasToken(token: MinimalToken | null | undefined): boolean {
    if (!token?.address || !token.blockchain) {
      return false;
    }
    return this.transferTokens.some(transferToken => compareTokens(transferToken, token));
  }
}

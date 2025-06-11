import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TokensListType } from '@features/trade/components/assets-selector/models/tokens-list-type';

@Injectable()
export class TokensListTypeService {
  /**
   * Defines whether default or favorite tokens are shown.
   */
  private readonly _listType$ = new BehaviorSubject<TokensListType>('default');

  public readonly listType$ = this._listType$.asObservable();

  public get listType(): TokensListType {
    return this._listType$.value;
  }

  private set listType(value: TokensListType) {
    this._listType$.next(value);
  }

  public switchListType(): void {
    if (this.listType === 'default') {
      this.listType = 'favorite';
    } else {
      this.listType = 'default';
    }
  }
}

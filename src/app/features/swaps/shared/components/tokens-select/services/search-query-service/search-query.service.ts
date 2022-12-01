import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SearchQueryService {
  /**
   * Contains string in search bar.
   */
  private readonly _query$ = new BehaviorSubject<string>('');

  public readonly query$ = this._query$.asObservable();

  public get query(): string {
    return this._query$.value;
  }

  public set query(value: string) {
    this._query$.next(value);
  }

  constructor() {}
}

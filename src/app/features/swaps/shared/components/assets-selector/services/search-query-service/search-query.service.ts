import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { distinctUntilChanged } from 'rxjs/operators';

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

  constructor(public readonly assetsSelectorService: AssetsSelectorService) {
    this.subscribeOnSelectorListTypeChange();
  }

  private subscribeOnSelectorListTypeChange(): void {
    this.assetsSelectorService.selectorListType$.pipe(distinctUntilChanged()).subscribe(() => {
      this.query = '';
    });
  }
}

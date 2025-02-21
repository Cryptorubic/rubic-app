import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { AssetsSelectorStateService } from '../assets-selector-state/assets-selector-state.service';

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

  public setSearchQuery(value: string): void {
    this._query$.next(value.trim());
  }

  constructor(
    public readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.subscribeOnSelectorListTypeChange();
  }

  private subscribeOnSelectorListTypeChange(): void {
    this.assetsSelectorStateService.selectorListType$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.setSearchQuery('');
      });
  }
}

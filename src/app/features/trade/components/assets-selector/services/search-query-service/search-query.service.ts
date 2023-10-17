import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';

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

  constructor(
    public readonly assetsSelectorService: AssetsSelectorService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.subscribeOnSelectorListTypeChange();
  }

  private subscribeOnSelectorListTypeChange(): void {
    this.assetsSelectorService.selectorListType$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.query = '';
      });
  }
}

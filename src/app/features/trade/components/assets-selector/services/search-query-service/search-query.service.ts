import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { combineLatestWith, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { FormsTogglerService } from '@app/features/trade/services/forms-toggler/forms-toggler.service';
import { AssetsSelectorStateService } from '../assets-selector-state/assets-selector-state.service';

@Injectable()
export class SearchQueryService {
  /**
   * Contains string in search bar.
   */
  private readonly _query$ = new BehaviorSubject<string>('');

  public readonly query$ = this._query$.asObservable();

  private readonly _prevQuery$ = new BehaviorSubject<string>('');

  public get query(): string {
    return this._query$.value;
  }

  public set query(value: string) {
    this._query$.next(value.trim());
  }

  constructor(
    public readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly destroy$: TuiDestroyService,
    private readonly formsTogglerService: FormsTogglerService
  ) {
    this.subscribeOnSelectorListTypeChange();
  }

  private subscribeOnSelectorListTypeChange(): void {
    this.assetsSelectorStateService.selectorListType$
      .pipe(
        combineLatestWith(this.formsTogglerService.selectedForm$),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.query = '';
      });
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { combineLatestWith, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { FormsTogglerService } from '@app/features/trade/services/forms-toggler/forms-toggler.service';
import { GasFormService } from '@app/features/trade/services/gas-form/gas-form.service';

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
    if (this.assetsSelectorService.selectorListType !== 'tokens') {
      this.gasFormService.updateSearchQuery(value);
    }
  }

  constructor(
    public readonly assetsSelectorService: AssetsSelectorService,
    private readonly destroy$: TuiDestroyService,
    private readonly formsTogglerService: FormsTogglerService,
    private readonly gasFormService: GasFormService
  ) {
    this.subscribeOnSelectorListTypeChange();
  }

  private subscribeOnSelectorListTypeChange(): void {
    this.assetsSelectorService.selectorListType$
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

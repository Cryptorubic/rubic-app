import { Injectable } from '@angular/core';
import { FormsTogglerService } from '@app/features/trade/services/forms-toggler/forms-toggler.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { BehaviorSubject, combineLatestWith, distinctUntilChanged, takeUntil } from 'rxjs';
import { AssetsSelectorService } from '../assets-selector-service/assets-selector.service';

@Injectable()
export class AssetsSearchQueryService {
  private readonly _assetsQuery$ = new BehaviorSubject<string>('');

  public readonly assetsQuery$ = this._assetsQuery$.asObservable();

  public get assetsQuery(): string {
    return this._assetsQuery$.value;
  }

  public set assetsQuery(value: string) {
    this._assetsQuery$.next(value.trim());
  }

  constructor(
    public readonly assetsSelectorService: AssetsSelectorService,
    private readonly destroy$: TuiDestroyService,
    private readonly formsTogglerService: FormsTogglerService
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
        this.assetsQuery = '';
      });
  }
}

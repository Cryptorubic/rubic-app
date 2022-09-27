import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProvidersSort } from '@features/swaps/features/cross-chain-routing/components/providers-list-sorting/models/providers-sort';
import { debounceTime } from 'rxjs/operators';
import { StoreService } from '@core/services/store/store.service';

@Injectable({
  providedIn: 'root'
})
export class ProvidersListSortingService {
  private readonly defaultSortType: ProvidersSort =
    this.storeService.getItem('sortingType') || 'smart';

  private readonly _currentSortingType$ = new BehaviorSubject<ProvidersSort>(this.defaultSortType);

  public readonly currentSortingType$ = this._currentSortingType$.asObservable();

  private readonly _visibleSortingType$ = new BehaviorSubject<ProvidersSort>(this.defaultSortType);

  public readonly visibleSortingType$ = this._visibleSortingType$
    .asObservable()
    .pipe(debounceTime(100));

  constructor(private readonly storeService: StoreService) {}

  public setCurrentSortingType(type: ProvidersSort): void {
    this.storeService.setItem('sortingType', type);
    this._currentSortingType$.next(type);
  }

  public setVisibleSortingType(type?: ProvidersSort): void {
    if (type) {
      this._visibleSortingType$.next(type);
    } else {
      this._visibleSortingType$.next(this._currentSortingType$.value);
    }
  }
}

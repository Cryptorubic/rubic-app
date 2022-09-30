import { Component, ChangeDetectionStrategy } from '@angular/core';
import { map } from 'rxjs/operators';
import { ProvidersSort } from '@features/swaps/features/cross-chain-routing/components/providers-list-sorting/models/providers-sort';
import { sorts } from './models/providers-list';
import { ProvidersListSortingService } from '@features/swaps/features/cross-chain-routing/services/providers-list-sorting-service/providers-list-sorting.service';

@Component({
  selector: 'app-providers-list-sorting',
  templateUrl: './providers-list-sorting.component.html',
  styleUrls: ['./providers-list-sorting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersListSortingComponent {
  public readonly currentSortingType$ = this.service.currentSortingType$;

  public readonly currentSortingButton$ = this.service.currentSortingType$.pipe(
    map(type => {
      return this.sorts.find(sort => sort.type === type);
    })
  );

  public readonly visibleSorting$ = this.service.visibleSortingType$.pipe(
    map(type => {
      return this.sorts.find(sort => sort.type === type);
    })
  );

  public readonly sorts = sorts;

  public open = false;

  constructor(private readonly service: ProvidersListSortingService) {}

  public handleSelect(type: ProvidersSort): void {
    this.service.setCurrentSortingType(type);
    this.open = false;
  }

  public handleMouseIn(type: ProvidersSort): void {
    this.service.setVisibleSortingType(type);
  }

  public handleMouseOut(): void {
    this.service.setVisibleSortingType();
  }

  public handleSortingClick($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.open = true;
  }
}

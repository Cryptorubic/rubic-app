import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { SearchQueryService } from '@features/swaps/shared/components/assets-selector/services/search-query-service/search-query.service';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { map } from 'rxjs/operators';
import { HeaderStore } from '@core/header/services/header.store';
import { TuiSizeS, TuiSvgService } from '@taiga-ui/core';
import { tuiIconSearch } from '@taiga-ui/icons';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent {
  @Input() expandableField: boolean = false;

  public isExpanded = false;

  public readonly searchQuery$ = this.searchQueryService.query$;

  public readonly searchBarText$ = this.assetsSelectorService.selectorListType$.pipe(
    map(selectorListType =>
      selectorListType === 'tokens' ? 'modals.tokensListModal.searchPlaceholder' : 'Search name'
    )
  );

  public readonly searchBarSize: TuiSizeS = this.headerStore.isMobile ? 'm' : 's';

  public readonly searchIcon = this.tuiSvgService.getOriginal('tuiIconSearch');

  constructor(
    private readonly searchQueryService: SearchQueryService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly headerStore: HeaderStore,
    @Inject(TuiSvgService) private readonly tuiSvgService: TuiSvgService
  ) {
    tuiSvgService.define({ tuiIconSearch });
  }

  /**
   * Handles input query change.
   * @param model Input string.
   */
  public onQueryChanges(model: string): void {
    this.searchQueryService.query = model;
  }

  public expand(): void {
    this.isExpanded = !this.isExpanded;
  }
}

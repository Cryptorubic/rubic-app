import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SearchQueryService } from '@features/swaps/shared/components/tokens-selector/services/search-query-service/search-query.service';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-selector/services/tokens-selector-service/tokens-selector.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tokens-search-bar',
  templateUrl: './tokens-search-bar.component.html',
  styleUrls: ['./tokens-search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensSearchBarComponent {
  @Input() expandableField: boolean = false;

  public isExpanded = false;

  public readonly searchQuery$ = this.searchQueryService.query$;

  public readonly searchBarText$ = this.tokensSelectorService.selectorListType$.pipe(
    map(selectorListType =>
      selectorListType === 'tokens' ? 'Search name or paste address' : 'Search name'
    )
  );

  constructor(
    private readonly searchQueryService: SearchQueryService,
    private readonly tokensSelectorService: TokensSelectorService
  ) {}

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

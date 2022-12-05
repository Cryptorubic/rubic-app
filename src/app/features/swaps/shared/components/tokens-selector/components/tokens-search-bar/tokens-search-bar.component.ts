import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SearchQueryService } from '@features/swaps/shared/components/tokens-selector/services/search-query-service/search-query.service';

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

  constructor(private readonly searchQueryService: SearchQueryService) {}

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

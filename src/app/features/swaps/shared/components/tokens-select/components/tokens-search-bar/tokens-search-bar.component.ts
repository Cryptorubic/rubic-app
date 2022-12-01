import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/tokens-selector.service';

@Component({
  selector: 'app-tokens-search-bar',
  templateUrl: './tokens-search-bar.component.html',
  styleUrls: ['./tokens-search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensSearchBarComponent {
  @Input() expandableField: boolean = false;

  public isExpanded = false;

  public readonly searchQuery$ = this.tokensSelectorService.searchQuery$;

  constructor(private readonly tokensSelectorService: TokensSelectorService) {}

  /**
   * Handles input query change.
   * @param model Input string.
   */
  public onQueryChanges(model: string): void {
    this.tokensSelectorService.searchQuery = model;
  }

  public expand(): void {
    this.isExpanded = !this.isExpanded;
  }
}

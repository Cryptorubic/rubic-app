import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TokensSelectService } from '@features/swaps/shared/components/tokens-select/services/tokens-select-service/tokens-select.service';

@Component({
  selector: 'app-tokens-search-bar',
  templateUrl: './tokens-search-bar.component.html',
  styleUrls: ['./tokens-search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensSearchBarComponent {
  @Input() expandableField: boolean = false;

  public isExpanded = false;

  public readonly searchQuery$ = this.tokensSelectService.searchQuery$;

  constructor(private readonly tokensSelectService: TokensSelectService) {}

  /**
   * Handles input query change.
   * @param model Input string.
   */
  public onQueryChanges(model: string): void {
    this.tokensSelectService.searchQuery = model;
  }

  public expand(): void {
    this.isExpanded = !this.isExpanded;
  }
}

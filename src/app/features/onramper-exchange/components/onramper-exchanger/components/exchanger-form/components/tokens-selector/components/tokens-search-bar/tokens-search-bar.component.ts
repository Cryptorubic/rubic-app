import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tokens-search-bar',
  templateUrl: './tokens-search-bar.component.html',
  styleUrls: ['./tokens-search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensSearchBarComponent {
  @Input() searchQuery: string;

  @Input() expandableField: boolean = false;

  @Output() searchQueryChange = new EventEmitter<string>();

  public isExpanded = false;

  /**
   * Handles input query change.
   * @param model Input string.
   */
  public onQueryChanges(model: string): void {
    this.searchQuery = model;
    this.searchQueryChange.emit(model);
  }

  public expand(): void {
    this.isExpanded = !this.isExpanded;
  }
}

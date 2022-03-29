import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tokens-search-bar',
  templateUrl: './tokens-search-bar.component.html',
  styleUrls: ['./tokens-search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensSearchBarComponent {
  @Input() searchQuery: string;

  @Output() searchQueryChange = new EventEmitter<string>();

  constructor() {}

  /**
   * Handles input query change.
   * @param model Input string.
   */
  public onQueryChanges(model: string): void {
    this.searchQuery = model;
    this.searchQueryChange.emit(model);
  }
}

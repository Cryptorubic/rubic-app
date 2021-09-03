import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  Inject
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-tokens-search-bar',
  templateUrl: './tokens-search-bar.component.html',
  styleUrls: ['./tokens-search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensSearchBarComponent implements AfterViewInit {
  private searchBar: HTMLElement;

  @Input() query: string;

  @Output() queryChange = new EventEmitter<string>();

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.searchBar = document.querySelector('app-tokens-search-bar tui-input input');
      this.searchBar.focus();
    }, 100);
  }

  onQueryChanges(model: string) {
    this.query = model;
    this.queryChange.emit(model);
  }
}

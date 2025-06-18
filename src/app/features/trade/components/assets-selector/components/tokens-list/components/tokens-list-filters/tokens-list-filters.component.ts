import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TOKEN_FILTERS_UI, TokenFilterUI } from './constants/token-filters';
import { TokenFilter } from '../../../../models/token-filters';
import { HeaderStore } from '@app/core/header/services/header.store';
import { tap } from 'rxjs';

@Component({
  selector: 'app-tokens-list-filters',
  templateUrl: './tokens-list-filters.component.html',
  styleUrls: ['./tokens-list-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListFiltersComponent {
  @Input({ required: true }) tokenFilter: TokenFilter;

  @Output() onSelect: EventEmitter<TokenFilter> = new EventEmitter();

  public ITEMS_PER_SLIDE = 3;

  public readonly TOKEN_FILTERS_UI = TOKEN_FILTERS_UI;

  public readonly isMobile$ = this.headerStore
    .getMobileDisplayStatus()
    .pipe(tap(isMobile => (this.ITEMS_PER_SLIDE = isMobile ? 4 : 3)));

  public currentIdx: number = 0;

  constructor(private readonly headerStore: HeaderStore) {}

  public prev(): void {
    if (!this.currentIdx) return;
    this.currentIdx -= 1;
  }

  public next(): void {
    if (this.currentIdx >= this.TOKEN_FILTERS_UI.length - this.ITEMS_PER_SLIDE) return;
    this.currentIdx += 1;
  }

  public selectFilter(item: TokenFilterUI): void {
    this.onSelect.emit(item.value);
  }
}

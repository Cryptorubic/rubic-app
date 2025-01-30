import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TOKEN_FILTERS_UI } from './constants/token-filters';

@Component({
  selector: 'app-tokens-list-filters',
  templateUrl: './tokens-list-filters.component.html',
  styleUrls: ['./tokens-list-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListFiltersComponent {
  public readonly TOKEN_FILTERS_UI = TOKEN_FILTERS_UI;

  public currentIdx: number = 0;

  public prev(): void {
    if (!this.currentIdx) return;
    this.currentIdx -= 1;
  }

  public next(): void {
    if (this.currentIdx >= 2) return;
    this.currentIdx += 1;
  }
}

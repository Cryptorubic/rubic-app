import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  Output
} from '@angular/core';
import { HeaderStore } from '@core/header/services/header.store';
import { TuiSizeS } from '@taiga-ui/core';

@Component({
  selector: 'app-search-tokens-bar',
  templateUrl: './search-bar-tokens.component.html',
  styleUrls: ['./search-bar-tokens.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarTokensComponent {
  @Input() expandableField: boolean = false;

  @Input() injector: Injector;

  @Input({ required: true }) searchQuery: string;

  @Input({ required: true }) totalBlockchains = 100;

  @Output() queryChange = new EventEmitter<string>();

  public isExpanded = false;

  public readonly searchBarSize: TuiSizeS = this.headerStore.isMobile ? 'm' : 's';

  public readonly searchBarPlaceholder = 'modals.tokensListModal.searchPlaceholder';

  constructor(private readonly headerStore: HeaderStore) {}

  /**
   * Handles input query change.
   * @param model Input string.
   */
  public onQueryChanges(model: string): void {
    this.queryChange.emit(model);
  }

  public expand(): void {
    this.isExpanded = !this.isExpanded;
  }
}

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
  selector: 'app-search-blockchains-bar',
  templateUrl: './search-bar-blockchains.component.html',
  styleUrls: ['./search-bar-blockchains.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarBlockchainsComponent {
  @Input() expandableField: boolean = false;

  @Input() injector: Injector;

  @Input({ required: true }) type: 'from' | 'to';

  @Input({ required: true }) searchQuery: string;

  @Input({ required: true }) totalBlockchains = 100;

  public isExpanded = false;

  public readonly searchBarSize: TuiSizeS = this.headerStore.isMobile ? 'm' : 's';

  @Output() handleSearchQuery = new EventEmitter<string>();

  public get searchBarPlaceholder(): string {
    return `Search among ${this.totalBlockchains} Chains`;
  }

  constructor(private readonly headerStore: HeaderStore) {}

  /**
   * Handles input query change.
   * @param model Input string.
   */
  public onQueryChanges(model: string): void {
    this.handleSearchQuery.emit(model);
  }

  public expand(): void {
    this.isExpanded = !this.isExpanded;
  }
}

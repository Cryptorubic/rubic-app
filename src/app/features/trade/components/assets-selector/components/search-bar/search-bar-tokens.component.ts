import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
  Self
} from '@angular/core';
import { HeaderStore } from '@core/header/services/header.store';
import { TuiSizeS } from '@taiga-ui/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-search-tokens-bar',
  templateUrl: './search-bar-tokens.component.html',
  styleUrls: ['./search-bar-tokens.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
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

  private readonly query$ = new Subject<string>();

  constructor(
    private readonly headerStore: HeaderStore,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.handleQuerySubscribe();
  }

  /**
   * Handles input query change.
   * @param model Input string.
   */
  public onQueryChanges(model: string): void {
    this.query$.next(model);
  }

  public expand(): void {
    this.isExpanded = !this.isExpanded;
  }

  private handleQuerySubscribe(): void {
    this.query$
      .pipe(debounceTime(100), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(value => this.queryChange.emit(value));
  }
}

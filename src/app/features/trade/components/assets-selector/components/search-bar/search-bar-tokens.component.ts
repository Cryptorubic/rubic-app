import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  Self,
  OnChanges,
  SimpleChanges
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
export class SearchBarTokensComponent implements OnChanges {
  @Input() expandableField: boolean = false;

  /**
   * Value controlled by parent.
   * Must NOT be bound directly to input to avoid value rollback.
   */
  @Input({ required: true }) searchQuery: string;

  @Input({ required: true }) totalBlockchains = 100;

  @Output() queryChange = new EventEmitter<string>();

  public isExpanded = false;

  public readonly searchBarSize: TuiSizeS = this.headerStore.isMobile ? 'm' : 's';

  public readonly searchBarPlaceholder = 'modals.tokensListModal.searchPlaceholder';

  /**
   * Local value bound to the input element.
   * This is the single source of truth for the UI.
   */
  public localQuery = '';

  private readonly query$ = new Subject<string>();

  /**
   * While true, external @Input updates are ignored
   * to prevent cursor jumping / character rollback.
   */
  private isTyping = false;

  constructor(
    private readonly headerStore: HeaderStore,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.subscribeToQuery();
  }

  /**
   * Sync external value only when user is NOT typing.
   * This allows parent-driven resets / presets
   * without breaking typing UX.
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (!changes['searchQuery']) {
      return;
    }

    const nextExternalValue = this.searchQuery ?? '';

    if (this.isTyping) {
      return;
    }

    if (nextExternalValue !== this.localQuery) {
      this.localQuery = nextExternalValue;
    }
  }

  /**
   * Called on each input change.
   */
  public onQueryChanges(value: string): void {
    this.isTyping = true;
    this.localQuery = value;
    this.query$.next(value);
  }

  public expand(): void {
    this.isExpanded = !this.isExpanded;
  }

  private subscribeToQuery(): void {
    this.query$
      .pipe(debounceTime(100), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(value => {
        // Typing finished, allow external sync again
        this.isTyping = false;
        this.queryChange.emit(value);
      });
  }
}

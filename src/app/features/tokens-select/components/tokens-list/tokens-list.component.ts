import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { Utils } from 'src/app/shared/models/utils/utils';
import { CountPage } from 'src/app/shared/models/tokens/paginated-tokens';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class TokensListComponent implements OnChanges, AfterViewInit {
  /**
   * List type.
   */
  @Input() public listType: 'default' | 'favorite';

  /**
   * Does modal has search query string.
   */
  @Input() public hasQuery: boolean;

  /**
   * State of count and page for current {@link blockchain}.
   */
  @Input() public tokensNetworkState: CountPage;

  /**
   * Current blockchain.
   */
  @Input() public blockchain: BLOCKCHAIN_NAME;

  /**
   * List loading status.
   */
  @Input() public loading: boolean;

  /**
   * Previously selected token.
   */
  @Input() public prevSelectedToken: TokenAmount;

  /**
   * Set list of tokens.
   * @param tokens List of tokens.
   */
  @Input() public set tokens(tokens: AvailableTokenAmount[]) {
    if (tokens) {
      this._tokens = tokens;
    }
  }

  /**
   * Emits event when token selected.
   */
  @Output() public tokenSelect = new EventEmitter<AvailableTokenAmount>();

  /**
   * Emits event when tokens page updated.
   */
  @Output() public pageUpdate = new EventEmitter<number>();

  /**
   * Emits event when tokens list type changed.
   */
  @Output() public listTypeChangeHandle = new EventEmitter<'default' | 'favorite'>();

  /**
   * Set {@link CdkVirtualScrollViewport}
   * @param scroll
   */
  @ViewChild(CdkVirtualScrollViewport) set virtualScroll(scroll: CdkVirtualScrollViewport) {
    if (scroll) {
      this.scrollSubject.next(scroll);
    }
  }

  private _tokens: AvailableTokenAmount[] = [];

  public scrollSubject: BehaviorSubject<CdkVirtualScrollViewport>;

  public get tokens(): AvailableTokenAmount[] {
    return this._tokens;
  }

  public get noFrameLink(): string {
    return `https://rubic.exchange${this.queryParamsService.noFrameLink}`;
  }

  public listScroll: CdkVirtualScrollViewport;

  public hintsShown: boolean[];

  constructor(
    private cdr: ChangeDetectorRef,
    private readonly queryParamsService: QueryParamsService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.pageUpdate = new EventEmitter<number>();
    this.scrollSubject = new BehaviorSubject<CdkVirtualScrollViewport>(null);
  }

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit(): void {
    this.observeScroll();
  }

  /**
   * Lifecycle hook.
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.tokens) {
      this.setupHints(changes);
    }
  }

  /**
   * Observe tokens scroll and fetch new if needed.
   */
  private observeScroll(): void {
    this.scrollSubject
      .pipe(
        takeUntil(this.destroy$),
        switchMap(scroll =>
          scroll.renderedRangeStream.pipe(
            debounceTime(500),
            filter(el => {
              if (
                this.loading ||
                this.hasQuery ||
                this.listType === 'favorite' ||
                !this.tokensNetworkState ||
                this.tokensNetworkState.maxPage === this.tokensNetworkState.page
              ) {
                return false;
              }
              const endOfList = el.end > this.tokens.length - 30;
              const shouldFetch =
                !this.tokensNetworkState.count ||
                (!this.tokensNetworkState &&
                  this.tokensNetworkState.page <= Math.ceil(this.tokensNetworkState.count / 150));

              return endOfList && shouldFetch;
            })
          )
        )
      )
      .subscribe(() => {
        this.pageUpdate.emit();
      });
  }

  /**
   * Setup hints.
   * @param changes Detected changes.
   */
  private setupHints(changes: SimpleChanges): void {
    const hasChanges = !Utils.compareObjects(
      changes.tokens?.currentValue,
      changes.tokens?.previousValue
    );
    if (hasChanges) {
      const tokensNumber = changes.tokens.currentValue.length;
      this.hintsShown = Array(tokensNumber).fill(false);
    }
  }

  /**
   * Select token.
   * @param token Selected token.
   */
  public onTokenSelect(token: AvailableTokenAmount): void {
    if (token.available) {
      this.tokenSelect.emit(token);
    }
  }
}

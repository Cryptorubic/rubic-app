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
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class TokensListComponent implements OnChanges, AfterViewInit {
  private _tokens: AvailableTokenAmount[] = [];

  @Input() public set tokens(value: AvailableTokenAmount[]) {
    if (value) {
      this._tokens = value;
      this.loading = false;
    }
  }

  public get tokens(): AvailableTokenAmount[] {
    return this._tokens;
  }

  @Input() prevSelectedToken: TokenAmount;

  @Output() tokenSelect = new EventEmitter<AvailableTokenAmount>();

  @Output() pageUpdate = new EventEmitter<number>();

  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;

  @Input() tokensNetworkState: { count: number; page: number };

  @Input() blockchain: BLOCKCHAIN_NAME;

  public hintsShown: boolean[];

  public loading: boolean;

  public get noFrameLink(): string {
    return `https://rubic.exchange${this.queryParamsService.noFrameLink}`;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private readonly queryParamsService: QueryParamsService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.pageUpdate = new EventEmitter<number>();
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
    this.setupHints(changes);
  }

  /**
   * @description Observe tokens scroll and fetch new if needed.
   */
  private observeScroll(): void {
    this.virtualScroll.renderedRangeStream
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        filter(el => {
          const endOfList = el.end > this.tokens.length - 50;
          const shouldFetch = this.tokensNetworkState
            ? this.tokensNetworkState.page <= Math.ceil(this.tokensNetworkState.count / 150)
            : true;

          return endOfList && shouldFetch;
        }),
        map(el => {
          this.loading = true;
          return el;
        })
      )
      .subscribe(() => {
        this.pageUpdate.emit();
      });
  }

  /**
   * @description Setup hints.
   * @param changes Detected changes.
   */
  private setupHints(changes: SimpleChanges): void {
    if (
      JSON.stringify(changes.tokens.currentValue) !== JSON.stringify(changes.tokens.previousValue)
    ) {
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

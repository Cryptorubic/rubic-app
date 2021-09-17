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
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { Utils } from 'src/app/shared/models/utils/utils';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class TokensListComponent implements OnChanges, AfterViewInit {
  @Output() public tokenSelect = new EventEmitter<AvailableTokenAmount>();

  @Output() public pageUpdate = new EventEmitter<number>();

  @Input() public listType: 'default' | 'favorite';

  @Input() public hasQuery: boolean;

  @Input() public tokensNetworkState: { count: number; page: number };

  @Input() public blockchain: BLOCKCHAIN_NAME;

  @Input() public loading: boolean;

  @Input() public prevSelectedToken: TokenAmount;

  @Input() public set tokens(value: AvailableTokenAmount[]) {
    if (value) {
      this._tokens = value;
    }
  }

  @ViewChild(CdkVirtualScrollViewport) set virtualScroll(scroll: CdkVirtualScrollViewport) {
    this.listScroll = scroll;
    if (scroll && this.listScroll && !Utils.compareObjects(scroll, this.listScroll)) {
      this.observeScroll();
    }
  }

  private _tokens: AvailableTokenAmount[] = [];

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
   * @description Observe tokens scroll and fetch new if needed.
   */
  private observeScroll(): void {
    this.listScroll.renderedRangeStream
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        filter(el => {
          if (this.loading || this.hasQuery || this.listType === 'favorite') {
            return false;
          }
          const endOfList = el.end > this.tokens.length - 50;
          const shouldFetch =
            !this.tokensNetworkState.count ||
            (!this.tokensNetworkState &&
              this.tokensNetworkState.page <= Math.ceil(this.tokensNetworkState.count / 150));

          return endOfList && shouldFetch;
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

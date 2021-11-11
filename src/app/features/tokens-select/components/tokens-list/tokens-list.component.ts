import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  Self,
  ViewChild
} from '@angular/core';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PaginatedPage } from 'src/app/shared/models/tokens/paginated-tokens';
import { BehaviorSubject } from 'rxjs';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { TokensListType } from 'src/app/features/tokens-select/models/TokensListType';
import { listAnimation } from 'src/app/features/tokens-select/components/tokens-list/animations/listAnimation';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
  animations: [listAnimation]
})
export class TokensListComponent implements AfterViewInit {
  /**
   * Defines whether default or favorite tokens are shown.
   */
  @Input() public listType: TokensListType;

  /**
   * True if search query string isn't empty.
   */
  @Input() public hasSearchQuery: boolean;

  /**
   * Backend-api state of tokens in currently selected blockchain.
   */
  @Input() public tokensNetworkState: PaginatedPage;

  /**
   * True if new tokens are being loaded.
   */
  @Input() public loading: boolean;

  /**
   * Token, currently selected in main form.
   */
  @Input() public currentlySelectedToken: TokenAmount;

  /**
   * Sets list of tokens to show.
   */
  @Input() public set tokens(tokens: AvailableTokenAmount[]) {
    this.startAnimation(tokens);
    this._tokens = tokens;
    this.hintsShown = Array(this._tokens.length).fill(false);
  }

  public get tokens(): AvailableTokenAmount[] {
    return this._tokens;
  }

  /**
   * Emits event when token is selected.
   */
  @Output() public tokenSelect = new EventEmitter<AvailableTokenAmount>();

  /**
   * Emits event when new tokens page should be loaded.
   */
  @Output() public pageUpdate = new EventEmitter<number>();

  /**
   * Emits event when tokens list type is changed.
   */
  @Output() public listTypeChange = new EventEmitter<TokensListType>();

  /**
   * Sets {@link CdkVirtualScrollViewport}
   */
  @ViewChild(CdkVirtualScrollViewport) set virtualScroll(scroll: CdkVirtualScrollViewport) {
    if (scroll) {
      this.scrollSubject.next(scroll);
    }
  }

  private _tokens: AvailableTokenAmount[];

  /**
   * Defines whether hint is shown or not for each token.
   */
  public hintsShown: boolean[];

  /**
   * Controls animation of tokens list.
   */
  public listAnimationState: 'hidden' | 'shown';

  public readonly scrollSubject: BehaviorSubject<CdkVirtualScrollViewport>;

  public get noFrameLink(): string {
    return `https://rubic.exchange${this.queryParamsService.noFrameLink}`;
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly queryParamsService: QueryParamsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly iframeService: IframeService,
    public readonly authService: AuthService,
    private readonly walletsModalService: WalletsModalService
  ) {
    this.loading = false;
    this.pageUpdate = new EventEmitter();
    this.scrollSubject = new BehaviorSubject(null);
  }

  ngAfterViewInit(): void {
    this.observeScroll();
  }

  /**
   * Observes list scroll and fetches new tokens if needed.
   */
  private observeScroll(): void {
    this.scrollSubject
      .pipe(
        takeUntil(this.destroy$),
        switchMap(scroll =>
          scroll.renderedRangeStream.pipe(
            debounceTime(300),
            filter(renderedRange => {
              if (
                this.loading ||
                this.hasSearchQuery ||
                this.listType === 'favorite' ||
                !this.tokensNetworkState ||
                this.tokensNetworkState.maxPage === this.tokensNetworkState.page ||
                this.iframeService.isIframe
              ) {
                return false;
              }
              return renderedRange.end > this.tokens.length - 30;
            })
          )
        )
      )
      .subscribe(() => {
        this.pageUpdate.emit();
      });
  }

  /**
   * Starts smooth animation when tokens list is distinctly changed.
   * @param tokens New tokens list.
   */
  private startAnimation(tokens: AvailableTokenAmount[]): void {
    let shouldAnimate = false;
    if (this._tokens?.length && tokens.length) {
      const prevToken = this._tokens[0];
      const newToken = tokens[0];
      shouldAnimate = prevToken.blockchain !== newToken.blockchain;

      const arePrevTokensFavourite = this._tokens.every(t => t.favorite);
      const areNewTokensFavourite = tokens.every(t => t.favorite);
      shouldAnimate ||= arePrevTokensFavourite !== areNewTokensFavourite;
    }

    if (shouldAnimate) {
      this.listAnimationState = 'hidden';
      setTimeout(() => {
        this.listAnimationState = 'shown';
        this.cdr.markForCheck();
      });
    }
  }

  /**
   * Selects token.
   * @param token Selected token.
   */
  public onTokenSelect(token: AvailableTokenAmount): void {
    if (token.available) {
      this.tokenSelect.emit(token);
    }
  }

  public openAuthModal(): void {
    this.walletsModalService.open$();
  }
}

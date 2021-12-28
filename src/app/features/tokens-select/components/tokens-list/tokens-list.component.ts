import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  Self,
  ViewChild
} from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PaginatedPage } from 'src/app/shared/models/tokens/paginated-tokens';
import { BehaviorSubject, Observable } from 'rxjs';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { TokensListType } from '@features/tokens-select/models/tokens-list-type';
import { LIST_ANIMATION } from '@features/tokens-select/components/tokens-list/animations/list-animation';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';
import { UserInterface } from '@core/services/auth/models/user.interface';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WINDOW } from '@ng-web-apis/common';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
  animations: [LIST_ANIMATION]
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
   * Tokens, currently selected in main form.
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
      this.scrollSubject$.next(scroll);
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

  // eslint-disable-next-line rxjs/no-exposed-subjects
  public readonly scrollSubject$: BehaviorSubject<CdkVirtualScrollViewport>;

  public get noFrameLink(): string {
    return `${this.window.origin}${this.queryParamsService.noFrameLink}`;
  }

  public get rubicDomain(): string {
    return this.window.location.hostname;
  }

  get user$(): Observable<UserInterface> {
    return this.authService.getCurrentUser();
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly queryParamsService: QueryParamsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly iframeService: IframeService,
    private readonly authService: AuthService,
    private readonly walletsModalService: WalletsModalService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {
    this.loading = false;
    this.pageUpdate = new EventEmitter();
    this.scrollSubject$ = new BehaviorSubject(null);
  }

  ngAfterViewInit(): void {
    this.observeScroll();
  }

  /**
   * Function to track list element by unique key: token blockchain and address.
   * @param _index Index of list element.
   * @param tokenListElement List element.
   * @return string Unique key for element.
   */
  public trackByFn(_index: number, tokenListElement: AvailableTokenAmount): string {
    return `${tokenListElement.blockchain}_${tokenListElement.address}`;
  }

  /**
   * Observes list scroll and fetches new tokens if needed.
   */
  private observeScroll(): void {
    this.scrollSubject$
      .pipe(
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
        ),
        takeUntil(this.destroy$)
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

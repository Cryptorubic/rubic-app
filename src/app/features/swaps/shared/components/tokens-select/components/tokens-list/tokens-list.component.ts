import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Self,
  ViewChild
} from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { IframeService } from '@core/services/iframe/iframe.service';
import { LIST_ANIMATION } from '@features/swaps/shared/components/tokens-select/components/tokens-list/animations/list-animation';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WINDOW } from '@ng-web-apis/common';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/tokens-selector.service';
import { TokensService } from '@core/services/tokens/tokens.service';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
  animations: [LIST_ANIMATION]
})
export class TokensListComponent implements OnInit, AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) set virtualScroll(scroll: CdkVirtualScrollViewport) {
    if (scroll) {
      this.scrollSubject$.next(scroll);
    }
  }

  public listUpdating: boolean = false;

  public tokensToShow: AvailableTokenAmount[];

  /**
   * Controls animation of tokens list.
   */
  public listAnimationState: 'hidden' | 'shown';

  private readonly scrollSubject$: BehaviorSubject<CdkVirtualScrollViewport> = new BehaviorSubject(
    undefined
  );

  public readonly customToken$ = this.tokensSelectorService.customToken$;

  public readonly rubicDomain = 'app.rubic.exchange';

  public get noFrameLink(): string {
    return `https://${this.rubicDomain}${this.queryParamsService.noFrameLink}`;
  }

  public readonly iframeRubicLink = this.iframeService.rubicLink;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly queryParamsService: QueryParamsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly iframeService: IframeService,
    private readonly tokensSelectorService: TokensSelectorService,
    private readonly tokensService: TokensService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {}

  ngOnInit() {
    this.tokensSelectorService.blockchain$.subscribe(() => {
      if (this.scrollSubject$?.value) {
        this.scrollSubject$.value.scrollToIndex(0);
      }
    });

    combineLatest([
      this.tokensSelectorService.tokens$,
      this.tokensSelectorService.favoriteTokens$
    ]).subscribe(([tokens, favoriteTokens]) => {
      const tokensToShow =
        this.tokensSelectorService.listType === 'default' ? tokens : favoriteTokens;
      this.startAnimation(tokensToShow);
      this.tokensToShow = tokensToShow;
      this.cdr.detectChanges();
    });
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
        filter(value => Boolean(value)),
        switchMap(scroll =>
          scroll.renderedRangeStream.pipe(
            debounceTime(200),
            filter(renderedRange => {
              const tokensNetworkState =
                this.tokensService.tokensNetworkState[this.tokensSelectorService.blockchain];
              if (
                this.listUpdating ||
                this.tokensSelectorService.searchQuery ||
                this.tokensSelectorService.listType === 'favorite' ||
                !tokensNetworkState ||
                tokensNetworkState.maxPage === tokensNetworkState.page ||
                this.iframeService.isIframe
              ) {
                return false;
              }

              const bigVirtualElementsAmount = 10;
              const smallVirtualElementsAmount = 5;
              return this.tokensToShow.length > bigVirtualElementsAmount
                ? renderedRange.end > this.tokensToShow.length - bigVirtualElementsAmount
                : renderedRange.end > this.tokensToShow.length - smallVirtualElementsAmount;
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(shouldUpdate => {
        if (shouldUpdate) {
          this.listUpdating = true;
          this.cdr.detectChanges();
          this.tokensService.fetchNetworkTokens(this.tokensSelectorService.blockchain, () => {
            this.listUpdating = false;
            this.cdr.detectChanges();
          });
        }
      });
  }

  /**
   * Starts smooth animation when tokens list is distinctly changed.
   * @param tokens New tokens list.
   */
  private startAnimation(tokens: AvailableTokenAmount[]): void {
    let shouldAnimate = false;
    if (this.tokensToShow?.length && tokens.length) {
      const prevToken = this.tokensToShow[0];
      const newToken = tokens[0];
      shouldAnimate = prevToken.blockchain !== newToken.blockchain;

      const arePrevTokensFavourite = this.tokensToShow.every(t => t.favorite);
      const areNewTokensFavourite = tokens.every(t => t.favorite);
      shouldAnimate ||= arePrevTokensFavourite !== areNewTokensFavourite;
    }

    if (shouldAnimate) {
      this.listAnimationState = 'hidden';
      this.cdr.detectChanges();
      setTimeout(() => {
        this.listAnimationState = 'shown';
        this.cdr.detectChanges();
      });
    }
  }

  /**
   * Selects token.
   * @param token Selected token.
   */
  public onTokenSelect(token: AvailableTokenAmount): void {
    if (token.available) {
      this.tokensSelectorService.onTokenSelect(token);
    }
  }
}

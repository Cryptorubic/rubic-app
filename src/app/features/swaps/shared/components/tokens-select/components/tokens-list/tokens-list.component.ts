import {
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
import { TuiDestroyService } from '@taiga-ui/cdk';
import { IframeService } from '@core/services/iframe/iframe.service';
import { LIST_ANIMATION } from '@features/swaps/shared/components/tokens-select/components/tokens-list/animations/list-animation';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WINDOW } from '@ng-web-apis/common';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/tokens-selector.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { TokensListService } from '@features/swaps/shared/components/tokens-select/services/tokens-list-service/tokens-list.service';
import { SearchQueryService } from '@features/swaps/shared/components/tokens-select/services/search-query-service/search-query.service';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
  animations: [LIST_ANIMATION]
})
export class TokensListComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport) set virtualScroll(scroll: CdkVirtualScrollViewport) {
    this.tokensListService.setListScrollSubject(scroll);
  }

  public tokensToShow: AvailableTokenAmount[];

  /**
   * Controls animation of tokens list.
   */
  public listAnimationState: 'hidden' | 'shown';

  public readonly customToken$ = this.tokensListService.customToken$;

  public readonly loading$ = this.tokensListService.loading$;

  public readonly rubicDomain = 'app.rubic.exchange';

  public get noFrameLink(): string {
    return `https://${this.rubicDomain}${this.queryParamsService.noFrameLink}`;
  }

  public readonly iframeRubicLink = this.iframeService.rubicLink;

  private searchQuery: string;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly queryParamsService: QueryParamsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly iframeService: IframeService,
    private readonly tokensSelectorService: TokensSelectorService,
    private readonly tokensListService: TokensListService,
    private readonly searchQueryService: SearchQueryService,
    private readonly tokensService: TokensService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {}

  ngOnInit() {
    this.tokensListService.tokensToShow$.subscribe(tokensToShow => {
      this.startAnimation(tokensToShow);

      if (
        this.tokensToShow?.[0]?.blockchain !== tokensToShow?.[0]?.blockchain ||
        this.searchQuery !== this.searchQueryService.query
      ) {
        this.tokensListService.resetScrollToTop();
      }

      this.searchQuery = this.searchQueryService.query;
      this.tokensToShow = tokensToShow;
      this.cdr.detectChanges();
    });
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

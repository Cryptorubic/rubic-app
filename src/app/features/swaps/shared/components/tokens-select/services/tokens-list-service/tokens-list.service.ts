import { Injectable } from '@angular/core';
import { TokensListStoreService } from '@features/swaps/shared/components/tokens-select/services/tokens-list-service/tokens-list-store.service';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, map, pairwise, switchMap } from 'rxjs/operators';
import { TokensService } from '@core/services/tokens/tokens.service';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/tokens-selector.service';
import { SearchQueryService } from '@features/swaps/shared/components/tokens-select/services/search-query-service/search-query.service';
import { IframeService } from '@core/services/iframe/iframe.service';
import { ListAnimationType } from '@features/swaps/shared/components/tokens-select/services/tokens-list-service/models/list-animation-type';

@Injectable()
export class TokensListService {
  private readonly _listUpdating$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = combineLatest([
    this._listUpdating$,
    this.tokensListStoreService.searchLoading$
  ]).pipe(map(([listUpdating, searchLoading]) => listUpdating || searchLoading));

  public get loading(): boolean {
    return this._listUpdating$.value || this.tokensListStoreService.searchLoading;
  }

  public readonly tokensToShow$ = this.tokensListStoreService.tokensToShow$;

  public get tokensToShow(): AvailableTokenAmount[] {
    return this.tokensListStoreService.tokensToShow;
  }

  public readonly customToken$ = this.tokensListStoreService.customToken$;

  public get customToken(): AvailableTokenAmount {
    return this.tokensListStoreService.customToken;
  }

  private readonly listScrollSubject$ = new BehaviorSubject<CdkVirtualScrollViewport>(undefined);

  private readonly _listAnimationType$ = new BehaviorSubject<ListAnimationType>('shown');

  public readonly listAnimationType$ = this._listAnimationType$.asObservable();

  private set listAnimationType(value: ListAnimationType) {
    this._listAnimationType$.next(value);
  }

  constructor(
    private readonly tokensListStoreService: TokensListStoreService,
    private readonly tokensService: TokensService,
    private readonly tokensSelectorService: TokensSelectorService,
    private readonly searchQueryService: SearchQueryService,
    private readonly iframeService: IframeService
  ) {
    this.subscribeOnScroll();

    this.subscribeOnListType();
    this.subscribeOnTokensToShow();
  }

  public setListScrollSubject(scroll: CdkVirtualScrollViewport): void {
    if (scroll) {
      this.listScrollSubject$.next(scroll);
    }
  }

  public resetScrollToTop(): void {
    if (this.listScrollSubject$?.value) {
      this.listScrollSubject$.value.scrollToIndex(0);
    }
  }

  private subscribeOnScroll(): void {
    this.listScrollSubject$
      .pipe(
        filter(value => Boolean(value)),
        switchMap(scroll =>
          scroll.renderedRangeStream.pipe(
            filter(renderedRange => {
              const tokensNetworkState =
                this.tokensService.tokensNetworkState[this.tokensSelectorService.blockchain];
              if (
                this.loading ||
                this.searchQueryService.query ||
                this.tokensSelectorService.listType === 'favorite' ||
                !tokensNetworkState ||
                tokensNetworkState.maxPage === tokensNetworkState.page ||
                this.iframeService.isIframe
              ) {
                return false;
              }

              const bigVirtualElementsAmount = 3;
              return (
                this.tokensToShow.length > bigVirtualElementsAmount &&
                renderedRange.end > this.tokensToShow.length - bigVirtualElementsAmount
              );
            })
          )
        )
      )
      .subscribe(shouldUpdate => {
        if (shouldUpdate) {
          this._listUpdating$.next(true);
          this.tokensService.fetchNetworkTokens(this.tokensSelectorService.blockchain, () => {
            this._listUpdating$.next(false);
          });
        }
      });
  }

  private subscribeOnListType(): void {
    this.tokensSelectorService.listType$.subscribe(() => {
      this.tokensListStoreService.updateTokens();
    });
  }

  private subscribeOnTokensToShow(): void {
    let prevSearchQuery: string;
    let prevListType: string;

    this.tokensToShow$.pipe(pairwise()).subscribe(([prevTokensToShow, tokensToShow]) => {
      if (prevTokensToShow?.length && tokensToShow?.length) {
        const prevToken = prevTokensToShow[0];
        const newToken = tokensToShow[0];
        let shouldAnimate = prevToken.blockchain !== newToken.blockchain;

        shouldAnimate ||= prevListType !== this.tokensSelectorService.listType;
        prevListType = this.tokensSelectorService.listType;

        if (shouldAnimate) {
          this.listAnimationType = 'hidden';
          setTimeout(() => {
            this.listAnimationType = 'shown';
          });
        }
      }

      if (
        prevTokensToShow?.[0]?.blockchain !== tokensToShow?.[0]?.blockchain ||
        prevSearchQuery !== this.searchQueryService.query
      ) {
        this.resetScrollToTop();
        prevSearchQuery = this.searchQueryService.query;
      }
    });
  }
}

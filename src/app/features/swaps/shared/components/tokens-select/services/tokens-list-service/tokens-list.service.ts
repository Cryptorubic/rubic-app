import { Injectable } from '@angular/core';
import { TokensListStoreService } from '@features/swaps/shared/components/tokens-select/services/tokens-list-service/tokens-list-store.service';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { TokensService } from '@core/services/tokens/tokens.service';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/tokens-selector.service';
import { SearchQueryService } from '@features/swaps/shared/components/tokens-select/services/search-query-service/search-query.service';
import { IframeService } from '@core/services/iframe/iframe.service';

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

  constructor(
    private readonly tokensListStoreService: TokensListStoreService,
    private readonly tokensService: TokensService,
    private readonly tokensSelectorService: TokensSelectorService,
    private readonly searchQueryService: SearchQueryService,
    private readonly iframeService: IframeService
  ) {
    this.subscribeOnScroll();

    this.subscribeOnListType();
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
}

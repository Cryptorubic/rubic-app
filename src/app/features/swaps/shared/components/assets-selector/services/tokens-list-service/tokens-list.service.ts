import { Injectable } from '@angular/core';
import { TokensListStoreService } from '@features/swaps/shared/components/assets-selector/services/tokens-list-service/tokens-list-store.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, map, pairwise, switchMap, takeUntil } from 'rxjs/operators';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { SearchQueryService } from '@features/swaps/shared/components/assets-selector/services/search-query-service/search-query.service';
import { ListAnimationType } from '@features/swaps/shared/components/assets-selector/services/tokens-list-service/models/list-animation-type';
import { TokensListTypeService } from '@features/swaps/shared/components/assets-selector/services/tokens-list-service/tokens-list-type.service';
import { TokensListType } from '@features/swaps/shared/components/assets-selector/models/tokens-list-type';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { BlockchainName, BlockchainsInfo } from 'rubic-sdk';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { TokensNetworkService } from '@core/services/tokens/tokens-network.service';
import { TuiDestroyService } from '@taiga-ui/cdk';

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

  private readonly listScrollSubject$ = new BehaviorSubject<CdkVirtualScrollViewport>(undefined);

  private readonly _listAnimationType$ = new BehaviorSubject<ListAnimationType>('shown');

  public readonly listAnimationType$ = this._listAnimationType$.asObservable();

  private set listAnimationType(value: ListAnimationType) {
    this._listAnimationType$.next(value);
  }

  private get listType(): TokensListType {
    return this.tokensListTypeService.listType;
  }

  private get tokensToShow(): AvailableTokenAmount[] {
    return this.tokensListStoreService.tokensToShow;
  }

  constructor(
    private readonly tokensListStoreService: TokensListStoreService,
    private readonly tokensListTypeService: TokensListTypeService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly tokensNetworkService: TokensNetworkService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly searchQueryService: SearchQueryService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.subscribeOnScroll();

    this.subscribeOnTokensToShow();
  }

  public setListScrollSubject(scroll: CdkVirtualScrollViewport): void {
    if (scroll) {
      this.listScrollSubject$.next(scroll);
    }
  }

  public resetScrollToTop(): void {
    if (this.listScrollSubject$.value) {
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
              const blockchain = this.assetsSelectorService.assetType;
              if (!BlockchainsInfo.isBlockchainName(blockchain)) {
                return false;
              }
              const tokensNetworkState = this.tokensNetworkService.tokensNetworkState[blockchain];
              if (
                this.loading ||
                this.searchQueryService.query ||
                this.listType === 'favorite' ||
                !tokensNetworkState ||
                tokensNetworkState.maxPage === tokensNetworkState.page
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
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(shouldUpdate => {
        if (shouldUpdate) {
          this._listUpdating$.next(true);
          this.tokensNetworkService.fetchNetworkTokens(
            this.assetsSelectorService.assetType as BlockchainName,
            () => {
              this._listUpdating$.next(false);
            }
          );
        }
      });
  }

  private subscribeOnTokensToShow(): void {
    let prevSearchQuery = this.searchQueryService.query;
    let prevListType = this.listType;

    this.tokensListStoreService.tokensToShow$
      .pipe(pairwise(), takeUntil(this.destroy$))
      .subscribe(([prevTokensToShow, tokensToShow]) => {
        if (prevTokensToShow?.length && tokensToShow?.length) {
          const prevToken = prevTokensToShow[0];
          const newToken = tokensToShow[0];
          let shouldAnimate = prevToken.blockchain !== newToken.blockchain;

          shouldAnimate ||= prevListType !== this.listType;
          prevListType = this.listType;

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

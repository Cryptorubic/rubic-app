import { Injectable } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { combineLatestWith, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { BlockchainsInfo } from 'rubic-sdk';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { TokensNetworkService } from '@core/services/tokens/tokens-network.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { ListAnimationType } from '@features/trade/components/assets-selector/services/tokens-list-service/models/list-animation-type';
import { TokensListType } from '@features/trade/components/assets-selector/models/tokens-list-type';
import { TokensListStoreService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-store.service';
import { TokensListTypeService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-type.service';
import { SearchQueryService } from '@features/trade/components/assets-selector/services/search-query-service/search-query.service';
import { AssetsSelectorStateService } from '../assets-selector-state/assets-selector-state.service';
import {
  assertTokensNetworkStateKey,
  TokensNetworkStateKey
} from '@app/shared/models/tokens/paginated-tokens';
import { TokensNetworkStateService } from '@app/core/services/tokens/tokens-network-state.service';

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
    private readonly tokensNetworkStateService: TokensNetworkStateService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
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

  private resetScrollToTop(): void {
    if (this.listScrollSubject$.value) {
      this.listScrollSubject$.value.scrollToIndex(0);
    }
  }

  private subscribeOnScroll(): void {
    this.listScrollSubject$
      .pipe(
        filter(value => Boolean(value)),
        switchMap(sub => sub.renderedRangeStream),
        filter(range => !this.skipTokensFetching(range.end)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this._listUpdating$.next(true);
        const tokensNetworkStateKey = this.getTokensNetworkStateKey();
        this.tokensNetworkService.fetchNextPageOfTokensForSelectedAsset(tokensNetworkStateKey, () =>
          this._listUpdating$.next(false)
        );
      });
  }

  /**
   *
   */
  private getTokensNetworkStateKey(): TokensNetworkStateKey {
    assertTokensNetworkStateKey(this.assetsSelectorStateService.assetType);
    return this.assetsSelectorStateService.assetType;
  }

  private subscribeOnTokensToShow(): void {
    this.assetsSelectorStateService.assetType$
      .pipe(
        combineLatestWith(this.assetsSelectorStateService.tokenFilter$),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.resetScrollToTop();
        this.listAnimationType = 'hidden';
        setTimeout(() => {
          this.listAnimationType = 'shown';
        });
      });
  }

  private skipTokensFetching(currentIndex: number): boolean {
    const assetType = this.assetsSelectorStateService.assetType;
    if (!BlockchainsInfo.isBlockchainName(assetType)) return true;

    const tokensNetworkStateByAsset = this.tokensNetworkStateService.tokensNetworkState[assetType];

    if (
      Boolean(
        this.loading ||
          this.searchQueryService.query ||
          this.listType === 'favorite' ||
          !tokensNetworkStateByAsset ||
          tokensNetworkStateByAsset.maxPage === tokensNetworkStateByAsset.page
      )
    ) {
      return true;
    }

    const maxBufferToEnd = 10;
    const listSize = this.tokensToShow.length;
    const shouldSkip = listSize - currentIndex > maxBufferToEnd;

    return shouldSkip;
  }
}

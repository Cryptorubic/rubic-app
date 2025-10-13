import { Injectable } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject } from 'rxjs';
import { combineLatestWith, takeUntil } from 'rxjs/operators';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
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

@Injectable()
export class TokensListService {
  public get loading(): boolean {
    // @TODO TOKENS
    return false;
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
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly searchQueryService: SearchQueryService,
    private readonly destroy$: TuiDestroyService
  ) {
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
}

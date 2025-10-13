import { ChangeDetectionStrategy, Component, Input, Self, ViewChild } from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { distinctUntilChanged, Observable, of, switchMap, takeUntil } from 'rxjs';
import { LIST_ANIMATION } from '@features/trade/components/assets-selector/animations/list-animation';
import { TokensListService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list.service';
import { TokensListStoreService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-store.service';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { AssetsSelectorStateService } from '../../services/assets-selector-state/assets-selector-state.service';
import { AssetsSelectorService } from '../../services/assets-selector-service/assets-selector.service';
import { TokenFilter } from '../../models/token-filters';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { AssetType } from '@app/features/trade/models/asset';
import { SearchQueryService } from '../../services/search-query-service/search-query.service';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { AssetsSelectorFacadeService } from '@features/trade/components/assets-selector/services/assets-selector-facade.service';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [LIST_ANIMATION],
  providers: [TuiDestroyService]
})
export class TokensListComponent {
  @Input({ required: true }) type: 'from' | 'to';

  @ViewChild(CdkVirtualScrollViewport) set virtualScroll(scroll: CdkVirtualScrollViewport) {
    this.tokensListService.setListScrollSubject(scroll);
  }

  public get tokensLoading$(): Observable<boolean> {
    return this.assetsSelectorFacade.getAssetsService(this.type).assetListType$.pipe(
      switchMap(el => {
        if (el === 'allChains') {
          // return this.tokensFacade.isAllTokensLoading$;
        }
        // @TODO TOKENS
        if (el === 'gainers' || el === 'losers' || el === 'trending') {
          return of(false);
        }
        // if (el) {
        //   return this.tokensFacade.tokens$(el);
        // }
      })
    );
  }

  public readonly listAnimationState$ = this.tokensListService.listAnimationType$;

  public readonly customToken$ = this.tokensListStoreService.customToken$;

  public readonly isMobile = this.headerStore.isMobile;

  public readonly isBalanceLoading$ = this.tokensListStoreService.tokensToShow$.pipe(
    switchMap(
      () => of(false)
      // @TODO TOKENS BALANCES
      // this.balanceLoadingStateService.isBalanceLoading$({
      //   assetType: this.assetsSelectorStateService.assetType,
      //   tokenFilter: this.assetsSelectorStateService.tokenFilter
      // })
    )
  );

  public get isAllChainsOpened(): boolean {
    return this.assetsSelectorStateService.assetType === 'allChains';
  }

  public get assetType(): AssetType {
    return this.assetsSelectorStateService.assetType;
  }

  public readonly tokensToShow$ = this.tokensListStoreService.tokensToShow$;

  public readonly tokenFilter$ = this.assetsSelectorStateService.tokenFilter$;

  public readonly useLargeIframe = this.queryParamsService.useLargeIframe;

  constructor(
    private readonly tokensListService: TokensListService,
    private readonly tokensListStoreService: TokensListStoreService,
    private readonly mobileNativeService: MobileNativeModalService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly headerStore: HeaderStore,
    private readonly queryParamsService: QueryParamsService,
    private readonly searchQueryService: SearchQueryService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly tokensFacade: TokensFacadeService,
    private readonly assetsSelectorFacade: AssetsSelectorFacadeService
  ) {
    this.assetsSelectorStateService.tokenFilter$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.searchQueryService.setSearchQuery('');
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

  public onTokenSelect(token: AvailableTokenAmount): void {
    this.mobileNativeService.forceClose();

    if (token.available) {
      this.assetsSelectorService.onAssetSelect(token);
    }
  }

  public selectTokenFilter(filter: TokenFilter): void {
    this.assetsSelectorStateService.setTokenFilter(filter);
  }
}

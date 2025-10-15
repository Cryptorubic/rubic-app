import { ChangeDetectionStrategy, Component, Input, Self, ViewChild } from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { distinctUntilChanged, Observable, of, switchMap, takeUntil } from 'rxjs';
import { LIST_ANIMATION } from '@features/trade/components/assets-selector/animations/list-animation';
import { TokensListService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list.service';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { AssetsSelectorStateService } from '../../services/assets-selector-state/assets-selector-state.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { AssetListType, AssetType } from '@app/features/trade/models/asset';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { AssetsSelectorFacadeService } from '@features/trade/components/assets-selector/services/assets-selector-facade.service';
import { BlockchainsInfo } from '@cryptorubic/sdk';
import { map, tap } from 'rxjs/operators';

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
      switchMap(type => {
        if (type === 'allChains') {
          return this.tokensFacade.allTokens.loading$;
        }
        if (type === 'trending') {
          return this.tokensFacade.trending.loading$;
        }
        if (type === 'gainers') {
          return this.tokensFacade.gainers.loading$;
        }
        if (type === 'losers') {
          return this.tokensFacade.losers.loading$;
        }
        if (BlockchainsInfo.isBlockchainName(type)) {
          return this.tokensFacade.allTokens.loading$;
        }
        console.error(`Unknown asset list type: ${type}`);
      })
    );
  }

  public readonly listAnimationState$ = this.tokensListService.listAnimationType$;

  public get customToken$(): Observable<AvailableTokenAmount> {
    return this.assetsSelectorFacade.getAssetsService(this.type).customToken$;
  }

  public readonly isMobile = this.headerStore.isMobile;

  // @TODO TOKENS
  public readonly isBalanceLoading$ = of(false);

  public get isAllChainsOpened(): boolean {
    return this.assetsSelectorStateService.assetType === 'allChains';
  }

  public get assetType(): AssetType {
    return this.assetsSelectorStateService.assetType;
  }

  public get tokensToShow$(): Observable<AvailableTokenAmount[]> {
    if (!this.type) {
      return of([]);
    }
    return this.assetsSelectorFacade
      .getAssetsService(this.type)
      .assetListType$.pipe(
        switchMap(type => {
          if (BlockchainsInfo.isBlockchainName(type)) {
            return this.tokensFacade.blockchainTokens[type].tokens$.pipe(
              map(tokensObject => {
                return Object.values(tokensObject);
              })
            );
          }
          if (type === 'allChains') {
            return this.tokensFacade.allTokens.tokens$;
          }
        })
      )
      .pipe(tap(console.log));
  }

  public readonly tokenFilter$ = this.assetsSelectorStateService.tokenFilter$;

  public readonly useLargeIframe = this.queryParamsService.useLargeIframe;

  constructor(
    private readonly tokensListService: TokensListService,
    private readonly mobileNativeService: MobileNativeModalService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly headerStore: HeaderStore,
    private readonly queryParamsService: QueryParamsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly tokensFacade: TokensFacadeService,
    private readonly assetsSelectorFacade: AssetsSelectorFacadeService
  ) {
    this.assetsSelectorStateService.tokenFilter$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.assetsSelectorFacade.getAssetsService(this.type).assetsQuery = '';
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
      // @TODO SELECT
      // this.assetsSelectorService.onAssetSelect(token);
    }
  }

  public selectTokenFilter(filter: AssetListType): void {
    this.assetsSelectorFacade.getAssetsService(this.type).assetListType = filter;
  }
}

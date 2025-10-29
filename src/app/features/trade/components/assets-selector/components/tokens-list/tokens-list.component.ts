import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  Self,
  ViewChild,
  OnInit
} from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { LIST_ANIMATION } from '@features/trade/components/assets-selector/animations/list-animation';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { AssetsSelectorStateService } from '../../services/assets-selector-state/assets-selector-state.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { AssetListType } from '@app/features/trade/models/asset';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { BlockchainsInfo } from '@cryptorubic/sdk';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [LIST_ANIMATION],
  providers: [TuiDestroyService]
})
export class TokensListComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport) set virtualScroll(scroll: CdkVirtualScrollViewport) {
    this.scrollSubject$.next(scroll);
  }

  private readonly scrollSubject$ = new BehaviorSubject<CdkVirtualScrollViewport | null>(null);

  @Input({ required: true }) tokensToShow: AvailableTokenAmount[];

  @Input({ required: true }) customToken: AvailableTokenAmount | null;

  @Input({ required: true }) loading: boolean;

  private _listType: AssetListType;

  @Input({ required: true }) set listType(value: AssetListType) {
    if (value !== this._listType) {
      this.resetScrollToTop();
    }

    this._listType = value;
  }

  public get listType(): AssetListType {
    return this._listType;
  }

  @Input({ required: true }) balanceLoading: boolean;

  @Input({ required: true }) tokensSearchQuery: string;

  @Input({ required: true }) totalBlockchains: number = 100;

  @Output() selectAssetList = new EventEmitter<AssetListType>();

  @Output() selectToken = new EventEmitter<AvailableTokenAmount>();

  @Output() switchMode = new EventEmitter<void>();

  @Output() onTokenSearch = new EventEmitter<string>();

  public readonly isMobile = this.headerStore.isMobile;

  public get isUtility(): boolean {
    const isBlockchain = BlockchainsInfo.isBlockchainName(this.listType);
    return !isBlockchain;
  }

  public readonly useLargeIframe = this.queryParamsService.useLargeIframe;

  constructor(
    private readonly mobileNativeService: MobileNativeModalService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly headerStore: HeaderStore,
    private readonly queryParamsService: QueryParamsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly tokensFacade: TokensFacadeService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.subscribeOnScroll();
  }

  ngOnInit() {
    this.resetScrollToTop();
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
      this.selectToken.emit(token);
      // @TODO TOKENS
      // this.assetsSelectorService.onAssetSelect(token);
    }
  }

  public selectTokenFilter(assetFilter: AssetListType): void {
    this.selectAssetList.emit(assetFilter);
    // this.assetsSelectorFacade.getAssetsService(this.type).assetListType = filter;
  }

  // @ViewChild(CdkVirtualScrollViewport) set virtualScroll(scroll: CdkVirtualScrollViewport) {
  //   this.assetsSelectorFacade.getAssetsService(this.type).setListScrollSubject(scroll);
  // }

  // public get tokensLoading$(): Observable<boolean> {
  //   return this.assetsSelectorFacade.getAssetsService(this.type).assetListType$.pipe(
  //     switchMap(type => {
  //       if (type === 'allChains') {
  //         return this.tokensFacade.allTokens.loading$;
  //       }
  //       if (type === 'trending') {
  //         return this.tokensFacade.trending.loading$;
  //       }
  //       if (type === 'gainers') {
  //         return this.tokensFacade.gainers.loading$;
  //       }
  //       if (type === 'losers') {
  //         return this.tokensFacade.losers.loading$;
  //       }
  //       if (BlockchainsInfo.isBlockchainName(type)) {
  //         return this.tokensFacade.blockchainTokens[type].loading$;
  //       }
  //       console.error(`Unknown asset list type: ${type}`);
  //     })
  //   );
  // }

  // public get listAnimationState$(): Observable<ListAnimationType> {
  //   return this.assetsSelectorFacade.getAssetsService(this.type).listAnimationType$;
  // }

  // public get customToken$(): Observable<AvailableTokenAmount> {
  //   return this.assetsSelectorFacade.getAssetsService(this.type).customToken$;
  // }

  // public get tokensToShow$(): Observable<AvailableTokenAmount[]> {
  //   if (!this.type) {
  //     return of([]);
  //   }
  //   return this.assetsSelectorFacade
  //     .getAssetsService(this.type)
  //     .assetListType$.pipe(
  //       switchMap(type => {
  //         if (BlockchainsInfo.isBlockchainName(type)) {
  //           return this.tokensFacade.blockchainTokens[type].tokens$.pipe(
  //             map(tokensObject => {
  //               return Object.values(tokensObject).map(el => ({
  //                 ...el,
  //                 available: true,
  //                 amount: new BigNumber(null)
  //               }));
  //             })
  //           );
  //         }
  //         if (type === 'allChains') {
  //           return this.tokensFacade.allTokens.tokens$;
  //         }
  //       })
  //     )
  //     .pipe(
  //       distinctUntilChanged((prev, curr) => {
  //         return prev.length === curr.length;
  //       }),
  //       tap(console.log)
  //     );
  // }

  private subscribeOnScroll(): void {
    this.scrollSubject$
      .pipe(
        filter(value => Boolean(value)),
        switchMap(sub => sub.renderedRangeStream),
        filter(range => {
          return !this.skipTokensFetching(range.end);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const assetType = this.listType;
        if (!BlockchainsInfo.isBlockchainName(assetType)) return true;
        const tokensNetworkStateByAsset = this.tokensFacade.blockchainTokens[assetType];
        this.tokensFacade.fetchNewPage(tokensNetworkStateByAsset, false);
        this.cdr.detectChanges();
      });
  }

  private skipTokensFetching(currentIndex: number): boolean {
    const assetType = this.listType;
    if (!BlockchainsInfo.isBlockchainName(assetType)) return true;

    const tokensNetworkStateByAsset = this.tokensFacade.blockchainTokens[assetType];

    if (
      Boolean(
        tokensNetworkStateByAsset._pageLoading$.value ||
          this.tokensSearchQuery ||
          this.listType === 'favorite' ||
          !tokensNetworkStateByAsset ||
          !tokensNetworkStateByAsset.allowFetching
      )
    ) {
      return true;
    }

    const maxBufferToEnd = 10;
    const listSize = Object.values(tokensNetworkStateByAsset._tokensObject$.value).length;
    const shouldSkip = listSize - currentIndex > maxBufferToEnd;

    return shouldSkip;
  }

  private resetScrollToTop(): void {
    if (this.scrollSubject$.value) {
      this.scrollSubject$.value.scrollToIndex(0);
    }
  }
}

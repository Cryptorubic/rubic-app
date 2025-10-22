import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  Self
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
import { AssetsSelectorFacadeService } from '@features/trade/components/assets-selector/services/assets-selector-facade.service';
import { BlockchainsInfo } from '@cryptorubic/sdk';
import { TokensListType } from '@features/trade/components/assets-selector/models/tokens-list-type';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [LIST_ANIMATION],
  providers: [TuiDestroyService]
})
export class TokensListComponent {
  @Input({ required: true }) tokensToShow: AvailableTokenAmount[];

  @Input({ required: true }) customToken: AvailableTokenAmount | null;

  @Input({ required: true }) loading: boolean;

  @Input({ required: true }) listType: AssetListType;

  @Input({ required: true }) balanceLoading: boolean;

  @Input({ required: true }) tokensSearchQuery: string;

  @Input({ required: true }) totalBlockchains: number = 100;

  @Input({ required: true }) tokensType: TokensListType;

  @Output() selectAssetList = new EventEmitter<AssetListType>();

  @Output() selectToken = new EventEmitter<AvailableTokenAmount>();

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
    private readonly assetsSelectorFacade: AssetsSelectorFacadeService
  ) {}

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
    this.selectToken.emit(token);

    if (token.available) {
      // @TODO TOKENS
      // this.assetsSelectorService.onAssetSelect(token);
    }
  }

  public selectTokenFilter(filter: AssetListType): void {
    this.selectAssetList.emit(filter);
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
  protected readonly Boolean = Boolean;
}

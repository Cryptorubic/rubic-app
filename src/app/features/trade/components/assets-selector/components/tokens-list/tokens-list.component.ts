import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  Self,
  ViewChild,
  OnInit,
  ElementRef,
  Inject
} from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';

import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { AssetListType } from '@app/features/trade/models/asset';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AnimationBuilder } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { BlockchainsInfo } from '@cryptorubic/core';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // animations: [LIST_ANIMATION, LIST_ANIMATION_2, LIST_CHANGE_ANIMATION, containerAnim, innerAnim],
  providers: [TuiDestroyService]
})
export class TokensListComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport) set virtualScroll(scroll: CdkVirtualScrollViewport) {
    this.scrollSubject$.next(scroll);
  }

  @ViewChild('listWrapper') set listWrapper(listWrapper: ElementRef) {
    this._listWrapper = listWrapper;
  }

  private _listWrapper: ElementRef;

  private readonly scrollSubject$ = new BehaviorSubject<CdkVirtualScrollViewport | null>(null);

  public _tokensToShow: AvailableTokenAmount[] = [];

  @Input({ required: true }) set tokensToShow(value: AvailableTokenAmount[]) {
    this._tokensToShow = value;
  }

  @Input({ required: true }) customToken: AvailableTokenAmount | null;

  @Input({ required: true }) loading: boolean;

  private _listType: AssetListType;

  @Input({ required: true }) set listType(value: AssetListType) {
    if (value !== this._listType) {
      this.triggerAnimation();
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
    private readonly headerStore: HeaderStore,
    private readonly queryParamsService: QueryParamsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly tokensFacade: TokensFacadeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly builder: AnimationBuilder,
    @Inject(DOCUMENT) private readonly document: Document
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
    }
  }

  public selectTokenFilter(assetFilter: AssetListType): void {
    this.selectAssetList.emit(assetFilter);
  }

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

  private triggerAnimation(): void {
    const wrapper = this.document.getElementById('list-wrapper');
    if (wrapper) {
      wrapper.getAnimations().forEach(anim => anim.cancel());
      wrapper.animate(
        [
          { opacity: 0, transform: 'scale(1.03)' },
          { opacity: 1, transform: 'scale(1)' }
        ],
        {
          duration: 1000,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }
      );
    }
  }
}

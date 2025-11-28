import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Self
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { HeaderStore } from '@core/header/services/header.store';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { distinctUntilChanged, map, share, startWith, switchMap, tap } from 'rxjs/operators';
import { Asset, AssetListType } from '@features/trade/models/asset';
import { TradePageService } from '@app/features/trade/services/trade-page/trade-page.service';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { combineLatestWith, Observable, of } from 'rxjs';
import { AssetsService } from '@features/trade/components/assets-selector/services/blockchains-list-service/utils/assets.service';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { BlockchainFilters } from '@features/trade/components/assets-selector/components/blockchains-filter-list/models/BlockchainFilters';
import {
  AvailableBlockchain,
  BlockchainItem
} from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { BlockchainsInfo } from '@cryptorubic/sdk';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { FromAssetsService } from '@features/trade/components/assets-selector/services/from-assets.service';
import { ToAssetsService } from '@features/trade/components/assets-selector/services/to-assets.service';

@Component({
  selector: 'app-assets-selector-page',
  templateUrl: './assets-selector-page.component.html',
  styleUrls: ['./assets-selector-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class AssetsSelectorPageComponent implements OnInit, OnDestroy {
  private lastDefaultMode: AssetListType = 'allChains';

  @Input({ required: true }) type: 'from' | 'to';

  @Output() public readonly tokenSelect = new EventEmitter<Asset>();

  public readonly selectorListType$ = of('tokens');

  public readonly headerText$ = this.selectorListType$.pipe(
    map(type => (type === 'blockchains' ? 'Blockchains List' : 'Select Chain and Token'))
  );

  public readonly isMobile = this.headerStore.isMobile;

  public get assetsSelectorService(): AssetsService {
    return this.type === 'from' ? this.fromAssetsService : this.toAssetsService;
  }

  public get oppositeSelectorService(): AssetsService {
    return this.type === 'from' ? this.toAssetsService : this.fromAssetsService;
  }

  public tokensSearchQuery$: Observable<string>;

  public blockchainsSearchQuery$: Observable<string>;

  public balanceLoading$: Observable<boolean>;

  public tokensToShow$: Observable<AvailableTokenAmount[]>;

  public pageLoading$: Observable<boolean>;

  public assetListType$: Observable<AssetListType>;

  public customToken$: Observable<AvailableTokenAmount | null>;

  public blockchainFilter$: Observable<BlockchainFilters>;

  public totalBlockchains: number;

  public blockchainsToShow$: Observable<AvailableBlockchain[]>;

  constructor(
    private readonly headerStore: HeaderStore,
    @Inject(DOCUMENT) private readonly document: Document,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly tradePageService: TradePageService,
    private readonly tokensFacade: TokensFacadeService,
    private readonly formService: SwapsFormService,
    private readonly fromAssetsService: FromAssetsService,
    private readonly toAssetsService: ToAssetsService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.subscribeOnAssetsSelect();
  }

  ngOnInit(): void {
    this.setWindowHeight();
    this.assetListType$ = this.assetsSelectorService.assetListType$.pipe(
      distinctUntilChanged(),
      share(),
      startWith('allChains' as AssetListType)
    );

    this.tokensSearchQuery$ = this.assetsSelectorService.tokensSearchQuery$;
    this.blockchainsSearchQuery$ = this.assetsSelectorService.blockchainSearchQuery$;
    this.customToken$ = this.assetsSelectorService.customToken$;
    this.totalBlockchains = this.assetsSelectorService.availableBlockchains.length;
    this.blockchainFilter$ = this.assetsSelectorService.blockchainFilter$;
    this.blockchainsToShow$ = this.assetsSelectorService.blockchainsToShow$.pipe(share());

    this.balanceLoading$ = this.assetListType$.pipe(
      switchMap(type => {
        return this.tokensFacade.getTokensBasedOnType(type).balanceLoading$;
      })
    );
    this.tokensToShow$ = this.assetListType$.pipe(
      combineLatestWith(this.tokensSearchQuery$),
      switchMap(
        ([type, query]) =>
          this.tokensFacade.getTokensList(type, query, this.type, this.formService.inputValue)
        //   .pipe(
        //   debounceTime(50),
        //   tap(el => {
        //     this.tokensFacade.runFetchConditionally(type, query);
        //   })
        // )
      )
    );
    this.pageLoading$ = this.assetListType$.pipe(
      combineLatestWith(this.tokensSearchQuery$),
      switchMap(([type, query]) => {
        if (query && query.length >= 2) {
          return this.tokensFacade.getTokensBasedOnType(type, query).pageLoading$;
        }
        return this.tokensFacade.getTokensBasedOnType(type).pageLoading$;
      }),
      tap(() => {
        /**
         *  Async pipe may update the value earlier than Angular actually re-renders the view,
         *  causing the loader to disappear with a delay. Using detectChanges to ensure the view updates immediately.
         */
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.resetWindowHeight();
  }

  public backToForm(): void {
    this.tradePageService.setState('form');
  }

  /**
   * Sets window height through html class name, to prevent broken scroll in Safari.
   */
  private setWindowHeight(): void {
    if (this.isMobile) {
      this.document.documentElement.style.setProperty(
        '--window-inner-height',
        `${window.innerHeight}px`
      );
      this.document.documentElement.classList.add('is-locked');
      this.document.documentElement.classList.add('scroll-y');
    }
  }

  private resetWindowHeight(): void {
    this.document.documentElement.classList.remove('is-locked');
  }

  public handleBlockchainFilterSelection(filter: BlockchainFilters): void {
    this.assetsSelectorService.filterQuery = filter;
  }

  private subscribeOnAssetsSelect(): void {
    // @TODO TOKENS
    // this.assetsSelectorStateService.assetSelected$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(selectedAsset => {
    //     if (isMinimalToken(selectedAsset)) {
    //       this.tokensFacade.addToken(selectedAsset);
    //     }
    //     this.tokenSelect.emit(selectedAsset);
    //   });
  }

  public selectAssetList(item: BlockchainItem | AssetListType): void {
    if (typeof item === 'string') {
      this.assetsSelectorService.assetListType = item;
      return;
    }
    if (item?.name) {
      this.assetsSelectorService.assetListType = item.name;
    } else {
      this.assetsSelectorService.assetListType = 'allChains';
    }
  }

  public selectToken(token: AvailableTokenAmount): void {
    this.tokenSelect.emit(token);
  }

  public switchMode(): void {
    if (this.assetsSelectorService.assetListType === 'favorite') {
      this.assetsSelectorService.assetListType = this.lastDefaultMode;
    } else {
      this.lastDefaultMode = this.assetsSelectorService.assetListType;
      this.assetsSelectorService.assetListType = 'favorite';
    }
  }

  public onBlockchainsQuery(value: string): void {
    this.assetsSelectorService.blockchainSearchQuery = value;
  }

  public onTokensQuery(value: string): void {
    this.assetsSelectorService.tokensSearchQuery = value;
    if (value.length > 2) {
      const assetListType = this.assetsSelectorService.assetListType;
      const isBlockchain = BlockchainsInfo.isBlockchainName(assetListType);
      this.tokensFacade.buildSearchedList(value, isBlockchain ? assetListType : null);
    }
  }
}

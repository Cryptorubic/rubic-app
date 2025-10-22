import {
  ChangeDetectionStrategy,
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
import { map, share, startWith, switchMap, tap } from 'rxjs/operators';
import { AssetsSelectorServices } from '@features/trade/components/assets-selector/constants/assets-selector-services';
import { TokensListTypeService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-type.service';
import { Asset, AssetListType } from '@features/trade/models/asset';
import { TradePageService } from '@app/features/trade/services/trade-page/trade-page.service';
import { AssetsSelectorStateService } from '../../services/assets-selector-state/assets-selector-state.service';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { Observable, of } from 'rxjs';
import { AssetsService } from '@features/trade/components/assets-selector/services/blockchains-list-service/utils/assets.service';
import { AssetsSelectorFacadeService } from '@features/trade/components/assets-selector/services/assets-selector-facade.service';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { TokensListType } from '@features/trade/components/assets-selector/models/tokens-list-type';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { BlockchainFilters } from '@features/trade/components/assets-selector/components/blockchains-filter-list/models/BlockchainFilters';
import {
  AvailableBlockchain,
  BlockchainItem
} from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import BigNumber from 'bignumber.js';
import { BlockchainsInfo } from '@cryptorubic/sdk';
import { BlockchainTokenState } from '@core/services/tokens/models/new-token-types';

@Component({
  selector: 'app-assets-selector-page',
  templateUrl: './assets-selector-page.component.html',
  styleUrls: ['./assets-selector-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AssetsSelectorServices, TuiDestroyService]
})
export class AssetsSelectorPageComponent implements OnInit, OnDestroy {
  @Input({ required: true }) type: 'from' | 'to';

  @Output() public readonly tokenSelect = new EventEmitter<Asset>();

  public readonly selectorListType$ = of('tokens');

  public readonly headerText$ = this.selectorListType$.pipe(
    map(type => (type === 'blockchains' ? 'Blockchains List' : 'Select Chain and Token'))
  );

  public readonly isMobile = this.headerStore.isMobile;

  public get assetsSelectorService(): AssetsService {
    return this.assetsSelectorFacade.getAssetsService(this.type);
  }

  public tokensSearchQuery$: Observable<string>;

  public blockchainsSearchQuery$: Observable<string>;

  public balanceLoading$: Observable<boolean>;

  public tokensToShow$: Observable<AvailableTokenAmount[]>;

  public tokensType$: Observable<TokensListType>;

  public pageLoading$: Observable<boolean>;

  public assetListType$: Observable<AssetListType>;

  public customToken$: Observable<AvailableTokenAmount | null>;

  public blockchainFilter$: Observable<BlockchainFilters>;

  public totalBlockchains: number;

  public blockchainsToShow$: Observable<AvailableBlockchain[]>;

  constructor(
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly tokensListTypeService: TokensListTypeService,
    private readonly headerStore: HeaderStore,
    @Inject(DOCUMENT) private readonly document: Document,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly tradePageService: TradePageService,
    private readonly tokensFacade: TokensFacadeService,
    private readonly assetsSelectorFacade: AssetsSelectorFacadeService
  ) {
    this.subscribeOnAssetsSelect();
  }

  ngOnInit(): void {
    this.setWindowHeight();
    this.assetListType$ = this.assetsSelectorService.assetListType$.pipe(
      share(),
      startWith('allChains' as AssetListType)
    );

    this.tokensSearchQuery$ = this.assetsSelectorService.tokensSearchQuery$;
    this.blockchainsSearchQuery$ = this.assetsSelectorService.blockchainSearchQuery$;
    this.tokensType$ = this.assetsSelectorService.tokensType$;
    this.customToken$ = this.assetsSelectorService.customToken$;
    this.totalBlockchains = this.assetsSelectorService.availableBlockchains.length;
    this.blockchainFilter$ = this.assetsSelectorService.blockchainFilter$;
    this.blockchainsToShow$ = this.assetsSelectorService.blockchainsToShow$;

    this.balanceLoading$ = this.assetListType$.pipe(
      switchMap(type => this.tokensFacade.getTokensBasedOnType(type).balanceLoading$)
    );
    this.tokensToShow$ = this.assetListType$.pipe(
      switchMap(type => this.tokensFacade.getTokensBasedOnType(type).tokens$),
      map((tokens: BalanceToken[]) =>
        tokens.map(token => ({ ...token, available: true, amount: new BigNumber(NaN) }))
      ),
      tap(() => {
        const type = this.assetsSelectorService.assetListType;
        if (BlockchainsInfo.isBlockchainName(type)) {
          const tokensObject = this.tokensFacade.getTokensBasedOnType(type) as BlockchainTokenState;
          if (tokensObject.page === 1 && tokensObject.allowFetching) {
            this.tokensFacade.fetchNewPage(tokensObject);
          }
        }
      })
    );
    this.pageLoading$ = this.assetListType$.pipe(
      switchMap(type => this.tokensFacade.getTokensBasedOnType(type).pageLoading$)
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
}

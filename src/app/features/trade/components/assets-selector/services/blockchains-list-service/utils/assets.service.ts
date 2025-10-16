import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { Asset, AssetListType } from '@features/trade/models/asset';
import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import {
  BlockchainFilters,
  BlockchainTags
} from '@features/trade/components/assets-selector/components/blockchains-filter-list/models/BlockchainFilters';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { Injector, inject } from '@angular/core';
import { ModalService } from '@core/modals/services/modal.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import {
  blockchainsList,
  RankedBlockchain,
  temporarelyDisabledBlockchains
} from '@features/trade/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { disabledFromBlockchains } from '@features/trade/components/assets-selector/services/blockchains-list-service/constants/disabled-from-blockchains';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ListAnimationType } from '@features/trade/components/assets-selector/services/tokens-list-service/models/list-animation-type';

export abstract class AssetsService {
  // List scroll (virtual scroll)
  private readonly listScrollSubject$ = new BehaviorSubject<CdkVirtualScrollViewport>(undefined);

  // List animation type
  private readonly _listAnimationType$ = new BehaviorSubject<ListAnimationType>('shown');

  public readonly listAnimationType$ = this._listAnimationType$.asObservable();

  private set listAnimationType(value: ListAnimationType) {
    this._listAnimationType$.next(value);
  }

  // Custom token
  protected readonly _customToken$ = new BehaviorSubject<AvailableTokenAmount | null>(null);

  public readonly customToken$ = this._customToken$.asObservable();

  // Assets query (tokens)

  protected readonly _assetsQuery$ = new BehaviorSubject<string>('');

  public readonly assetsQuery$ = this._assetsQuery$.asObservable();

  public get assetsQuery(): string {
    return this._assetsQuery$.value;
  }

  public set assetsQuery(value: string) {
    this._assetsQuery$.next(value.trim());
  }

  // Asset type query (blockchains or allChains or utility)

  private readonly _assetTypeQuery$ = new BehaviorSubject<string>('');

  public readonly assetTypeQuery$ = this._assetTypeQuery$.asObservable();

  public get assetTypeQuery(): string {
    return this._assetTypeQuery$.value;
  }

  public set assetTypeQuery(value: string) {
    this._assetTypeQuery$.next(value.trim());
  }

  // Assets list type (allChains or specific blockchain or utility)

  protected readonly _assetListType$ = new BehaviorSubject<AssetListType>('allChains');

  public readonly assetListType$ = this._assetListType$.asObservable();

  public set assetListType(value: AssetListType) {
    this._assetListType$.next(value);
  }

  // Selected asset

  private readonly _selectedAsset$ = new Subject<Asset>();

  public readonly selectedAsset$ = this._selectedAsset$.asObservable();

  public set selectedAsset(value: Asset) {
    this._selectedAsset$.next(value);
  }

  // Avaialble blockchains

  protected _availableBlockchains: AvailableBlockchain[] = [];

  public get availableBlockchains(): AvailableBlockchain[] {
    return this._availableBlockchains;
  }

  // Blockchains to show

  protected readonly _blockchainsToShow$ = new BehaviorSubject<AvailableBlockchain[]>([]);

  public readonly blockchainsToShow$ = this._blockchainsToShow$.asObservable();

  public get blockchainsToShow(): AvailableBlockchain[] {
    return this._blockchainsToShow$.getValue();
  }

  protected set blockchainsToShow(value: AvailableBlockchain[]) {
    this._blockchainsToShow$.next(value);
  }

  // assetsBlockchainsToShow

  protected readonly _assetsBlockchainsToShow$ = new BehaviorSubject<AvailableBlockchain[]>([]);

  public readonly assetsBlockchainsToShow$ = this._assetsBlockchainsToShow$.asObservable();

  public get assetsBlockchainsToShow(): AvailableBlockchain[] {
    return this._assetsBlockchainsToShow$.getValue();
  }

  protected set assetsBlockchainsToShow(value: AvailableBlockchain[]) {
    this._assetsBlockchainsToShow$.next(value);
  }

  // Chain filter

  protected readonly _filterQuery$ = new BehaviorSubject<BlockchainFilters>('All');

  public readonly filterQuery$ = this._filterQuery$.asObservable();

  // Services

  private readonly queryParamsService = inject(QueryParamsService);

  private readonly platformConfigurationService = inject(PlatformConfigurationService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly injector = inject(Injector);

  private readonly modalService = inject(ModalService);

  private readonly destroy$ = inject(TuiDestroyService);

  public set filterQuery(value: BlockchainFilters) {
    if (value === this._filterQuery$.getValue() && value !== BlockchainTags.ALL) {
      this._filterQuery$.next(BlockchainTags.ALL);
    } else {
      this._filterQuery$.next(value);
      this.modalService.openMobileBlockchainList(this.injector);
    }
  }

  protected constructor() {
    this.setAvailableBlockchains();
    this.blockchainsToShow = this._availableBlockchains;
    this.assetsBlockchainsToShow = this._availableBlockchains;

    this.subscribeOnSearchQuery();
    this.subscribeOnFilterQuery();
    // this.subscribeOnTokenSelection();
  }

  public closeSelector(): void {
    this.assetsQuery = '';
    this.assetTypeQuery = '';
    this.assetListType = 'allChains';
  }

  // private subscribeOnAssetChange(): void {
  //   this.assetListType$.pipe(distinctUntilChanged()).subscribe(assetListType => {
  //     this.assetsQuery = '';
  //     if (
  //       BlockchainsInfo.isBlockchainName(assetListType) &&
  //       !this.swapFormService.inputValue.fromBlockchain
  //     ) {
  //       this.swapFormService.inputControl.patchValue({
  //         fromBlockchain: assetListType
  //       });
  //     }
  //   });
  // }

  protected setAvailableBlockchains(): void {
    let blockchains: readonly RankedBlockchain[] = blockchainsList;
    if (this.queryParamsService.enabledBlockchains) {
      blockchains = blockchains.filter(blockchain =>
        this.queryParamsService.enabledBlockchains.includes(blockchain.name)
      );
    }
    const availableBlockchains = blockchains.map(blockchain => {
      // // @TODO REMOVE
      const disabledConfiguration = !this.platformConfigurationService.isAvailableBlockchain(
        blockchain.name
      );
      const disabledFrom = disabledFromBlockchains.includes(blockchain.name);

      return {
        name: blockchain.name,
        rank: blockchain.rank,
        icon: blockchainIcon[blockchain.name],
        label: blockchainLabel[blockchain.name],
        tags: blockchain.tags,
        disabledConfiguration,
        disabledFrom
      };
    });
    const userBlockchain = this.walletConnectorService.network;
    const sortedAvailableBlockchains = availableBlockchains.sort((a, b) => b.rank - a.rank);
    this._availableBlockchains = sortedAvailableBlockchains.sort((a, b) => {
      if (a.name === userBlockchain) return -1;
      if (b.name === userBlockchain) return 1;
      return 0;
    });
  }

  protected subscribeOnSearchQuery(): void {
    combineLatest([this.filterQuery$, this.assetsQuery$])
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(([filterQuery, searchQuery]) => {
        this.assetsBlockchainsToShow = this.filterBlockchains(filterQuery).filter(blockchain => {
          return (
            blockchain.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blockchain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (blockchain.tags.length &&
              blockchain.tags.join(' ').toLowerCase().includes(searchQuery.toLowerCase()))
          );
        });
        this.blockchainsToShow = this.assetsBlockchainsToShow;
      });
  }

  protected subscribeOnFilterQuery(): void {
    this.filterQuery$
      .pipe(
        tap(filterQuery => {
          if (filterQuery === BlockchainTags.ALL || !filterQuery) {
            this.blockchainsToShow = this.availableBlockchains;
          } else {
            this.blockchainsToShow = this.availableBlockchains.filter(blockchain =>
              blockchain.tags.includes(filterQuery)
            );
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  // private subscribeOnTokenSelection(): void {
  //   this.swapFormService.fromToken$
  //     .pipe(
  //       combineLatestWith(this.swapFormService.toToken$),
  //       filter(([fromToken, toToken]) => !isNil(fromToken) || !isNil(toToken)),
  //       takeUntil(this.destroy$)
  //     )
  //     .subscribe(([fromToken, toToken]) => {
  //       this.setChainInTopOfAssetsBlockchains(fromToken, toToken);
  //     });
  // }

  protected setChainInTopOfAssetsBlockchains(fromToken: TokenAmount, toToken: TokenAmount): void {
    let firstSelectedChainName = fromToken?.blockchain;
    const chainFromOppositeSelector = toToken?.blockchain;

    if (!firstSelectedChainName) firstSelectedChainName = chainFromOppositeSelector;
    const firstAssetIndex = this.assetsBlockchainsToShow.findIndex(
      asset => asset?.name === firstSelectedChainName
    );
    const [firstAsset] = this.assetsBlockchainsToShow.splice(firstAssetIndex, 1);
    this.assetsBlockchainsToShow.unshift(firstAsset);
  }

  private filterBlockchains(filterQuery: BlockchainFilters): AvailableBlockchain[] {
    if (filterQuery === BlockchainTags.ALL || !filterQuery) {
      return this.availableBlockchains;
    } else {
      return this.availableBlockchains.filter(blockchain => blockchain.tags.includes(filterQuery));
    }
  }

  public isDisabled(blockchain: AvailableBlockchain): boolean {
    return (
      blockchain.disabledConfiguration ||
      this.isDisabledFrom(blockchain) ||
      this.isDisabledTo(blockchain)
    );
  }

  public isDisabledFrom(blockchain: AvailableBlockchain): boolean {
    return blockchain.disabledFrom;
  }

  public isDisabledTo(_blockchain: AvailableBlockchain): boolean {
    return false;
    // if (this.assetsSelectorStateService.formType !== 'to') {
    //   return false;
    // }
    // return false;
  }

  public getHintText(blockchain: AvailableBlockchain): string | null {
    if (blockchain.disabledConfiguration || this.isDisabledFrom(blockchain)) {
      return temporarelyDisabledBlockchains.includes(blockchain.name)
        ? 'Сoming soon'
        : 'Temporary disabled';
    }
    if (this.isDisabledTo(blockchain)) {
      return 'Cannot trade with fiats';
    }
    return null;
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

  // @TODO TOKENS
  // private getTokensNetworkStateKey(): TokensNetworkStateKey {
  //   assertTokensNetworkStateKey(this.assetsSelectorStateService.assetType);
  //   return this.assetsSelectorStateService.assetType;
  // }

  // @TODO TOKENS
  // private subscribeOnTokensToShow(): void {
  //   this.assetType$.pipe(
  //       combineLatestWith(this.assetsSelectorStateService.tokenFilter$),
  //       takeUntil(this.destroy$)
  //     )
  //     .subscribe(() => {
  //       this.resetScrollToTop();
  //       this.listAnimationType = 'hidden';
  //       setTimeout(() => {
  //         this.listAnimationType = 'shown';
  //       });
  //     });
  // }
}

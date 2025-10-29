import { BehaviorSubject, combineLatestWith } from 'rxjs';
import { AssetListType } from '@features/trade/models/asset';
import {
  AvailableBlockchain,
  BlockchainItem
} from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import {
  BlockchainFilters,
  BlockchainTag,
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
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ListAnimationType } from '@features/trade/components/assets-selector/services/tokens-list-service/models/list-animation-type';
import { TokensListType } from '@features/trade/components/assets-selector/models/tokens-list-type';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { BlockchainsInfo } from '@cryptorubic/sdk';
import { BlockchainName } from '@cryptorubic/core';

export abstract class AssetsService {
  // Tokens type (default or favorite)
  private readonly _tokensType$ = new BehaviorSubject<TokensListType>('default');

  public readonly tokensType$ = this._tokensType$.asObservable();

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

  // Tokens search query (tokens)
  protected readonly _tokensSearchQuery$ = new BehaviorSubject<string>('');

  public readonly tokensSearchQuery$ = this._tokensSearchQuery$
    .asObservable()
    .pipe(debounceTime(200));

  public get tokensSearchQuery(): string {
    return this._tokensSearchQuery$.value;
  }

  public set tokensSearchQuery(value: string) {
    this._tokensSearchQuery$.next(value.trim());
  }

  // Blockchains search query

  private readonly _blockchainSearchQuery$ = new BehaviorSubject<string>('');

  public readonly blockchainSearchQuery$ = this._blockchainSearchQuery$.asObservable();

  public get blockchainSearchQuery(): string {
    return this._blockchainSearchQuery$.value;
  }

  public set blockchainSearchQuery(value: string) {
    this._blockchainSearchQuery$.next(value.trim());
  }

  // Assets list type (allChains or specific blockchain or utility)
  protected readonly _assetListType$ = new BehaviorSubject<AssetListType>('allChains');

  public readonly assetListType$ = this._assetListType$.asObservable();

  public set assetListType(value: AssetListType) {
    this._assetListType$.next(value);
  }

  public get assetListType(): AssetListType {
    return this._assetListType$.value;
  }

  // Avaialble blockchains
  protected _availableBlockchains: AvailableBlockchain[] = [];

  public get availableBlockchains(): AvailableBlockchain[] {
    return this._availableBlockchains;
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

  // Blockchain filter
  protected readonly _blockchainFilter$ = new BehaviorSubject<BlockchainFilters>('All');

  public readonly blockchainFilter$ = this._blockchainFilter$.asObservable();

  // Services

  private readonly queryParamsService = inject(QueryParamsService);

  private readonly platformConfigurationService = inject(PlatformConfigurationService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly injector = inject(Injector);

  private readonly modalService = inject(ModalService);

  private readonly destroy$ = inject(TuiDestroyService);

  private readonly tokensFacade = inject(TokensFacadeService);

  public set filterQuery(value: BlockchainFilters) {
    if (value === this._blockchainFilter$.getValue() && value !== BlockchainTags.ALL) {
      this._blockchainFilter$.next(BlockchainTags.ALL);
    } else {
      this._blockchainFilter$.next(value);
      this.modalService.openMobileBlockchainList(this.injector);
    }
  }

  // Blockchains to show
  protected readonly _blockchainsToShow$ = new BehaviorSubject<AvailableBlockchain[]>([]);

  public readonly blockchainsToShow$ = this._blockchainsToShow$.asObservable().pipe(
    combineLatestWith(this.blockchainSearchQuery$, this.blockchainFilter$),
    map(([chains, query, filters]) =>
      chains.filter(
        chain => this.filterQueryBlockchain(query, chain) && this.filterByType(filters, chain)
      )
    )
  );

  public get blockchainsToShow(): AvailableBlockchain[] {
    return this._blockchainsToShow$.getValue();
  }

  protected set blockchainsToShow(value: AvailableBlockchain[]) {
    this._blockchainsToShow$.next(value);
  }

  protected constructor() {
    this.setAvailableBlockchains();
    this.blockchainsToShow = this._availableBlockchains;
    this.assetsBlockchainsToShow = this._availableBlockchains;

    // this.subscribeOnTokensToShow();
  }

  public closeSelector(): void {
    this.tokensSearchQuery = '';
    this.blockchainSearchQuery = '';
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

  protected setChainInTopOfAssetsBlockchains(fromToken: BalanceToken, toToken: BalanceToken): void {
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

  public abstract isDisabledFrom(blockchain: AvailableBlockchain): boolean;

  public isDisabledTo(_blockchain: AvailableBlockchain): boolean {
    return false;
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

  private filterQueryBlockchain(searchQuery: string, blockchain: BlockchainItem): boolean {
    return (
      blockchain.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blockchain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blockchain.tags.length &&
        blockchain.tags.join(' ').toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  private filterByType(filter: null | BlockchainTag, chain: AvailableBlockchain): boolean {
    if (filter === BlockchainTags.ALL || !filter) {
      return true;
    } else {
      return chain.tags.includes(filter);
    }
  }

  public fetchSearchQueryTokens(): void {
    this.tokensSearchQuery$.pipe(distinctUntilChanged(), debounceTime(200)).subscribe(query => {
      const isBlockchain = BlockchainsInfo.isBlockchainName(this.assetListType);
      this.tokensFacade.fetchQueryTokens(
        query,
        isBlockchain ? (this.assetListType as BlockchainName) : null
      );
    });
  }
}

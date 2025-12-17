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
import {
  blockchainsList,
  RankedBlockchain,
  temporarelyDisabledBlockchains
} from '@features/trade/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { disabledFromBlockchains } from '@features/trade/components/assets-selector/services/blockchains-list-service/constants/disabled-from-blockchains';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { debounceTime, first, map } from 'rxjs/operators';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { BlockchainsInfo } from '@cryptorubic/core';

export abstract class AssetsService {
  // Custom token
  protected readonly _customToken$ = new BehaviorSubject<AvailableTokenAmount | null>(null);

  public readonly customToken$ = this._customToken$.asObservable();

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

  public readonly assetListType$ = this._assetListType$.asObservable().pipe(debounceTime(20));

  public set assetListType(value: AssetListType) {
    console.log(value);
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

  protected constructor(private readonly type: 'from' | 'to') {
    this.setAvailableBlockchains();
    this.blockchainsToShow = this._availableBlockchains;
    this.assetsBlockchainsToShow = this._availableBlockchains;
    this.subscribeOnQueryParams();
    // this.subscribeOnTokensToShow();
  }

  public closeSelector(): void {
    this.blockchainSearchQuery = '';
  }

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

  private subscribeOnQueryParams(): void {
    console.log(this.type);
    this.queryParamsService.queryParams$
      .pipe(
        first(),
        map(query => (this.type === 'from' ? query?.fromChain : query?.toChain))
      )
      .subscribe(queryChain => {
        console.log('QQQ queryChain', queryChain);
        if (queryChain && BlockchainsInfo.isBlockchainName(queryChain)) {
          this.assetListType = queryChain;
        }
      });
  }
}

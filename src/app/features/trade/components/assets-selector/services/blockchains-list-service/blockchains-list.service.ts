import { Injectable } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import {
  blockchainsList,
  notEvmChangeNowBlockchainsList,
  RankedBlockchain
} from '@features/trade/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { IframeService } from '@core/services/iframe-service/iframe.service';
import { disabledFromBlockchains } from '@features/trade/components/assets-selector/services/blockchains-list-service/constants/disabled-from-blockchains';
import { BlockchainName } from 'rubic-sdk';
import { FilterQueryService } from '../filter-query-service/filter-query.service';
import {
  BlockchainFilters,
  BlockchainTags
} from '../../components/blockchains-filter-list/models/BlockchainFilters';
import { AssetsSearchQueryService } from '../assets-search-query-service/assets-search-query.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';

@Injectable()
export class BlockchainsListService {
  private _availableBlockchains: AvailableBlockchain[];

  public get availableBlockchains(): AvailableBlockchain[] {
    return this._availableBlockchains;
  }

  private readonly _blockchainsToShow$ = new BehaviorSubject<AvailableBlockchain[]>([]);

  private readonly _assetsBlockchainsToShow$ = new BehaviorSubject<AvailableBlockchain[]>([]);

  public readonly blockchainsToShow$ = this._blockchainsToShow$.asObservable();

  public readonly assetsBlockchainsToShow$ = this._assetsBlockchainsToShow$.asObservable();

  private set blockchainsToShow(value: AvailableBlockchain[]) {
    this._blockchainsToShow$.next(value);
  }

  public get blockchainsToShow(): AvailableBlockchain[] {
    return this._blockchainsToShow$.getValue();
  }

  private set assetsBlockchainsToShow(value: AvailableBlockchain[]) {
    this._assetsBlockchainsToShow$.next(value);
  }

  public get assetsBlockchainsToShow(): AvailableBlockchain[] {
    return this._assetsBlockchainsToShow$.getValue();
  }

  /**
   * Contains last selected blockchain, which is not included by default in blockchains-aside list.
   */
  public lastSelectedHiddenBlockchain: AvailableBlockchain | undefined;

  private readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly queryParamsService: QueryParamsService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly assetsSearchQueryService: AssetsSearchQueryService,
    private readonly swapFormService: SwapsFormService,
    private readonly destroy$: TuiDestroyService,
    private readonly iframeService: IframeService,
    private readonly filterQueryService: FilterQueryService,
    private readonly headerStore: HeaderStore,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.setAvailableBlockchains();
    this.blockchainsToShow = this._availableBlockchains;

    this.subscribeOnSearchQuery();
    this.subscribeOnFilterQuery();
  }

  private setAvailableBlockchains(): void {
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
      const disabledFrom = !this.iframeService.isIframe
        ? disabledFromBlockchains.includes(blockchain.name)
        : (Object.values(notEvmChangeNowBlockchainsList) as BlockchainName[]).includes(
            blockchain.name
          );

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
    // const userBlockchainIndex = availableBlockchains.findIndex(blockchain=>blockchain.name === userBlockchain)
    const sortedAvailableBlockchains = availableBlockchains.sort((a, b) => b.rank - a.rank);
    this._availableBlockchains = sortedAvailableBlockchains.sort((a, b) => {
      if (a.name.includes(userBlockchain)) return -1;
      if (b.name.includes(userBlockchain)) return 1;
      return 0;
    });
  }

  private subscribeOnSearchQuery(): void {
    combineLatest([
      this.filterQueryService.filterQuery$,
      this.assetsSearchQueryService.assetsQuery$
    ])
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(([filterQuery, searchQuery]) => {
        this.blockchainsToShow = this.filterBlockchains(filterQuery);
        this.assetsBlockchainsToShow = this.filterBlockchains(filterQuery).filter(blockchain => {
          return (
            blockchain.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blockchain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (blockchain.tags.length &&
              blockchain.tags.join(' ').toLowerCase().includes(searchQuery.toLowerCase()))
          );
        });
        if (!this.isMobile) {
          this.blockchainsToShow = this.assetsBlockchainsToShow;
        }
      });
  }

  private subscribeOnFilterQuery(): void {
    this.filterQueryService.filterQuery$
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
    return this.assetsSelectorService.formType === 'from' && blockchain.disabledFrom;
  }

  public isDisabledTo(_blockchain: AvailableBlockchain): boolean {
    if (this.assetsSelectorService.formType !== 'to') {
      return false;
    }
    const fromAssetType = this.assetsSelectorService.getAssetType('from');
    return fromAssetType === 'fiat';
  }

  public getHintText(blockchain: AvailableBlockchain): string | null {
    if (this.isDisabledFrom(blockchain)) {
      return 'Select as target network';
    }
    if (this.isDisabledTo(blockchain)) {
      return 'Cannot trade with fiats';
    }
    if (blockchain.disabledConfiguration) {
      return 'Temporary disabled';
    }
    return null;
  }
}

import { Injectable } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { SearchQueryService } from '@features/trade/components/assets-selector/services/search-query-service/search-query.service';
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
import { BlockchainTags } from '../../components/blockchains-filter-list/models/BlockchainFilters';

@Injectable()
export class BlockchainsListService {
  private _availableBlockchains: AvailableBlockchain[];

  public get availableBlockchains(): AvailableBlockchain[] {
    return this._availableBlockchains;
  }

  private readonly _blockchainsToShow$ = new BehaviorSubject<AvailableBlockchain[]>([]);

  public readonly blockchainsToShow$ = this._blockchainsToShow$.asObservable();

  private set blockchainsToShow(value: AvailableBlockchain[]) {
    this._blockchainsToShow$.next(value);
  }

  public get blockchainsToShow(): AvailableBlockchain[] {
    return this._blockchainsToShow$.getValue();
  }

  /**
   * Contains last selected blockchain, which is not included by default in blockchains-aside list.
   */
  public lastSelectedHiddenBlockchain: AvailableBlockchain | undefined;

  constructor(
    private readonly queryParamsService: QueryParamsService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly searchQueryService: SearchQueryService,
    private readonly swapFormService: SwapsFormService,
    private readonly destroy$: TuiDestroyService,
    private readonly iframeService: IframeService,
    private readonly filterQueryService: FilterQueryService
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

    this._availableBlockchains = availableBlockchains.sort((a, b) => b.rank - a.rank);
  }

  private subscribeOnSearchQuery(): void {
    combineLatest([this.searchQueryService.query$, this.assetsSelectorService.selectorListType$])
      .pipe(
        filter(([_, selectorListType]) => selectorListType === 'blockchains'),
        debounceTime(200),
        map(([query]) => query),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.blockchainsToShow = this.availableBlockchains.filter(blockchain => {
          return (
            blockchain.label.toLowerCase().includes(query.toLowerCase()) ||
            blockchain.name.toLowerCase().includes(query.toLowerCase()) ||
            (blockchain.tags.length &&
              blockchain.tags.join(' ').toLowerCase().includes(query.toLowerCase()))
          );
        });
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

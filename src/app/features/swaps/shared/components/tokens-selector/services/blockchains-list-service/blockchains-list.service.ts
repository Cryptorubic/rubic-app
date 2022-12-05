import { Injectable } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { AvailableBlockchain } from '@features/swaps/shared/components/tokens-selector/services/blockchains-list-service/models/available-blockchain';
import { blockchainsList } from '@features/swaps/shared/components/tokens-selector/services/blockchains-list-service/constants/blockchains-list';
import { disabledFromBlockchains } from '@features/swaps/shared/components/tokens-selector/services/blockchains-list-service/constants/disabled-from-blockchains';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-selector/services/tokens-selector-service/tokens-selector.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { SearchQueryService } from '@features/swaps/shared/components/tokens-selector/services/search-query-service/search-query.service';
import { filter, map } from 'rxjs/operators';

@Injectable()
export class BlockchainsListService {
  public readonly availableBlockchains: AvailableBlockchain[];

  private readonly _blockchainsToShow$ = new BehaviorSubject<AvailableBlockchain[]>([]);

  public readonly blockchainsToShow$ = this._blockchainsToShow$.asObservable();

  private set blockchainsToShow(value: AvailableBlockchain[]) {
    this._blockchainsToShow$.next(value);
  }

  /**
   * Contains last selected blockchain, which is not included by default in blockchains-aside list.
   */
  public lastSelectedHiddenBlockchain: AvailableBlockchain | undefined;

  constructor(
    private readonly queryParamsService: QueryParamsService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly tokensSelectorService: TokensSelectorService,
    private readonly searchQueryService: SearchQueryService
  ) {
    let blockchains = blockchainsList;
    if (queryParamsService.enabledBlockchains) {
      blockchains = blockchains.filter(blockchain =>
        queryParamsService.enabledBlockchains.includes(blockchain)
      );
    }
    this.availableBlockchains = blockchains.map(blockchainName => {
      const disabledConfiguration =
        !this.platformConfigurationService.isAvailableBlockchain(blockchainName);
      const disabledFrom = disabledFromBlockchains.includes(blockchainName);

      return {
        name: blockchainName,
        icon: blockchainIcon[blockchainName],
        label: blockchainLabel[blockchainName],
        disabledConfiguration,
        disabledFrom
      };
    });
    this.blockchainsToShow = this.availableBlockchains;

    this.subscribeOnSearchQuery();
  }

  private subscribeOnSearchQuery(): void {
    combineLatest([this.searchQueryService.query$, this.tokensSelectorService.selectorListType$])
      .pipe(
        filter(([_, selectorListType]) => selectorListType === 'blockchains'),
        map(([query]) => query)
      )
      .subscribe(query => {
        this.blockchainsToShow = this.availableBlockchains.filter(blockchain =>
          blockchain.name.toLowerCase().includes(query.toLowerCase())
        );
      });
  }

  public isDisabled(blockchain: AvailableBlockchain): boolean {
    return blockchain.disabledConfiguration || this.isDisabledFrom(blockchain);
  }

  public isDisabledFrom(blockchain: AvailableBlockchain): boolean {
    return this.tokensSelectorService.formType === 'from' && blockchain.disabledFrom;
  }

  public getHintText(blockchain: AvailableBlockchain): string | null {
    if (this.isDisabledFrom(blockchain)) {
      return 'Select as target network';
    }
    if (blockchain.disabledConfiguration) {
      return 'Temporary disabled';
    }
    return null;
  }
}

import { Injectable } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { AvailableBlockchain } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { blockchainsList } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { disabledFromBlockchains } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/constants/disabled-from-blockchains';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { SearchQueryService } from '@features/swaps/shared/components/assets-selector/services/search-query-service/search-query.service';
import { filter, map } from 'rxjs/operators';
import { OnramperCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-calculation-service/onramper-calculation.service';

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

  /**
   * Contains last selected blockchain, which is not included by default in blockchains-aside list.
   */
  public lastSelectedHiddenBlockchain: AvailableBlockchain | undefined;

  constructor(
    private readonly queryParamsService: QueryParamsService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly searchQueryService: SearchQueryService
  ) {
    this.setAvailableBlockchains();
    this.blockchainsToShow = this._availableBlockchains;

    this.subscribeOnSearchQuery();
  }

  private setAvailableBlockchains(): void {
    let blockchains = blockchainsList;
    if (this.queryParamsService.enabledBlockchains) {
      blockchains = blockchains.filter(blockchain =>
        this.queryParamsService.enabledBlockchains.includes(blockchain)
      );
    }
    this._availableBlockchains = blockchains.map(blockchainName => {
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
  }

  private subscribeOnSearchQuery(): void {
    combineLatest([this.searchQueryService.query$, this.assetsSelectorService.selectorListType$])
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
    return (
      blockchain.disabledConfiguration ||
      this.isDisabledFrom(blockchain) ||
      this.isDisabledTo(blockchain)
    );
  }

  public isDisabledFrom(blockchain: AvailableBlockchain): boolean {
    return this.assetsSelectorService.formType === 'from' && blockchain.disabledFrom;
  }

  public isDisabledTo(blockchain: AvailableBlockchain): boolean {
    if (this.assetsSelectorService.formType !== 'to') {
      return false;
    }
    const fromAssetType = this.assetsSelectorService.getAssetType('from');
    return (
      fromAssetType === 'fiat' && !OnramperCalculationService.isSupportedBlockchain(blockchain.name)
    );
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

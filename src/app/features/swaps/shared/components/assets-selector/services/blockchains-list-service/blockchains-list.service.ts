import { Injectable } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { AvailableBlockchain } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import {
  blockchainsList,
  notEvmChangeNowBlockchainsList,
  RankedBlockchain,
  topRankedBlockchains
} from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { SearchQueryService } from '@features/swaps/shared/components/assets-selector/services/search-query-service/search-query.service';
import { filter, map, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { BlockchainName, limitOrderSupportedBlockchains } from 'rubic-sdk';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { isMinimalToken } from '@shared/utils/is-token';
import { IframeService } from '@core/services/iframe/iframe.service';
import { disabledFromBlockchains } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/constants/disabled-from-blockchains';
import { OnramperCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-calculation.service';

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
    private readonly searchQueryService: SearchQueryService,
    private readonly swapTypeService: SwapTypeService,
    private readonly swapFormService: SwapFormService,
    private readonly iframeService: IframeService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.setAvailableBlockchains();
    this.blockchainsToShow = this._availableBlockchains;

    this.subscribeOnSearchQuery();
  }

  private setAvailableBlockchains(): void {
    const isLimitOrder = this.swapTypeService.swapMode === SWAP_PROVIDER_TYPE.LIMIT_ORDER;
    const formattedLimitOrderSupportedBlockchains: RankedBlockchain[] =
      limitOrderSupportedBlockchains.map(blockchain => ({
        name: blockchain,
        rank: topRankedBlockchains.includes(blockchain) ? 1 : 0,
        tags: []
      }));

    let blockchains: readonly RankedBlockchain[] = isLimitOrder
      ? formattedLimitOrderSupportedBlockchains
      : blockchainsList;
    if (this.queryParamsService.enabledBlockchains) {
      blockchains = blockchains.filter(blockchain =>
        this.queryParamsService.enabledBlockchains.includes(blockchain.name)
      );
    }

    const { formType } = this.assetsSelectorService;
    const { fromAsset } = this.swapFormService.inputValue;
    const selectedBlockchain =
      isLimitOrder && formType === 'to' && isMinimalToken(fromAsset) && fromAsset.blockchain;

    this._availableBlockchains = blockchains
      .map(blockchain => {
        const disabledConfiguration = !this.platformConfigurationService.isAvailableBlockchain(
          blockchain.name
        );
        const disabledFrom = !this.iframeService.isIframe
          ? disabledFromBlockchains.includes(blockchain.name)
          : (Object.values(notEvmChangeNowBlockchainsList) as BlockchainName[]).includes(
              blockchain.name
            );
        const disabledLimitOrder = selectedBlockchain && blockchain.name !== selectedBlockchain;

        return {
          name: blockchain.name,
          rank: blockchain.rank,
          icon: blockchainIcon[blockchain.name],
          label: blockchainLabel[blockchain.name],
          tags: blockchain.tags,
          disabledConfiguration,
          disabledFrom,
          disabledLimitOrder
        };
      })
      .sort((a, b) => b.rank - a.rank);
  }

  private subscribeOnSearchQuery(): void {
    combineLatest([this.searchQueryService.query$, this.assetsSelectorService.selectorListType$])
      .pipe(
        filter(([_, selectorListType]) => selectorListType === 'blockchains'),
        map(([query]) => query),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.blockchainsToShow = this.availableBlockchains.filter(blockchain => {
          return (
            blockchain.name.toLowerCase().includes(query.toLowerCase()) ||
            (blockchain.tags.length &&
              blockchain.tags.join(' ').toLowerCase().includes(query.toLowerCase()))
          );
        });
      });
  }

  public isDisabled(blockchain: AvailableBlockchain): boolean {
    return (
      blockchain.disabledConfiguration ||
      blockchain.disabledLimitOrder ||
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
    if (blockchain.disabledLimitOrder) {
      return 'Change selected source token';
    }
    return null;
  }
}

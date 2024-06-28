import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Injector,
  Input,
  Self,
  SkipSelf
} from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { combineLatestWith, map } from 'rxjs/operators';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';
import { WindowSize } from '@core/services/widnow-width-service/models/window-size';
import { blockchainShortLabel } from '@shared/constants/blockchain/blockchain-short-label';
import { ModalService } from '@app/core/modals/services/modal.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { BlockchainsListService } from '@features/trade/components/assets-selector/services/blockchains-list-service/blockchains-list.service';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { FormsTogglerService } from '@app/features/trade/services/forms-toggler/forms-toggler.service';
import { GasFormService } from '@app/features/trade/services/gas-form/gas-form.service';
import { MAIN_FORM_TYPE } from '@app/features/trade/services/forms-toggler/models';
import { SearchQueryService } from '../../services/search-query-service/search-query.service';
import { Observable, of } from 'rxjs';
import { switchIif } from '@app/shared/utils/utils';
import { HeaderStore } from '@app/core/header/services/header.store';
import { BlockchainTags } from '../blockchains-filter-list/models/BlockchainFilters';
import { FilterQueryService } from '../../services/filter-query-service/filter-query.service';

@Component({
  selector: 'app-asset-types-aside',
  templateUrl: './asset-types-aside.component.html',
  styleUrls: ['./asset-types-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AssetsSelectorService, SearchQueryService, BlockchainsListService]
})
export class AssetTypesAsideComponent {
  @Input() idPrefix: string;

  public readonly selectedAssetType$ = this.assetsSelectorService.assetType$;

  public readonly formType = this.assetsSelectorService.formType;

  public readonly isMobile = this.headerStore.isMobile;

  public readonly blockchainTags = BlockchainTags;

  public readonly selectedFilter$ = this.filterQueryService.filterQuery$;

  public readonly blockchainsToShow$ = this.blockchainsListService.blockchainsToShow$.pipe(
    combineLatestWith(
      this.gasFormService.sourceBlockchainsToShow$,
      this.gasFormService.targetBlockchainsToShow$
    ),
    switchIif(
      () => this.formsTogglerService.isGasFormOpened(),
      () => this.gasFormBlockchainsToShow$,
      ([swapFormBlockchainsToShow]) => of(swapFormBlockchainsToShow)
    )
    // map(blockchains => [
    //   ...blockchains.slice(0, 8),
    //   ...blockchains.slice(8, blockchains.length).sort((a, b) => a.name.localeCompare(b.name))
    // ])
  );

  private get gasFormBlockchainsToShow$(): Observable<AvailableBlockchain[]> {
    return this.formType === 'to'
      ? this.gasFormService.targetBlockchainsToShow$
      : this.gasFormService.sourceBlockchainsToShow$;
  }

  /**
   * Returns amount of blockchains to show, depending on window width and height.
   */
  public readonly shownBlockchainsAmount$ = this.windowWidthService.windowSize$.pipe(
    map(windowSize => {
      if (windowSize >= WindowSize.MOBILE_MD && this.blockchainsAmount >= 11) {
        return 11;
      }
      return this.blockchainsAmount;
    })
  );

  public get blockchainsAmount(): number {
    return this.isSourceSelectorGasFormOpened()
      ? this.gasFormService.availableBlockchainsAmount
      : this.blockchainsListService.availableBlockchains.length;
  }

  public get showFiats(): boolean {
    return this.formType === 'from' && !this.queryParamsService.hideUnusedUI;
  }

  constructor(
    private readonly blockchainsListService: BlockchainsListService,
    @Self() private readonly assetsAsideSelectorService: AssetsSelectorService,
    @SkipSelf() private readonly assetsSelectorService: AssetsSelectorService,
    private readonly windowWidthService: WindowWidthService,
    private readonly swapFormService: SwapsFormService,
    private readonly queryParamsService: QueryParamsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly modalService: ModalService,
    private readonly formsTogglerService: FormsTogglerService,
    private readonly gasFormService: GasFormService,
    private readonly headerStore: HeaderStore,
    private readonly filterQueryService: FilterQueryService,
    @Inject(Injector) private readonly injector: Injector
  ) {
    this.openBlockchainsList();
  }

  private getBlockchainsListForLandingIframe(): AvailableBlockchain[] {
    const allAvailableBlockchains = this.blockchainsListService.availableBlockchains;
    const zkSyncBlockchain = this.blockchainsListService.availableBlockchains.find(
      blockchain => blockchain.name === 'ZK_SYNC'
    );

    if (this.swapFormService.inputValue.fromToken.blockchain !== 'ZK_SYNC') {
      return this.formType === 'from' ? [...allAvailableBlockchains] : [zkSyncBlockchain];
    } else {
      return this.formType === 'from' ? [zkSyncBlockchain] : [...allAvailableBlockchains];
    }
  }

  private setLastSelectedHiddenBlockchain(selectedBlockchain: BlockchainName): void {
    this.blockchainsListService.lastSelectedHiddenBlockchain =
      this.blockchainsListService.availableBlockchains.find(
        blockchain => blockchain.name === selectedBlockchain
      );
  }

  private isSelectedBlockchainIncluded(
    slicedBlockchains: AvailableBlockchain[],
    selectedBlockchain: BlockchainName
  ): AvailableBlockchain {
    return slicedBlockchains.find(blockchain => blockchain.name === selectedBlockchain);
  }

  private isSourceSelectorGasFormOpened(): boolean {
    return (
      this.formsTogglerService.selectedForm === MAIN_FORM_TYPE.GAS_FORM && this.formType === 'from'
    );
  }

  private getAssideBlockchainsInSourceSelectorGasForm(
    amountInAssideList: number
  ): AvailableBlockchain[] {
    const assideChains = this.gasFormService.sourceAvailableBlockchains.slice(
      0,
      amountInAssideList
    );
    return assideChains;
  }

  public getBlockchainsList(shownBlockchainsAmount: number): AvailableBlockchain[] {
    const userBlockchainName = this.walletConnectorService.network;
    const userBlockchain = this.blockchainsListService.availableBlockchains.find(
      chain => chain.name === userBlockchainName
    );

    let slicedBlockchains = this.blockchainsListService.availableBlockchains.slice(
      0,
      shownBlockchainsAmount
    );

    if (userBlockchain && !slicedBlockchains.includes(userBlockchain)) {
      slicedBlockchains.pop();
      slicedBlockchains.unshift(userBlockchain);
    }

    const toBlockchain = this.swapFormService.inputValue.toToken?.blockchain;
    const isSelectedToBlockchainIncluded = this.isSelectedBlockchainIncluded(
      slicedBlockchains,
      toBlockchain
    );
    const fromBlockchain = this.swapFormService.inputValue.fromBlockchain;
    const isSelectedFromBlockchainIncluded = this.isSelectedBlockchainIncluded(
      slicedBlockchains,
      fromBlockchain
    );

    if (this.queryParamsService.domain === 'rubic.exchange/zkSync_Era') {
      return this.getBlockchainsListForLandingIframe();
    }

    if (this.isSourceSelectorGasFormOpened()) {
      slicedBlockchains = this.getAssideBlockchainsInSourceSelectorGasForm(shownBlockchainsAmount);
    } else {
      if (toBlockchain && fromBlockchain) {
        if (this.formType === 'from' && !isSelectedFromBlockchainIncluded) {
          this.setLastSelectedHiddenBlockchain(fromBlockchain);
        } else if (!isSelectedToBlockchainIncluded) {
          this.setLastSelectedHiddenBlockchain(toBlockchain);
        }
      } else if (fromBlockchain && !isSelectedFromBlockchainIncluded) {
        this.setLastSelectedHiddenBlockchain(fromBlockchain);
      } else if (toBlockchain && !isSelectedToBlockchainIncluded) {
        this.setLastSelectedHiddenBlockchain(toBlockchain);
      }

      const hiddenBlockchain = this.blockchainsListService.lastSelectedHiddenBlockchain;

      if (hiddenBlockchain) {
        slicedBlockchains.pop();
        slicedBlockchains.unshift(hiddenBlockchain);
      }
    }

    return slicedBlockchains.map(blockchain => ({
      ...blockchain,
      label: blockchainShortLabel[blockchain.name]
    }));
  }

  public getBlockchainTag(blockchain: AvailableBlockchain): string {
    const tags = blockchain.tags
      .filter(tag => tag === this.blockchainTags.PROMO || tag === this.blockchainTags.NEW)
      .sort((a, b) => {
        if (a === this.blockchainTags.PROMO) return -1;
        if (b === this.blockchainTags.PROMO) return 1;
        return 0;
      });
    return tags[0];
  }

  public setBlockchainFilterAll(): void {
    this.filterQueryService.filterQuery = BlockchainTags.ALL;
  }

  public isBlockchainDisabled(blockchain: AvailableBlockchain): boolean {
    return this.blockchainsListService.isDisabled(blockchain);
  }

  public getBlockchainHintText(blockchain: AvailableBlockchain): string | null {
    return this.blockchainsListService.getHintText(blockchain);
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.assetsSelectorService.onBlockchainSelect(blockchainName);
  }

  public openBlockchainsList(): void {
    this.assetsAsideSelectorService.openBlockchainsList();
  }

  public openFiatsList(): void {
    this.assetsSelectorService.openFiatsList();
  }

  public toggleBlockchainList(): void {
    this.modalService.openMobileBlockchainList(this.injector);
  }
}

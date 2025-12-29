import { ChangeDetectionStrategy, Component, Inject, Injector, Input } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { map } from 'rxjs/operators';
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
import { SoundsService } from '@app/features/trade/services/sounds-service/sounds.service';
import { SoundEvent } from '@app/features/trade/services/sounds-service/constants/sounds-config';

@Component({
  selector: 'app-asset-types-aside',
  templateUrl: './asset-types-aside.component.html',
  styleUrls: ['./asset-types-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetTypesAsideComponent {
  @Input() idPrefix: string;

  public readonly selectedAssetType$ = this.assetsSelectorService.assetType$;

  public readonly formType = this.assetsSelectorService.formType;

  /**
   * Returns amount of blockchains to show, depending on window width and height.
   */
  public readonly shownBlockchainsAmount$ = this.windowWidthService.windowSize$.pipe(
    map(() => {
      return this.blockchainsAmount;
    })
  );

  public get blockchainsAmount(): number {
    return this.isSourceSelectorGasFormOpened()
      ? this.gasFormService.availableBlockchainsAmount
      : this.blockchainsListService.availableBlockchains.length;
  }

  public get showMoreBlockchainsText(): number {
    if (this.windowWidthService.windowSize >= WindowSize.MOBILE_MD) {
      return this.blockchainsAmount > 12 ? this.blockchainsAmount - 11 : 0;
    }
    return 0;
  }

  public get showFiats(): boolean {
    return this.formType === 'from' && !this.queryParamsService.hideUnusedUI;
  }

  constructor(
    private readonly blockchainsListService: BlockchainsListService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly windowWidthService: WindowWidthService,
    private readonly swapFormService: SwapsFormService,
    private readonly queryParamsService: QueryParamsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly modalService: ModalService,
    private readonly formsTogglerService: FormsTogglerService,
    private readonly gasFormService: GasFormService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly soundService: SoundsService
  ) {}

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

  public getBlockchainsList(chainsAmount: number): AvailableBlockchain[] {
    const shownBlockchainsAmount =
      chainsAmount > 12 && this.windowWidthService.windowSize >= WindowSize.MOBILE_MD
        ? 11
        : chainsAmount;
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

  public isBlockchainDisabled(blockchain: AvailableBlockchain): boolean {
    return this.blockchainsListService.isDisabled(blockchain);
  }

  public getBlockchainHintText(blockchain: AvailableBlockchain): string | null {
    return this.blockchainsListService.getHintText(blockchain);
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.soundService.playSound(SoundEvent.ON_CHAIN_SELECT, blockchainName);
    this.assetsSelectorService.onBlockchainSelect(blockchainName);
  }

  public openBlockchainsList(): void {
    this.assetsSelectorService.openBlockchainsList();
  }

  public openFiatsList(): void {
    this.assetsSelectorService.openFiatsList();
  }

  public toggleBlockchainList(): void {
    this.modalService.openMobileBlockchainList(this.injector);
  }
}

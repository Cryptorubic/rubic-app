import { ChangeDetectionStrategy, Component, Inject, Input, Injector } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { WINDOW } from '@ng-web-apis/common';
import { AvailableBlockchain } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { BlockchainsListService } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/blockchains-list.service';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { map } from 'rxjs/operators';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';
import { WindowSize } from '@core/services/widnow-width-service/models/window-size';
import { IframeService } from '@core/services/iframe/iframe.service';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { TUI_IS_MOBILE } from '@taiga-ui/cdk';
import { blockchainShortLabel } from '@shared/constants/blockchain/blockchain-short-label';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { ModalService } from '@app/core/modals/services/modal.service';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';

@Component({
  selector: 'app-asset-types-aside',
  templateUrl: './asset-types-aside.component.html',
  styleUrls: ['./asset-types-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetTypesAsideComponent {
  @Input() idPrefix: string;

  public readonly blockchainsAmount = this.blockchainsListService.availableBlockchains.length;

  public readonly selectedAssetType$ = this.assetsSelectorService.assetType$;

  public readonly formType = this.assetsSelectorService.formType;

  /**
   * Returns amount of blockchains to show, depending on window width and height.
   */
  public readonly shownBlockchainsAmount$ = this.windowWidthService.windowSize$.pipe(
    map(windowSize => {
      if (this.iframeService.isIframe) {
        return this.blockchainsAmount;
      }

      if (windowSize >= WindowSize.MOBILE_MD) {
        return 9;
      }

      if (windowSize === WindowSize.MOBILE_MD_MINUS) {
        return this.blockchainsAmount;
      }
      return this.blockchainsAmount;
    })
  );

  constructor(
    private readonly blockchainsListService: BlockchainsListService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly windowWidthService: WindowWidthService,
    private readonly iframeService: IframeService,
    private readonly swapTypeService: SwapTypeService,
    private readonly swapFormService: SwapFormService,
    private readonly queryParamsService: QueryParamsService,
    @Inject(WINDOW) private readonly window: Window,
    @Inject(TUI_IS_MOBILE) private readonly isMobile: boolean,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly mobileNativeService: MobileNativeModalService
  ) {}

  private getBlockchainsListForLandingIframe(): AvailableBlockchain[] {
    if ('blockchain' in this.swapFormService.inputValue.fromAsset) {
      const allAvailableBlockchains = this.blockchainsListService.availableBlockchains;
      const zkSyncBlockchain = this.blockchainsListService.availableBlockchains.find(
        blockchain => blockchain.name === 'ZK_SYNC'
      );

      if (this.swapFormService.inputValue.fromAsset.blockchain !== 'ZK_SYNC') {
        return this.formType === 'from' ? [...allAvailableBlockchains] : [zkSyncBlockchain];
      } else {
        return this.formType === 'from' ? [zkSyncBlockchain] : [...allAvailableBlockchains];
      }
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

  public getBlockchainsList(shownBlockchainsAmount: number): AvailableBlockchain[] {
    let slicedBlockchains = this.blockchainsListService.availableBlockchains.slice(
      0,
      shownBlockchainsAmount
    );
    const toBlockchain = this.swapFormService.inputValue.toToken?.blockchain;
    const isSelectedToBlockchainIncluded = this.isSelectedBlockchainIncluded(
      slicedBlockchains,
      toBlockchain
    );
    const fromBlockchain =
      this.swapFormService.inputValue.fromAsset &&
      'blockchain' in this.swapFormService.inputValue.fromAsset
        ? this.swapFormService.inputValue.fromAsset.blockchain
        : null;
    const isSelectedFromBlockchainIncluded = this.isSelectedBlockchainIncluded(
      slicedBlockchains,
      fromBlockchain
    );

    if (this.queryParamsService.domain === 'rubic.exchange/zkSync_Era') {
      return this.getBlockchainsListForLandingIframe();
    }

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
      slicedBlockchains[slicedBlockchains.length - 1] = hiddenBlockchain;
    }

    if (this.iframeService.isIframe) {
      slicedBlockchains = [
        ...slicedBlockchains.filter(blockchain => !this.isBlockchainDisabled(blockchain)),
        ...slicedBlockchains.filter(blockchain => this.isBlockchainDisabled(blockchain))
      ];
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
    this.assetsSelectorService.onBlockchainSelect(blockchainName);
  }

  public openBlockchainsList(): void {
    this.assetsSelectorService.openBlockchainsList();
  }

  public openFiatsList(): void {
    this.assetsSelectorService.openFiatsList();
  }

  public toggleBlockchainList(): void {
    this.modalService.openBlockchainList(this.injector);
  }
}

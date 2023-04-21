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
import { FiatsListService } from '@features/swaps/shared/components/assets-selector/services/fiats-list-service/fiats-list.service';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
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

      const showFiats = this.showFiats ? 1 : 0;

      if (windowSize >= WindowSize.MOBILE_MD) {
        return 9 - showFiats;
      }

      if (windowSize === WindowSize.MOBILE_MD_MINUS) {
        return this.blockchainsAmount;
      }
      return this.blockchainsAmount;
    })
  );

  public readonly fiatsDisabled = this.fiatsListService.isDisabled();

  public get showFiats(): boolean {
    return (
      this.formType === 'from' && this.swapTypeService.swapMode !== SWAP_PROVIDER_TYPE.LIMIT_ORDER
    );
  }

  constructor(
    private readonly blockchainsListService: BlockchainsListService,
    private readonly fiatsListService: FiatsListService,
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

  public getBlockchainsListForLandingIframe(): AvailableBlockchain[] {
    const returnZkSyncBlockchain = () => {
      return this.blockchainsListService.availableBlockchains.find(
        blockchain => blockchain.name === 'ZK_SYNC'
      );
    };

    const returnAllAvailableBlockchains = () => {
      return this.blockchainsListService.availableBlockchains;
    };

    const returnBlockchainsBasedOnFormType = (revert: boolean) => {
      if (revert) {
        return this.formType === 'from'
          ? [...returnAllAvailableBlockchains()]
          : [returnZkSyncBlockchain()];
      } else {
        return this.formType === 'from'
          ? [returnZkSyncBlockchain()]
          : [...returnAllAvailableBlockchains()];
      }
    };

    if ('blockchain' in this.swapFormService.inputValue.fromAsset) {
      return returnBlockchainsBasedOnFormType(
        this.swapFormService.inputValue.fromAsset.blockchain !== 'ZK_SYNC'
      );
    }
  }

  public getBlockchainsList(shownBlockchainsAmount: number): AvailableBlockchain[] {
    const slicedBlockchains = this.blockchainsListService.availableBlockchains.slice(
      0,
      shownBlockchainsAmount
    );

    if (this.queryParamsService.domain === 'rubic.exchange/zkSync_Era') {
      return this.getBlockchainsListForLandingIframe();
    }

    const isSelectedBlockchainIncluded = slicedBlockchains.find(
      blockchain => blockchain.name === this.assetsSelectorService.assetType
    );
    if (!isSelectedBlockchainIncluded) {
      this.blockchainsListService.lastSelectedHiddenBlockchain =
        this.blockchainsListService.availableBlockchains.find(
          blockchain => blockchain.name === this.assetsSelectorService.assetType
        );
    }

    const hiddenBlockchain = this.blockchainsListService.lastSelectedHiddenBlockchain;
    if (hiddenBlockchain) {
      slicedBlockchains[slicedBlockchains.length - 1] = hiddenBlockchain;
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

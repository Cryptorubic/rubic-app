import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
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

      const isFrom = this.formType === 'from' ? 1 : 0;

      if (windowSize >= WindowSize.MOBILE_MD) {
        return 9 - isFrom;
      }

      const asideHeight = this.window.innerHeight - 135;
      if (windowSize === WindowSize.MOBILE_MD_MINUS) {
        return Math.floor(asideHeight / 82) - 1 - isFrom;
      }
      return Math.floor(asideHeight / 66) - 1 - isFrom;
    })
  );

  public readonly fiatsDisabled = this.fiatsListService.isDisabled();

  constructor(
    private readonly blockchainsListService: BlockchainsListService,
    private readonly fiatsListService: FiatsListService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly windowWidthService: WindowWidthService,
    private readonly iframeService: IframeService,
    @Inject(WINDOW) private readonly window: Window
  ) {}

  public getBlockchainsList(shownBlockchainsAmount: number): AvailableBlockchain[] {
    const slicedBlockchains = this.blockchainsListService.availableBlockchains.slice(
      0,
      shownBlockchainsAmount
    );

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

    return slicedBlockchains;
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
}

import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { WINDOW } from '@ng-web-apis/common';
import { AvailableBlockchain } from '@features/swaps/shared/components/tokens-selector/services/blockchains-list-service/models/available-blockchain';
import { BlockchainsListService } from '@features/swaps/shared/components/tokens-selector/services/blockchains-list-service/blockchains-list.service';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-selector/services/tokens-selector-service/tokens-selector.service';
import { map } from 'rxjs/operators';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';
import { WindowSize } from '@core/services/widnow-width-service/models/window-size';
import { IframeService } from '@core/services/iframe/iframe.service';

@Component({
  selector: 'app-blockchains-aside',
  templateUrl: './blockchains-aside.component.html',
  styleUrls: ['./blockchains-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsAsideComponent {
  @Input() idPrefix: string;

  public readonly blockchainsAmount = this.blockchainsListService.availableBlockchains.length;

  public readonly selectedBlockchain$ = this.tokensSelectorService.blockchain$;

  public readonly selectorListType$ = this.tokensSelectorService.selectorListType$;

  /**
   * Returns amount of blockchains to show, depending on window width and height.
   */
  public readonly shownBlockchainsAmount$ = this.windowWidthService.windowSize$.pipe(
    map(windowSize => {
      if (this.iframeService.isIframe) {
        return this.blockchainsAmount;
      }

      if (windowSize === WindowSize.DESKTOP) {
        return 9;
      }

      const asideHeight = this.window.innerHeight - 135;
      if (windowSize === WindowSize.MOBILE_MD_MINUS) {
        return Math.floor(asideHeight / 82) - 1;
      }
      return Math.floor(asideHeight / 66) - 1;
    })
  );

  constructor(
    private readonly blockchainsListService: BlockchainsListService,
    private readonly tokensSelectorService: TokensSelectorService,
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
      blockchain => blockchain.name === this.tokensSelectorService.blockchain
    );
    if (!isSelectedBlockchainIncluded) {
      this.blockchainsListService.lastSelectedHiddenBlockchain =
        this.blockchainsListService.availableBlockchains.find(
          blockchain => blockchain.name === this.tokensSelectorService.blockchain
        );
    }

    const hiddenBlockchain = this.blockchainsListService.lastSelectedHiddenBlockchain;
    if (hiddenBlockchain) {
      slicedBlockchains[slicedBlockchains.length - 1] = hiddenBlockchain;
    }

    return slicedBlockchains;
  }

  public isDisabled(blockchain: AvailableBlockchain): boolean {
    return this.blockchainsListService.isDisabled(blockchain);
  }

  public getHintText(blockchain: AvailableBlockchain): string | null {
    return this.blockchainsListService.getHintText(blockchain);
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.tokensSelectorService.blockchain = blockchainName;
  }

  public onSelectorSwitch(): void {
    this.tokensSelectorService.switchSelectorType();
  }
}

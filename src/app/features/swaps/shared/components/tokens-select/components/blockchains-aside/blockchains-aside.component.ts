import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { TUI_IS_IOS, TUI_IS_MOBILE } from '@taiga-ui/cdk';
import { USER_AGENT, WINDOW } from '@ng-web-apis/common';
import { AvailableBlockchain } from '@features/swaps/shared/components/tokens-select/services/blockchains-list-service/models/available-blockchain';
import { BlockchainsListService } from '@features/swaps/shared/components/tokens-select/services/blockchains-list-service/blockchains-list.service';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/tokens-selector.service';
import { map } from 'rxjs/operators';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';

@Component({
  selector: 'app-blockchains-aside',
  templateUrl: './blockchains-aside.component.html',
  styleUrls: ['./blockchains-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsAsideComponent {
  @Input() idPrefix: string;

  public readonly blockchainsList = this.blockchainsListService.availableBlockchains;

  public readonly selectedBlockchain$ = this.tokensSelectorService.blockchain$;

  public readonly selectorListType$ = this.tokensSelectorService.selectorListType$;

  public readonly shownBlockchainsAmount$ = this.windowWidthService.mobileMdMinus$.pipe(
    map(isMobile => {
      if (!isMobile) {
        return 11;
      }

      const asideHeight = this.window.innerHeight - 135;
      return Math.floor(asideHeight / 70) - 1;
    })
  );

  public get showClearFix(): boolean {
    const safariDetector: RegExp = /iPhone/i;
    const chromeDetector: RegExp = /Chrome/i;
    return (
      this.isIos &&
      this.isMobile &&
      (safariDetector.test(this.userAgent) || chromeDetector.test(this.userAgent))
    );
  }

  constructor(
    @Inject(TUI_IS_IOS) private readonly isIos: boolean,
    @Inject(TUI_IS_MOBILE) private readonly isMobile: boolean,
    @Inject(USER_AGENT) private readonly userAgent: string,
    private readonly blockchainsListService: BlockchainsListService,
    private readonly tokensSelectorService: TokensSelectorService,
    private readonly windowWidthService: WindowWidthService,
    @Inject(WINDOW) private readonly window: Window
  ) {}

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

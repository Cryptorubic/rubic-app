import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output
} from '@angular/core';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { BlockchainName } from 'rubic-sdk';
import { TUI_IS_IOS, TUI_IS_MOBILE } from '@taiga-ui/cdk';
import { USER_AGENT } from '@ng-web-apis/common';
import { allBlockchains } from '@features/swaps/shared/tokens-select/constants/all-blockchains';

@Component({
  selector: 'app-blockchains-aside',
  templateUrl: './blockchains-aside.component.html',
  styleUrls: ['./blockchains-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsAsideComponent {
  @Input() blockchain: BlockchainName;

  @Input() allowedBlockchains: BlockchainName[] | undefined;

  @Input() idPrefix: string;

  @Output() blockchainChange = new EventEmitter<BlockchainName>();

  public static readonly allBlockchains: BlockchainName[] = allBlockchains;

  public blockchainImages = Object.fromEntries(
    this.blockchains.map(blockchainName => [
      blockchainName,
      BlockchainsInfo.getBlockchainByName(blockchainName).imagePath
    ])
  );

  public blockchainLabels = Object.fromEntries(
    this.blockchains.map(blockchainName => [
      blockchainName,
      BlockchainsInfo.getBlockchainByName(blockchainName).label
    ])
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

  get blockchains(): BlockchainName[] {
    if (this.allowedBlockchains) {
      return BlockchainsAsideComponent.allBlockchains.filter(el =>
        this.allowedBlockchains.includes(el)
      );
    }
    return BlockchainsAsideComponent.allBlockchains;
  }

  constructor(
    @Inject(TUI_IS_IOS) private readonly isIos: boolean,
    @Inject(TUI_IS_MOBILE) private readonly isMobile: boolean,
    @Inject(USER_AGENT) private readonly userAgent: string
  ) {}

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.blockchain = blockchainName;
    this.blockchainChange.emit(blockchainName);
  }
}

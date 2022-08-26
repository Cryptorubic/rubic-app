import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output
} from '@angular/core';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';
import { TUI_IS_IOS, TUI_IS_MOBILE } from '@taiga-ui/cdk';
import { USER_AGENT } from '@ng-web-apis/common';

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

  public static readonly allBlockchains: BlockchainName[] = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.GNOSIS,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.AURORA,
    BLOCKCHAIN_NAME.MOONBEAM,
    BLOCKCHAIN_NAME.FUSE,
    BLOCKCHAIN_NAME.MOONRIVER,
    BLOCKCHAIN_NAME.TELOS,
    BLOCKCHAIN_NAME.CELO,
    BLOCKCHAIN_NAME.OKE_X_CHAIN,
    BLOCKCHAIN_NAME.CRONOS,
    BLOCKCHAIN_NAME.HARMONY,
    BLOCKCHAIN_NAME.BOBA,
    BLOCKCHAIN_NAME.BITCOIN

    // @TODO return after Near & Solana fix
    // BLOCKCHAIN_NAME.NEAR,
    // BLOCKCHAIN_NAME.SOLANA

    // @TODO add after lifi update
    // BLOCKCHAIN_NAME.CRONOS
  ];

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

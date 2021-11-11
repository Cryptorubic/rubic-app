import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';

@Component({
  selector: 'app-blockchains-aside',
  templateUrl: './blockchains-aside.component.html',
  styleUrls: ['./blockchains-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsAsideComponent {
  @Input() blockchain: BLOCKCHAIN_NAME;

  @Input() allowedBlockchains: BLOCKCHAIN_NAME[] | undefined;

  @Input() idPrefix: string;

  @Output() blockchainChange = new EventEmitter<BLOCKCHAIN_NAME>();

  private readonly allBlockchains: BLOCKCHAIN_NAME[] = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.MOONRIVER,
    BLOCKCHAIN_NAME.HARMONY,
    BLOCKCHAIN_NAME.TRON,
    BLOCKCHAIN_NAME.XDAI
  ];

  public blockchainImages = Object.fromEntries(
    this.blockchains.map(blockchainName => [
      blockchainName,
      BlockchainsInfo.getBlockchainByName(blockchainName).imagePath
    ])
  );

  get blockchains(): BLOCKCHAIN_NAME[] {
    if (this.allowedBlockchains) {
      return this.allBlockchains.filter(el => this.allowedBlockchains.includes(el));
    }
    return this.allBlockchains;
  }

  constructor() {}

  onBlockchainSelect(blockchainName: BLOCKCHAIN_NAME): void {
    this.blockchain = blockchainName;
    this.blockchainChange.emit(blockchainName);
  }
}

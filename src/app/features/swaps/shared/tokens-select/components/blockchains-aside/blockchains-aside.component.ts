import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';

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

  private readonly allBlockchains: BlockchainName[] = [
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
    BLOCKCHAIN_NAME.ASTAR

    // @TODO return after Near & Solana fix
    // BLOCKCHAIN_NAME.NEAR,
    // BLOCKCHAIN_NAME.SOLANA
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

  get blockchains(): BlockchainName[] {
    if (this.allowedBlockchains) {
      return this.allBlockchains.filter(el => this.allowedBlockchains.includes(el));
    }
    return this.allBlockchains;
  }

  constructor() {}

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.blockchain = blockchainName;
    this.blockchainChange.emit(blockchainName);
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { BLOCKCHAIN_LABEL } from '@features/swaps/shared/tokens-select/constants/blockchains-labels';
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
    BLOCKCHAIN_NAME.NEAR,
    BLOCKCHAIN_NAME.AURORA,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.MOONRIVER,
    BLOCKCHAIN_NAME.HARMONY,
    BLOCKCHAIN_NAME.SOLANA,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.TELOS
  ];

  public blockchainImages = Object.fromEntries(
    this.blockchains.map(blockchainName => [
      blockchainName,
      BlockchainsInfo.getBlockchainByName(blockchainName).imagePath
    ])
  );

  get blockchains(): BlockchainName[] {
    if (this.allowedBlockchains) {
      return this.allBlockchains.filter(el => this.allowedBlockchains.includes(el));
    }
    return this.allBlockchains;
  }

  constructor() {}

  public getBlockchainLabel(blockchainName: BlockchainName): string {
    return BLOCKCHAIN_LABEL[blockchainName];
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.blockchain = blockchainName;
    this.blockchainChange.emit(blockchainName);
  }
}

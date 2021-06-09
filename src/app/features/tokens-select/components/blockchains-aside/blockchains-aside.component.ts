import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { BlockchainsInfo } from '../../../../core/services/blockchain/blockchain-info';

@Component({
  selector: 'app-blockchains-aside',
  templateUrl: './blockchains-aside.component.html',
  styleUrls: ['./blockchains-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsAsideComponent {
  public blockchains: BLOCKCHAIN_NAME[] = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.TRON,
    BLOCKCHAIN_NAME.XDAI
  ];

  public blockchainImages = Object.fromEntries(
    this.blockchains.map(blockchainName => [
      blockchainName,
      BlockchainsInfo.getBlockchainByName(blockchainName).imagePath
    ])
  );

  constructor() {}
}

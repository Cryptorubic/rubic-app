import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Blockchain, BLOCKCHAINS } from '@app/shared/constants/blockchain/ui-blockchains';
import { BlockchainName } from '@cryptorubic/core';

@Component({
  selector: 'app-switch-network-page',
  templateUrl: './switch-network-page.component.html',
  styleUrls: ['./switch-network-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchNetworkPageComponent {
  @Input({ required: true }) supportedChains: BlockchainName[];

  @Input({ required: true }) set activeChain(chain: BlockchainName) {
    this.chainControl.setValue(chain);
  }

  @Output() onSwitchChain = new EventEmitter<BlockchainName>();

  public readonly chainControl = new FormControl();

  public getChainInfo(chain: BlockchainName): Blockchain {
    return BLOCKCHAINS[chain];
  }

  public handleSwitchChain(chain: BlockchainName): void {
    this.onSwitchChain.emit(chain);
  }
}

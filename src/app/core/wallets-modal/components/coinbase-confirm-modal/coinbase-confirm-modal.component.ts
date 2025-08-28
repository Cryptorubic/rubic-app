import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { BlockchainName, BLOCKCHAIN_NAME } from '@cryptorubic/sdk';
import { TuiDialogContext } from '@taiga-ui/core';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';

@Component({
  selector: 'polymorpheus-coinbase-confirm-modal',
  templateUrl: './coinbase-confirm-modal.component.html',
  styleUrls: ['./coinbase-confirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoinbaseConfirmModalComponent {
  public readonly availableBlockchains: BlockchainName[] = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
  ];

  public selectedBlockchain = this.availableBlockchains[0];

  public readonly blockchainIcon = blockchainIcon;

  public readonly blockchainLabel = blockchainLabel;

  constructor(@Inject(POLYMORPHEUS_CONTEXT) private context: TuiDialogContext<BlockchainName>) {}

  onConfirm(): void {
    this.context.completeWith(this.selectedBlockchain);
  }

  onDecline(): void {
    this.context.completeWith(undefined);
  }
}

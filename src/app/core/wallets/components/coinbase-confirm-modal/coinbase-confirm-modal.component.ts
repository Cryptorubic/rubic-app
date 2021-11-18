import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TuiDialogContext } from '@taiga-ui/core';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';

@Component({
  selector: 'app-coinbase-confirm-modal',
  templateUrl: './coinbase-confirm-modal.component.html',
  styleUrls: ['./coinbase-confirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoinbaseConfirmModalComponent {
  public availableBlockchains: IBlockchain[] = [
    BlockchainsInfo.getBlockchainByName(BLOCKCHAIN_NAME.ETHEREUM),
    BlockchainsInfo.getBlockchainByName(BLOCKCHAIN_NAME.POLYGON),
    BlockchainsInfo.getBlockchainByName(BLOCKCHAIN_NAME.FANTOM)
  ];

  public selectedBlockchain = this.availableBlockchains[0];

  constructor(@Inject(POLYMORPHEUS_CONTEXT) private context: TuiDialogContext<BLOCKCHAIN_NAME>) {}

  onConfirm(): void {
    this.context.completeWith(this.selectedBlockchain.name);
  }

  onDecline(): void {
    this.context.completeWith(undefined);
  }
}

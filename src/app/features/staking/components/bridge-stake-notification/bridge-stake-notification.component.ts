import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import ADDRESS_TYPE from '@app/shared/models/blockchain/address-type';
import { BlockchainName } from 'rubic-sdk';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-bridge-stake-notification',
  templateUrl: './bridge-stake-notification.component.html',
  styleUrls: ['./bridge-stake-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BridgeStakeNotificationComponent {
  public txHash: string;

  public blockchain: BlockchainName;

  public addressType = ADDRESS_TYPE;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      void,
      { txHash: string; fromBlockchain: BlockchainName }
    >
  ) {
    this.txHash = this.context.data.txHash;
    this.blockchain = this.context.data.fromBlockchain;
  }
}

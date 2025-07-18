import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { BlockchainName } from '@cryptorubic/core';

@Component({
  selector: 'app-transaction-failed-error',
  templateUrl: './transaction-failed-error.component.html',
  styleUrls: ['./transaction-failed-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionFailedErrorComponent {
  public readonly txHash: string;

  public readonly blockchainName: BlockchainName;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      void,
      { blockchainName: BlockchainName; txHash?: string }
    >
  ) {
    this.blockchainName = context.data.blockchainName;
    this.txHash = context.data.txHash;
  }
}

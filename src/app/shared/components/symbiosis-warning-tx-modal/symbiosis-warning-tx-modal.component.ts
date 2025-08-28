import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { BlockchainName } from '@cryptorubic/sdk';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';

@Component({
  selector: 'polymorpheus-symbiosis-warning-tx-modal',
  templateUrl: './symbiosis-warning-tx-modal.component.html',
  styleUrls: ['./symbiosis-warning-tx-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymbiosisWarningTxModalComponent {
  public readonly amount: string;

  public readonly tokenSymbol: string;

  public readonly tokenAddress: string;

  public readonly blockchain: BlockchainName;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      {
        amount: string;
        tokenSymbol: string;
        tokenAddress: string;
        blockchain: BlockchainName;
      }
    >
  ) {
    this.amount = context.data.amount;
    this.tokenSymbol = context.data.tokenSymbol;
    this.tokenAddress = context.data.tokenAddress;
    this.blockchain = context.data.blockchain;
  }

  public onConfirm(): void {
    this.context.completeWith(null);
  }
}

import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { BlockchainName } from 'rubic-sdk';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';

interface ModalContext {
  amount: string;
  tokenSymbol: string;
  tokenAddress: string;
  blockchain: BlockchainName;
}

@Component({
  selector: 'polymorpheus-symbiosis-warning-tx-modal',
  templateUrl: './symbiosis-warning-tx-modal.component.html',
  styleUrls: ['./symbiosis-warning-tx-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SymbiosisWarningTxModalComponent {
  public readonly amount = this.context.data.amount;

  public readonly tokenSymbol = this.context.data.tokenSymbol;

  public readonly tokenAddress = this.context.data.tokenAddress;

  public readonly blockchain = this.context.data.blockchain;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, ModalContext>
  ) {}

  public onConfirm(): void {
    this.context.completeWith(null);
  }
}

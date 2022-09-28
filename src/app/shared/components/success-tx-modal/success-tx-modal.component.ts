import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDestroyService } from '@taiga-ui/cdk';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { SuccessTxModalType } from 'src/app/shared/components/success-trx-notification/models/modal-type';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType
} from 'rubic-sdk';
import { timer } from 'rxjs';
import { MODAL_CONFIG } from '@shared/constants/modals/modal-config';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'polymorpheus-success-tx-modal',
  templateUrl: './success-tx-modal.component.html',
  styleUrls: ['./success-tx-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SuccessTxModalComponent {
  public idPrefix: string;

  public type: SuccessTxModalType;

  public ccrProviderType: CrossChainTradeType;

  public txHash: string;

  public blockchain: BlockchainName;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public readonly CROSS_CHAIN_PROVIDER = CROSS_CHAIN_TRADE_TYPE;

  public readonly BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  constructor(
    private readonly destroy$: TuiDestroyService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      {
        idPrefix: string;
        type: SuccessTxModalType;
        txHash: string;
        blockchain: BlockchainName;
        ccrProviderType: CrossChainTradeType;
      }
    >
  ) {
    this.idPrefix = context.data.idPrefix;
    this.type = context.data.type;
    this.txHash = context.data.txHash;
    this.blockchain = context.data.blockchain;
    this.ccrProviderType = context.data.ccrProviderType;

    timer(MODAL_CONFIG.modalLifetime)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onConfirm());
  }

  public onConfirm(): void {
    this.context.completeWith(null);
  }
}

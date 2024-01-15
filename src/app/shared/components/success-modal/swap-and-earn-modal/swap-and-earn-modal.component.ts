import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType
} from 'rubic-sdk';
import { SuccessTxModalType } from '@app/shared/models/modals/modal-type';

@Component({
  selector: 'polymorpheus-swap-and-earn-modal',
  templateUrl: './swap-and-earn-modal.component.html',
  styleUrls: ['./swap-and-earn-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapAndEarnModalComponent {
  public readonly idPrefix: string;

  public readonly type: SuccessTxModalType;

  public readonly ccrProviderType: CrossChainTradeType;

  public readonly txHash: string;

  public readonly blockchain: BlockchainName;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public readonly CROSS_CHAIN_PROVIDER = CROSS_CHAIN_TRADE_TYPE;

  public readonly BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  constructor(
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
  }

  public onConfirm(): void {
    this.context.completeWith(null);
  }
}

import { Inject, Injectable, Injector, INJECTOR } from '@angular/core';
import { SuccessTxModalType } from '@shared/components/success-trx-notification/models/modal-type';
import { Observable, Subscription } from 'rxjs';
import { BlockchainName, CrossChainTradeType } from 'rubic-sdk';
import { SuccessOrderModalComponent } from '@shared/components/success-modal/success-order-modal/success-order-modal.component';
import { ModalService } from '@app/core/modals/services/modal.service';
import { SuccessTxModalComponent } from '@shared/components/success-modal/success-tx-modal/success-tx-modal.component';

@Injectable()
export class SuccessTxModalService {
  constructor(
    @Inject(INJECTOR) private readonly injector: Injector,
    private readonly dialogService: ModalService
  ) {}

  /**
   * Opens success transaction modal.
   * @param transactionHash Transaction's hash.
   * @param blockchain Name of blockchain.
   * @param type Type of modal, cross-chain or default.
   * @param ccrProviderType Cross Chain provider.
   * @param callback Callback to be called after modal is closed.
   * @param isSwapAndEarnSwap Whether the transaction falls under the loyalty program rules
   */
  public open(
    transactionHash: string,
    blockchain: BlockchainName,
    type: SuccessTxModalType,
    ccrProviderType: CrossChainTradeType,
    callback: () => Observable<void>,
    isSwapAndEarnSwap: boolean = false
  ): Subscription {
    this.dialogService
      .showDialog(
        SuccessTxModalComponent,
        {
          size: 's',
          data: {
            idPrefix: '',
            type,
            txHash: transactionHash,
            blockchain,
            ccrProviderType,
            isSwapAndEarnSwap
          },
          fitContent: true
        },
        this.injector
      )
      .subscribe();
    return callback().subscribe();
  }

  public openLimitOrderModal(): Subscription {
    return this.dialogService
      .showDialog(
        SuccessOrderModalComponent,
        {
          size: 's',
          fitContent: true
        },
        this.injector
      )
      .subscribe();
  }
}

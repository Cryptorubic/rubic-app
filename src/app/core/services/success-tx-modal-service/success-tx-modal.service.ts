import { Inject, Injectable, Injector, INJECTOR } from '@angular/core';
import { IframeService } from '@core/services/iframe/iframe.service';
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
    private readonly dialogService: ModalService,
    private readonly iframeService: IframeService
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
    const size = this.iframeService.isIframe ? 'fullscreen' : 's';
    this.dialogService
      .showDialog(
        SuccessTxModalComponent,
        {
          size,
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
    const size = this.iframeService.isIframe ? 'fullscreen' : 's';
    return this.dialogService
      .showDialog(
        SuccessOrderModalComponent,
        {
          size,
          fitContent: true
        },
        this.injector
      )
      .subscribe();
  }
}

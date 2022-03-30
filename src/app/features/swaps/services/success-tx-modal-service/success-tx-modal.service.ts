import { Inject, Injectable, Injector, INJECTOR } from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SuccessTxModalComponent } from 'src/app/shared/components/success-tx-modal/success-tx-modal.component';
import { TuiDialogService } from '@taiga-ui/core';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { SuccessTxModalType } from 'src/app/shared/components/success-trx-notification/models/modal-type';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

@Injectable()
export class SuccessTxModalService {
  constructor(
    @Inject(INJECTOR) private readonly injector: Injector,
    private readonly dialogService: TuiDialogService,
    private readonly iframeService: IframeService
  ) {}

  /**
   * Opens success transaction modal.
   * @param transactionHash Transaction's hash.
   * @param blockchain Name of blockchain.
   * @param type Type of modal, cross-chain or default.
   * @param callback Callback to be called after modal is closed.
   */
  public open(
    transactionHash?: string,
    blockchain?: BlockchainName,
    type: SuccessTxModalType = 'default',
    callback?: () => void
  ): void {
    const size = this.iframeService.isIframe ? 'fullscreen' : 's';
    this.dialogService
      .open(new PolymorpheusComponent(SuccessTxModalComponent, this.injector), {
        size,
        data: { idPrefix: '', type, txHash: transactionHash, blockchain }
      })
      .subscribe(() => {
        callback?.();
      });
  }
}

import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { timer } from 'rxjs';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { MODAL_CONFIG } from 'src/app/shared/constants/modals/modal-config';
import { takeUntil } from 'rxjs/operators';
import { SuccessTxModalType } from 'src/app/shared/components/success-trx-notification/models/modal-type';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { ScannerLinkPipe } from '@shared/pipes/scanner-link.pipe';

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

  public readonly hash: string;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public toScannerAddress: string;

  public toBlockchain: BLOCKCHAIN_NAME;

  private readonly scannerLinkPipe: ScannerLinkPipe;

  constructor(
    private readonly destroy$: TuiDestroyService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      { idPrefix: string; type: SuccessTxModalType; hash: string }
    >
  ) {
    this.idPrefix = context.data.idPrefix;
    this.type = context.data.type;
    this.hash = context.data.hash;
    timer(MODAL_CONFIG.modalLifetime)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onConfirm());
  }

  public onConfirm(): void {
    this.context.completeWith(null);
  }
}

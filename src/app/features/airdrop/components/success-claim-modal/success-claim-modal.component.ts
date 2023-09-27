import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { newRubicToken } from '@features/airdrop/constants/airdrop/airdrop-token';

@Component({
  selector: 'app-success-claim-modal',
  templateUrl: './success-claim-modal.component.html',
  styleUrls: ['./success-claim-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessClaimModalComponent {
  public readonly hash = this.context.data.hash;

  public readonly blockchain = newRubicToken.blockchain;

  public readonly addressType = ADDRESS_TYPE.TRANSACTION;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, { hash: string }>
  ) {}

  public handleConfirm(): void {
    this.context.completeWith(true);
  }
}

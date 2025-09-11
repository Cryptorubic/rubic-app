import { ChangeDetectionStrategy, Component, Inject, Self } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { takeUntil, timer } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { BlockchainName } from '@cryptorubic/sdk';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';

@Component({
  selector: 'polymorpheus-wc-change-network-modal',
  templateUrl: './wc-change-network-modal.component.html',
  styleUrls: ['./wc-change-network-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class WcChangeNetworkModalComponent {
  public readonly oldNetwork: string;

  public readonly newNetwork: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      { oldNetwork: BlockchainName; newNetwork: BlockchainName }
    >,
    @Self() private readonly destroyed$: TuiDestroyService
  ) {
    this.oldNetwork = blockchainLabel[context.data.oldNetwork];
    this.newNetwork = blockchainLabel[context.data.newNetwork];
    timer(60_000)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.onCancel());
  }

  public onConfirm(): void {
    this.context.completeWith(true);
  }

  public onCancel(): void {
    this.context.completeWith(false);
  }
}

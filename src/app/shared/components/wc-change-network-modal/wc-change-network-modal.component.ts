import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { timer } from 'rxjs';
import { BlockchainName } from '@cryptorubic/core';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';

@Component({
  selector: 'polymorpheus-wc-change-network-modal',
  templateUrl: './wc-change-network-modal.component.html',
  styleUrls: ['./wc-change-network-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
  standalone: false
})
export class WcChangeNetworkModalComponent {
  public readonly oldNetwork: string;

  public readonly newNetwork: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      { oldNetwork: BlockchainName; newNetwork: BlockchainName }
    >
  ) {
    this.oldNetwork = blockchainLabel[context.data.oldNetwork];
    this.newNetwork = blockchainLabel[context.data.newNetwork];
    timer(60_000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.onCancel());
  }

  public onConfirm(): void {
    this.context.completeWith(true);
  }

  public onCancel(): void {
    this.context.completeWith(false);
  }
}

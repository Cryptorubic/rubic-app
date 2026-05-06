import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import BigNumber from 'bignumber.js';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { timer } from 'rxjs';

@Component({
  selector: 'app-rate-changed-modal',
  templateUrl: './rate-changed-modal.component.html',
  styleUrls: ['./rate-changed-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
  standalone: false
})
export class RateChangedModalComponent {
  public readonly oldAmount: BigNumber;

  public readonly newAmount: BigNumber;

  public readonly difference: BigNumber;

  public readonly tokenSymbol: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      { oldAmount: BigNumber; newAmount: BigNumber; tokenSymbol: string }
    >
  ) {
    this.oldAmount = context.data.oldAmount;
    this.newAmount = context.data.newAmount;
    this.difference = this.oldAmount
      .minus(this.newAmount)
      .dividedBy(this.oldAmount)
      .multipliedBy(-100);
    this.tokenSymbol = context.data.tokenSymbol;

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

  protected readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;
}

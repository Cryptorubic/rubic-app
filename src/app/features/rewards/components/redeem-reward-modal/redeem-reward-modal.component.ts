import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TuiButton, TuiDialogContext } from '@taiga-ui/core';
import { TuiCheckbox } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';

export interface RedeemRewardDialogData {
  title: string;
  price: number;
}

@Component({
  selector: 'app-redeem-reward-modal',
  imports: [ReactiveFormsModule, TuiButton, TuiCheckbox],
  templateUrl: './redeem-reward-modal.component.html',
  styleUrl: './redeem-reward-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedeemRewardModalComponent {
  private readonly context =
    inject<TuiDialogContext<void, RedeemRewardDialogData>>(POLYMORPHEUS_CONTEXT);

  protected readonly title = this.context.data.title;
  protected readonly price = this.context.data.price;
  protected readonly accepted = new FormControl(false, { nonNullable: true });
  protected readonly canRedeem = toSignal(this.accepted.valueChanges, { initialValue: false });

  protected redeem(): void {
    if (!this.canRedeem()) {
      return;
    }

    this.context.completeWith();
  }
}

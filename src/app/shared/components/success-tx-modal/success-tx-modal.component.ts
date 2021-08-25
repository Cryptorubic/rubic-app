import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-success-tx-modal',
  templateUrl: './success-tx-modal.component.html',
  styleUrls: ['./success-tx-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessTxModalComponent {
  private timer: Subscription;

  public idPrefix: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, { idPrefix: string }>
  ) {
    this.idPrefix = context.data.idPrefix;
    this.timer = timer(5000).subscribe(() => this.onConfirm());
  }

  public ngOnDestroy(): void {
    this.timer.unsubscribe();
  }

  public onConfirm(): void {
    this.context.completeWith(null);
  }
}

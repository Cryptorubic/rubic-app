import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-retrodrop-stake-modal',
  templateUrl: './retrodrop-stake-modal.component.html',
  styleUrls: ['./retrodrop-stake-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetrodropStakeModalComponent {
  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean>
  ) {}

  public async handleConfirm(): Promise<void> {
    this.context.completeWith(true);
  }
}

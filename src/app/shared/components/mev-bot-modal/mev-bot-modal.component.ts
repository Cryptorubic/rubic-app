import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-mev-bot-modal',
  templateUrl: './mev-bot-modal.component.html',
  styleUrls: ['./mev-bot-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MevBotModalComponent {
  constructor(@Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext) {}

  public onConfirm(): void {
    this.context.completeWith();
  }
}

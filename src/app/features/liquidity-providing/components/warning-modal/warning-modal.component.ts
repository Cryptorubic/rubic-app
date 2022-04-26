import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-warning-modal',
  templateUrl: './warning-modal.component.html',
  styleUrls: ['./warning-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarningModalComponent {
  public title: string;

  public text: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    public readonly context: TuiDialogContext<boolean, { title: string; text: string }>
  ) {
    this.title = this.context.data.title;
    this.text = this.context.data.text;
  }
}

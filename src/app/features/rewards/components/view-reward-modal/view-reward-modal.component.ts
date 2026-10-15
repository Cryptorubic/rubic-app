import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';

export interface ViewRewardDialogData {
  title: string | null;
  description: string | null;
  code: string | null;
  link: string | null;
  note: string | null;
}

@Component({
  selector: 'app-view-reward-modal',
  templateUrl: './view-reward-modal.component.html',
  styleUrl: './view-reward-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewRewardModalComponent {
  private readonly context =
    inject<TuiDialogContext<void, ViewRewardDialogData>>(POLYMORPHEUS_CONTEXT);

  protected readonly title = this.context.data.title;
  protected readonly description = this.context.data.description;
  protected readonly code = this.context.data.code;
  protected readonly link = this.context.data.link;
  protected readonly note = this.context.data.note;
}

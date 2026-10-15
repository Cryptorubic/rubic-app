import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { InlineSVGModule } from 'ng-inline-svg-2';

export interface ViewRewardDialogData {
  title: string;
  description: string;
  inputLabel?: string;
  link?: string;
  note?: string;
  activationCode?: string | null;
  activationLink?: string | null;
  userInput?: string | null;
}

@Component({
  selector: 'app-view-reward-modal',
  imports: [InlineSVGModule],
  templateUrl: './view-reward-modal.component.html',
  styleUrl: './view-reward-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewRewardModalComponent {
  private readonly context =
    inject<TuiDialogContext<void, ViewRewardDialogData>>(POLYMORPHEUS_CONTEXT);

  protected readonly title = this.context.data.title;
  protected readonly description = this.context.data.description;
  protected readonly inputLabel = this.context.data.inputLabel;
  protected readonly link = this.context.data.link;
  protected readonly note = this.context.data.note;
  protected readonly activationCode = this.context.data.activationCode;
  protected readonly activationLink = this.context.data.activationLink;
  protected readonly userInput = this.context.data.userInput;

  get shortenedActivationLink(): string {
    const splitLink = this.activationLink?.split('/');
    const hash = splitLink?.[splitLink.length - 1];
    return hash?.slice(0, 6) + '...' + hash?.slice(-4);
  }
}

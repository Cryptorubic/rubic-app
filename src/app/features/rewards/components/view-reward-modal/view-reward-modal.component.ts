import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { SubscriptionType } from '@app/core/services/backend/loyalty-api/models/subscription-item';

export interface ViewRewardDialogData {
  title: string;
  description: string;
  inputLabel?: string;
  link?: string;
  note?: string;
  activationCode?: string | null;
  activationLink?: string | null;
  userInput?: string | null;
  subscriptionType?: SubscriptionType;
  activatedAt?: string | null;
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
  protected readonly isTelegram = this.context.data.subscriptionType === 'TELEGRAM';
  protected readonly activatedAtLabel = this.formatActivatedAt(this.context.data.activatedAt);

  get shortenedActivationLink(): string {
    const splitLink = this.activationLink?.split('/');
    const hash = splitLink?.[splitLink.length - 1];
    return hash?.slice(0, 6) + '...' + hash?.slice(-4);
  }

  private formatActivatedAt(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const parts = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'UTC'
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes): string =>
      parts.find(item => item.type === type)?.value ?? '';

    return `${part('month')} ${part('day')}, ${part('year')} · ${part('hour')}:${part('minute')} UTC`;
  }
}

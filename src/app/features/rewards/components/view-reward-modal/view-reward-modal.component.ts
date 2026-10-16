import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TuiButton, TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { LoyaltyApiService } from '@core/services/backend/loyalty-api/loyalty-api.service';
import { LoyaltySessionService } from '@core/services/backend/loyalty-api/loyalty-session.service';
import { LoyaltySessionStorage } from '@core/services/backend/loyalty-api/loyalty-session-storage';
import { ClaimStatus } from '@app/core/services/backend/loyalty-api/models/claim-history-item';
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
  status?: ClaimStatus;
  claimId?: string;
}

@Component({
  selector: 'app-view-reward-modal',
  imports: [InlineSVGModule, ReactiveFormsModule, TuiButton],
  templateUrl: './view-reward-modal.component.html',
  styleUrl: './view-reward-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewRewardModalComponent {
  private readonly context =
    inject<TuiDialogContext<boolean, ViewRewardDialogData>>(POLYMORPHEUS_CONTEXT);
  private readonly authService = inject(AuthService);
  private readonly loyaltyApiService = inject(LoyaltyApiService);
  private readonly loyaltySession = inject(LoyaltySessionService);
  private readonly sessionStorage = inject(LoyaltySessionStorage);

  protected readonly title = this.context.data.title;
  protected readonly description = this.context.data.description;
  protected readonly inputLabel = this.context.data.inputLabel;
  protected readonly link = this.context.data.link;
  protected readonly note = this.context.data.note;
  protected readonly activationCode = this.context.data.activationCode;
  protected readonly activationLink = this.context.data.activationLink;
  protected readonly userInput = this.context.data.userInput;
  protected readonly isTradingView = this.context.data.subscriptionType === 'TRADINGVIEW';
  protected readonly activatedAtLabel = this.formatActivatedAt(this.context.data.activatedAt);
  protected readonly showsSubscriptionCard =
    (this.context.data.subscriptionType === 'TELEGRAM' || this.isTradingView) &&
    !!this.userInput &&
    !!this.activatedAtLabel;
  protected readonly awaitsUsername =
    this.context.data.status === 'awaiting_input' &&
    (this.context.data.subscriptionType === 'TELEGRAM' || this.isTradingView);
  protected readonly username = new FormControl('', { nonNullable: true });
  protected readonly submitting = signal(false);
  private readonly claimId = this.context.data.claimId;

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

  protected async submitUsername(): Promise<void> {
    const address = this.authService.userAddress;
    if (this.submitting() || !address || !this.claimId) {
      return;
    }

    this.submitting.set(true);
    try {
      await this.sendUsername(address, this.claimId, false);
      this.context.completeWith(true);
    } catch {
      this.submitting.set(false);
    }
  }

  private async sendUsername(address: string, claimId: string, retried: boolean): Promise<void> {
    const token = await this.loyaltySession.ensureToken(address);

    try {
      await firstValueFrom(
        this.loyaltyApiService.submitClaimUserInput(claimId, token, {
          userInput: this.username.value.trim()
        })
      );
    } catch (error: unknown) {
      if (!retried && error instanceof HttpErrorResponse && error.status === 401) {
        this.sessionStorage.delete(address);
        await this.sendUsername(address, claimId, true);
        return;
      }

      throw error;
    }
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ModalService } from '@app/core/modals/services/modal.service';
import { AuthService } from '@core/services/auth/auth.service';
import { LoyaltyApiService } from '@core/services/backend/loyalty-api/loyalty-api.service';
import { LoyaltySessionService } from '@core/services/backend/loyalty-api/loyalty-session.service';
import { LoyaltySessionStorage } from '@core/services/backend/loyalty-api/loyalty-session-storage';
import {
  ClaimHistoryItem,
  ClaimStatus
} from '@core/services/backend/loyalty-api/models/claim-history-item';
import { ViewRewardModalComponent } from '../components/view-reward-modal/view-reward-modal.component';

const STATUS_NOTICES: Partial<Record<ClaimStatus, { title: string; description: string }>> = {
  rejected: {
    title: 'Your points have been returned',
    description:
      'We couldn’t fulfil this reward request, so we’ve returned the points to your balance.<br /><br />You can use them to choose another reward.'
  },
  under_review: {
    title: 'Your reward request is under review',
    description:
      'Our support team is checking your request, and the points used for this reward are temporarily on hold.<br /><br />Check back here for the outcome.'
  },
  denied: {
    title: 'Your reward request was denied',
    description:
      'After reviewing your request, we found that it did not meet the program rules.<br /><br />The points used for this reward won’t be returned.'
  }
};

type CollectionReward = Pick<
  ClaimHistoryItem,
  | 'status'
  | 'statusText'
  | 'activationCode'
  | 'activationLink'
  | 'userInput'
  | 'subscriptionType'
  | 'activatedAt'
> & { id: string };

@Injectable({ providedIn: 'root' })
export class CollectionRewardService {
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly loyaltyApiService = inject(LoyaltyApiService);
  private readonly loyaltySession = inject(LoyaltySessionService);
  private readonly sessionStorage = inject(LoyaltySessionStorage);

  public open(card: CollectionReward, reload: () => void): void {
    if (card.status === 'ready') {
      void this.markReceived(card.id, reload);
    }

    const notice = STATUS_NOTICES[card.status];

    this.modalService
      .openClosableDialog(ViewRewardModalComponent, {
        size: 'm',
        dismissible: true,
        label: '',
        data: notice
          ? {
              title: notice.title,
              description: notice.description
            }
          : {
              title: card.statusText.title,
              description: card.statusText.description,
              inputLabel: card.statusText.inputLabel,
              link: card.statusText.link,
              note: card.statusText.note,
              activationCode: card.activationCode,
              activationLink: card.activationLink,
              userInput: card.userInput,
              subscriptionType: card.subscriptionType,
              activatedAt: card.activatedAt,
              status: card.status,
              claimId: card.id
            }
      })
      .subscribe(submitted => {
        if (submitted) {
          reload();
        }
      });
  }

  private async markReceived(claimId: string, reload: () => void, retried = false): Promise<void> {
    const address = this.authService.userAddress;
    if (!address) {
      return;
    }

    try {
      const token = await this.loyaltySession.ensureToken(address);
      await firstValueFrom(this.loyaltyApiService.receiveClaim(claimId, token));
      reload();
    } catch (error: unknown) {
      if (!retried && error instanceof HttpErrorResponse && error.status === 401) {
        this.sessionStorage.delete(address);
        await this.markReceived(claimId, reload, true);
      }
    }
  }
}

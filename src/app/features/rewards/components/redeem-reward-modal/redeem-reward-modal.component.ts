import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TuiButton, TuiDialogContext } from '@taiga-ui/core';
import { TuiCheckbox } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { LoyaltyApiService } from '@core/services/backend/loyalty-api/loyalty-api.service';
import { LoyaltySessionService } from '@core/services/backend/loyalty-api/loyalty-session.service';
import { LoyaltySessionStorage } from '@core/services/backend/loyalty-api/loyalty-session-storage';
import { ClaimSubscriptionRequest } from '@core/services/backend/loyalty-api/models/claim-subscription';
import { HeaderStore } from '@app/core/header/services/header.store';

export interface RedeemRewardDialogData {
  title: string;
  price: number;
  description: string;
  note: string;
  withInput: boolean;
  inputPlaceholder?: string;
  subscriptionId: string;
  variantId: string;
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
    inject<TuiDialogContext<boolean, RedeemRewardDialogData>>(POLYMORPHEUS_CONTEXT);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loyaltyApiService = inject(LoyaltyApiService);
  private readonly loyaltySession = inject(LoyaltySessionService);
  private readonly sessionStorage = inject(LoyaltySessionStorage);
  private readonly headerStore = inject(HeaderStore);

  protected readonly title = this.context.data.title;
  protected readonly price = this.context.data.price;
  protected readonly description = this.context.data.description;
  protected readonly note = this.context.data.note;
  protected readonly withInput = this.context.data.withInput;
  protected readonly inputPlaceholder = this.context.data.inputPlaceholder ?? '';
  private readonly subscriptionId = this.context.data.subscriptionId;
  private readonly variantId = this.context.data.variantId;
  protected readonly userInput = new FormControl('', { nonNullable: true });
  protected readonly accepted = new FormControl(false, { nonNullable: true });
  protected readonly canRedeem = toSignal(this.accepted.valueChanges, { initialValue: false });
  protected readonly submitting = signal(false);

  protected async redeem(): Promise<void> {
    const address = this.authService.userAddress;
    if (!this.canRedeem() || this.submitting() || !address) {
      return;
    }

    this.submitting.set(true);
    try {
      await this.claimReward(address, false);
      if (!this.headerStore.isTablet) {
        await this.router.navigate(['/rewards/my-collection']);
      }
      this.context.completeWith(true);
    } catch {
      this.submitting.set(false);
    }
  }

  private async claimReward(address: string, retried: boolean): Promise<void> {
    const token = await this.loyaltySession.ensureToken(address);

    try {
      await firstValueFrom(
        this.loyaltyApiService.claimSubscription(this.subscriptionId, token, this.claimBody())
      );
    } catch (error: unknown) {
      if (!retried && error instanceof HttpErrorResponse && error.status === 401) {
        this.sessionStorage.delete(address);
        await this.claimReward(address, true);
        return;
      }

      throw error;
    }
  }

  private claimBody(): ClaimSubscriptionRequest {
    const userInput = this.userInput.value.trim();

    return {
      variantId: this.variantId,
      ...(this.withInput && userInput ? { userInput } : {})
    };
  }
}

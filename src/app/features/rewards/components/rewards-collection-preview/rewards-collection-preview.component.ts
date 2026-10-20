import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { LoyaltyApiService } from '@core/services/backend/loyalty-api/loyalty-api.service';
import { LoyaltySessionService } from '@core/services/backend/loyalty-api/loyalty-session.service';
import { LoyaltySessionStorage } from '@core/services/backend/loyalty-api/loyalty-session-storage';
import {
  ClaimHistoryItem,
  ClaimStatus
} from '@core/services/backend/loyalty-api/models/claim-history-item';
import { CHAIN_TYPE } from '@cryptorubic/core';
import { CollectionRewardService } from '../../services/collection-reward.service';

const PREVIEW_COUNT = 2;

@Component({
  selector: 'app-rewards-collection-preview',
  imports: [TuiButton, TuiLoader],
  templateUrl: './rewards-collection-preview.component.html',
  styleUrl: './rewards-collection-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RewardsCollectionPreviewComponent {
  private readonly authService = inject(AuthService);
  private readonly loyaltyApiService = inject(LoyaltyApiService);
  private readonly loyaltySession = inject(LoyaltySessionService);
  private readonly sessionStorage = inject(LoyaltySessionStorage);
  private readonly collectionReward = inject(CollectionRewardService);

  private readonly currentUser = toSignal(this.authService.currentUser$);

  private readonly claims = signal<ClaimHistoryItem[]>([]);

  protected readonly needsSign = signal(false);

  protected readonly signing = signal(false);

  protected readonly expanded = signal(false);

  protected readonly visibleClaims = computed(() =>
    this.expanded() ? this.claims() : this.claims().slice(0, PREVIEW_COUNT)
  );

  protected readonly showAll = computed(
    () => !this.expanded() && this.claims().length > PREVIEW_COUNT
  );

  constructor() {
    effect(() => {
      const user = this.currentUser();
      const address = user?.address;
      if (!address || user.chainType !== CHAIN_TYPE.EVM) {
        this.claims.set([]);
        this.needsSign.set(false);
        return;
      }

      const token = this.sessionStorage.get(address);
      this.expanded.set(false);
      if (!token) {
        this.claims.set([]);
        this.needsSign.set(true);
        return;
      }

      this.needsSign.set(false);
      void this.loadClaims(address, token);
    });
  }

  protected async signWallet(): Promise<void> {
    const address = this.currentUser()?.address;
    if (!address || this.signing()) {
      return;
    }

    this.signing.set(true);
    try {
      const token = await this.loyaltySession.ensureToken(address);
      await this.loadClaims(address, token);
    } catch {
      this.claims.set([]);
      this.needsSign.set(true);
    } finally {
      this.signing.set(false);
    }
  }

  protected rewardLabel(claim: ClaimHistoryItem): string | null {
    return this.collectionReward.rewardLabel(claim);
  }

  protected isRewardWarning(status: ClaimStatus): boolean {
    return this.collectionReward.isRewardWarning(status);
  }

  protected isRewardDenied(status: ClaimStatus): boolean {
    return this.collectionReward.isRewardDenied(status);
  }

  protected isRewardSuccess(status: ClaimStatus): boolean {
    return this.collectionReward.isRewardSuccess(status);
  }

  protected open(claim: ClaimHistoryItem): void {
    this.collectionReward.open({ ...claim, id: claim.claimId }, () => this.reload());
  }

  protected showAllClaims(): void {
    this.expanded.set(true);
  }

  private reload(): void {
    const address = this.currentUser()?.address;
    const token = address ? this.sessionStorage.get(address) : null;
    if (address && token) {
      void this.loadClaims(address, token);
    }
  }

  private async loadClaims(address: string, token: string): Promise<void> {
    try {
      const history = await firstValueFrom(this.loyaltyApiService.getClaimsHistory(token));
      this.claims.set(history ?? []);
      this.needsSign.set(false);
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.sessionStorage.delete(address);
      }

      this.claims.set([]);
      this.needsSign.set(true);
    }
  }
}

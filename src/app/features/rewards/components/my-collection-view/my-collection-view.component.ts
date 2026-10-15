import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { TuiPagination } from '@taiga-ui/kit';
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
import { ViewRewardModalComponent } from '../view-reward-modal/view-reward-modal.component';
import { PROVIDERS_LIST } from '@core/wallets-modal/components/wallets-modal/models/providers';
import { EMPTY_COLLECTION_CARD } from '../../constants/empty-card';
import { PLACEHOLDER_COLLECTION_CARD } from '../../constants/placeholder-card';
import { CollectionCard } from '../../models/collection-card';
import { compareAddresses } from '@app/shared/utils/utils';

const PAGE_SIZE = 6;

type CollectionViewState = 'connect' | 'prompt' | 'loading' | 'ready';

@Component({
  selector: 'app-my-collection-view',
  imports: [RouterLink, TuiButton, TuiLoader, TuiPagination],
  templateUrl: './my-collection-view.component.html',
  styleUrls: ['../../styles/rewards.scss', './my-collection-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyCollectionViewComponent {
  private readonly authService = inject(AuthService);
  private readonly loyaltyApiService = inject(LoyaltyApiService);
  private readonly loyaltySession = inject(LoyaltySessionService);
  private readonly sessionStorage = inject(LoyaltySessionStorage);
  private readonly modalService = inject(ModalService);
  private readonly injector = inject(Injector);

  private readonly currentUser = toSignal(this.authService.currentUser$);

  private readonly page = signal(0);

  private readonly collection = signal<ClaimHistoryItem[]>([]);

  private readonly viewState = signal<CollectionViewState>('connect');

  private syncedAddress: string | null | undefined = undefined;

  protected readonly state = this.viewState.asReadonly();

  protected readonly pageCount = computed(() => Math.ceil(this.collection().length / PAGE_SIZE));

  protected readonly currentPage = computed(() => {
    const lastPage = Math.max(this.pageCount() - 1, 0);
    return Math.min(this.page(), lastPage);
  });

  protected readonly showPagination = computed(() => this.collection().length > PAGE_SIZE);

  protected readonly visibleCards = computed<CollectionCard[]>(() => {
    const start = this.currentPage() * PAGE_SIZE;
    const cards: CollectionCard[] = this.collection()
      .slice(start, start + PAGE_SIZE)
      .map(claim => ({
        ...claim,
        id: claim.claimId,
        isDetailsOpened: false
      }));

    if (cards.length === 0) {
      cards.push(PLACEHOLDER_COLLECTION_CARD);
    }

    if (cards.length < PAGE_SIZE) {
      cards.push(
        ...Array.from({ length: PAGE_SIZE - cards.length }, (_, index) => ({
          ...EMPTY_COLLECTION_CARD,
          id: `empty-${this.currentPage()}-${index}`
        }))
      );
    }

    return cards;
  });

  constructor() {
    effect(() => {
      this.syncWalletAddress(this.currentUser()?.address ?? null);
    });
  }

  private syncWalletAddress(address: string | null): void {
    if (this.syncedAddress !== undefined && compareAddresses(this.syncedAddress, address)) {
      return;
    }

    if (this.syncedAddress) {
      this.sessionStorage.delete(this.syncedAddress);
    }

    this.syncedAddress = address;
    this.collection.set([]);
    this.page.set(0);

    if (!address) {
      this.viewState.set('connect');
      return;
    }

    const token = this.sessionStorage.get(address);
    if (!token) {
      this.viewState.set('prompt');
      return;
    }

    this.loadCollection(address, token);
  }

  protected connectWallet(): void {
    this.modalService
      .openWalletModal(this.injector, {
        providers: PROVIDERS_LIST.map(provider => provider.value),
        direction: 'column'
      })
      .subscribe();
  }

  protected async signWallet(): Promise<void> {
    const address = this.currentUser()?.address;
    if (!address) {
      return;
    }

    this.viewState.set('loading');
    try {
      const token = await this.loyaltySession.ensureToken(address);
      await this.loadCollection(address, token);
    } catch {
      this.viewState.set('prompt');
    }
  }

  private async loadCollection(address: string, token: string): Promise<void> {
    this.viewState.set('loading');

    try {
      const history = await firstValueFrom(this.loyaltyApiService.getClaimsHistory(token));

      this.collection.set(history ?? []);
      this.viewState.set('ready');
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.sessionStorage.delete(address);
      }

      this.viewState.set('prompt');
    }
  }

  protected selectPage(page: number): void {
    this.page.set(page);
  }

  protected rewardLabel(status: ClaimStatus): string | null {
    switch (status) {
      case 'requested':
        return 'Reward requested';
      case 'ready':
      case 'received':
        return 'View reward';
      case 'under_review':
        return 'Under review';
      case 'rejected':
      case 'denied':
        return 'Declined';
      default:
        return null;
    }
  }

  protected isRewardClickable(status: ClaimStatus): boolean {
    return status === 'requested' || status === 'ready' || status === 'received';
  }

  protected isRewardDeclined(status: ClaimStatus): boolean {
    return status === 'rejected' || status === 'denied';
  }

  protected openReward(card: CollectionCard): void {
    if (!this.isRewardClickable(card.status)) {
      return;
    }

    this.modalService
      .openClosableDialog(ViewRewardModalComponent, {
        size: 'm',
        dismissible: true,
        label: '',
        data: {
          title: card.activationTitle ?? null,
          description: card.activationDescription ?? null,
          code: card.activationCode ?? null,
          link: card.activationLink ?? null,
          note: card.activationNote ?? null
        }
      })
      .subscribe();
  }
}

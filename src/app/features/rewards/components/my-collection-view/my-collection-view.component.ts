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
import { Router, RouterLink } from '@angular/router';
import { TuiButton, TuiLoader, TuiScrollbar } from '@taiga-ui/core';
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
import { CHAIN_TYPE } from '@cryptorubic/core';
import { CHAIN_SUPPORTED_WALLETS } from '@core/services/wallets/constants/chaintype-supported-wallets';
import { CollectionRewardService } from '../../services/collection-reward.service';
import { CollectionCard } from '../../models/collection-card';
import { PlaceholderCard } from '../../models/placheholder-card';
import { compareAddresses } from '@app/shared/utils/utils';

const PAGE_SIZE = 6;

type CollectionViewState = 'connect' | 'prompt' | 'loading' | 'ready';

@Component({
  selector: 'app-my-collection-view',
  imports: [RouterLink, TuiButton, TuiLoader, TuiPagination, TuiScrollbar],
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
  private readonly router = inject(Router);
  private readonly collectionReward = inject(CollectionRewardService);

  private readonly currentUser = toSignal(this.authService.currentUser$);

  private readonly page = signal(0);

  private readonly collection = signal<ClaimHistoryItem[]>([]);

  private readonly viewState = signal<CollectionViewState>('connect');

  private syncedAddress: string | null | undefined = undefined;

  private syncedUnsupported = false;

  protected readonly state = this.viewState.asReadonly();

  protected readonly pageCount = computed(() => Math.ceil(this.collection().length / PAGE_SIZE));

  protected readonly currentPage = computed(() => {
    const lastPage = Math.max(this.pageCount() - 1, 0);
    return Math.min(this.page(), lastPage);
  });

  protected readonly showPagination = computed(() => this.collection().length > PAGE_SIZE);

  protected readonly visibleCards = computed<(CollectionCard | PlaceholderCard)[]>(() => {
    const start = this.currentPage() * PAGE_SIZE;
    const cards: (CollectionCard | PlaceholderCard)[] = this.collection()
      .slice(start, start + PAGE_SIZE)
      .map(claim => ({
        ...claim,
        id: claim.claimId,
        type: 'reward' as const,
        isDetailsOpened: false
      }));

    if (cards.length === 0) {
      cards.push({
        id: 'first-reward',
        type: 'first-reward'
      });
    }

    if (cards.length < PAGE_SIZE) {
      cards.push(
        ...Array.from({ length: PAGE_SIZE - cards.length }, (_, index) => ({
          id: `empty-${this.currentPage()}-${index}`,
          type: 'empty' as const
        }))
      );
    }

    return cards;
  });

  constructor() {
    effect(() => {
      const user = this.currentUser();
      this.syncWalletAddress(user?.address ?? null, user?.chainType);
    });
  }

  private syncWalletAddress(address: string | null, chainType?: string): void {
    const unsupported = !!address && chainType !== CHAIN_TYPE.EVM;

    if (
      this.syncedAddress !== undefined &&
      compareAddresses(this.syncedAddress, address) &&
      this.syncedUnsupported === unsupported
    ) {
      return;
    }

    if (this.syncedAddress) {
      this.sessionStorage.delete(this.syncedAddress);
    }

    this.syncedAddress = address;
    this.syncedUnsupported = unsupported;
    this.collection.set([]);
    this.page.set(0);

    if (!address) {
      this.viewState.set('connect');
      return;
    }

    if (unsupported) {
      void this.router.navigate(['/rewards']);
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
        providers: CHAIN_SUPPORTED_WALLETS[CHAIN_TYPE.EVM],
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

  private async loadCollection(address: string, token: string, withLoading = true): Promise<void> {
    if (withLoading) {
      this.viewState.set('loading');
    }

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

  protected rewardLabel(card: CollectionCard): string | null {
    if (
      card.status === 'awaiting_input' &&
      (card.subscriptionType === 'TELEGRAM' || card.subscriptionType === 'TRADINGVIEW')
    ) {
      return 'Enter username';
    }

    switch (card.status) {
      case 'requested':
        return 'Requested';
      case 'ready':
      case 'received':
        return 'View reward';
      case 'under_review':
        return 'Under review';
      case 'rejected':
        return 'Refunded';
      case 'denied':
        return 'Denied';
      default:
        return null;
    }
  }

  protected isRewardWarning(status: ClaimStatus): boolean {
    return status === 'rejected' || status === 'under_review' || status === 'awaiting_input';
  }

  protected isRewardDenied(status: ClaimStatus): boolean {
    return status === 'denied';
  }

  protected isRewardSuccess(status: ClaimStatus): boolean {
    return status === 'ready';
  }

  protected openReward(card: CollectionCard): void {
    this.collectionReward.open(card, () => this.reloadCollection());
  }

  private reloadCollection(): void {
    const address = this.currentUser()?.address;
    const token = address ? this.sessionStorage.get(address) : null;
    if (address && token) {
      this.loadCollection(address, token, false);
    }
  }
}

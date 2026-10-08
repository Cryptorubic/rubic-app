import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { TuiPagination } from '@taiga-ui/kit';
import { firstValueFrom } from 'rxjs';
import { ModalService } from '@app/core/modals/services/modal.service';
import { AuthService } from '@core/services/auth/auth.service';
import { LoyaltyApiService } from '@core/services/backend/loyalty-api/loyalty-api.service';
import { ClaimHistoryItem } from '@core/services/backend/loyalty-api/models/claim-history-item';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { PROVIDERS_LIST } from '@core/wallets-modal/components/wallets-modal/models/providers';
import { EMPTY_CARD } from '../../constants/empty-card';
import { PLACEHOLDER_CARD } from '../../constants/placeholder-card';
import { RewardCard } from '../../models/reward-card';

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
  private readonly walletConnector = inject(WalletConnectorService);
  private readonly modalService = inject(ModalService);
  private readonly injector = inject(Injector);

  private readonly currentUser = toSignal(this.authService.currentUser$);

  private readonly page = signal(0);

  private readonly collection = signal<ClaimHistoryItem[]>([]);

  private readonly viewState = signal<CollectionViewState>('connect');

  protected readonly state = this.viewState.asReadonly();

  protected readonly pageCount = computed(() => Math.ceil(this.collection().length / PAGE_SIZE));

  protected readonly currentPage = computed(() => {
    const lastPage = Math.max(this.pageCount() - 1, 0);
    return Math.min(this.page(), lastPage);
  });

  protected readonly showPagination = computed(() => this.collection().length > PAGE_SIZE);

  protected readonly visibleCards = computed<RewardCard[]>(() => {
    const start = this.currentPage() * PAGE_SIZE;
    const cards: RewardCard[] = this.collection()
      .slice(start, start + PAGE_SIZE)
      .map((claim): RewardCard => ({
        id: claim.claimId,
        title: claim.subscriptionTitle,
        subTitle: '',
        description: '',
        imageUrl: '',
        price: 0,
        isActive: true,
        canClaim: null,
        isDetailsOpened: false
      }));

    if (cards.length === 0) {
      cards.push(PLACEHOLDER_CARD);
    }

    if (cards.length < PAGE_SIZE) {
      cards.push(
        ...Array.from({ length: PAGE_SIZE - cards.length }, (_, index) => ({
          ...EMPTY_CARD,
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
    this.collection.set([]);
    this.page.set(0);
    this.viewState.set(address ? 'prompt' : 'connect');
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
      const { message } = await firstValueFrom(
        this.loyaltyApiService.signMessage(address, 'history')
      );

      const signature = await this.signPersonalMessage(message, address);

      await this.getCollection(address, message, signature);
      this.viewState.set('ready');
    } catch {
      this.viewState.set('prompt');
    }
  }

  private async getCollection(address: string, message: string, signature: string): Promise<void> {
    const history = await firstValueFrom(
      this.loyaltyApiService.getClaimsHistory({
        userAddress: address,
        message,
        signature
      })
    );

    this.collection.set(history ?? []);
  }

  private signPersonalMessage(message: string, address: string): Promise<string> {
    const hexMessage = `0x${Array.from(new TextEncoder().encode(message), byte =>
      byte.toString(16).padStart(2, '0')
    ).join('')}`;

    return this.walletConnector.provider.wallet.request({
      method: 'personal_sign',
      params: [hexMessage, address]
    });
  }

  protected selectPage(page: number): void {
    this.page.set(page);
  }
}

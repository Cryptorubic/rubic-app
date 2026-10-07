import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiButton } from '@taiga-ui/core';
import { catchError, of, switchMap } from 'rxjs';
import { ModalService } from '@app/core/modals/services/modal.service';
import { AuthService } from '@core/services/auth/auth.service';
import { PROVIDERS_LIST } from '@core/wallets-modal/components/wallets-modal/models/providers';
import { LoyaltyApiService } from '@core/services/backend/loyalty-api/loyalty-api.service';
import { HowRewardsWorkModalComponent } from '@features/rewards/components/how-rewards-work-modal/how-rewards-work-modal.component';
import { RedeemRewardModalComponent } from '@features/rewards/components/redeem-reward-modal/redeem-reward-modal.component';
import { TuiPagination } from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { SubscriptionItem } from '@app/core/services/backend/loyalty-api/models/subscription-item';
import { RewardCard } from '../../models/reward-card';

// const CARD_IMAGE = 'assets/images/rewards/more-rewards-on-the-way.svg';
const GUEST_CARDS_COUNT = 3;
const PAGE_SIZE = 6;
const SUBSCRIPTION_PERIOD = '1Y';

@Component({
  selector: 'app-rewards-view',
  imports: [TuiButton, TuiPagination, InlineSVGModule],
  templateUrl: './rewards-view.component.html',
  styleUrl: './rewards-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RewardsViewComponent {
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly injector = inject(Injector);
  private readonly loyaltyApiService = inject(LoyaltyApiService);

  private readonly currentUser = toSignal(this.authService.currentUser$);

  private readonly page = signal(0);

  protected readonly period = SUBSCRIPTION_PERIOD;

  protected readonly isWalletConnected = computed(() => !!this.currentUser()?.address);

  private readonly catalog = toSignal<SubscriptionItem[], SubscriptionItem[]>(
    this.authService.currentUser$.pipe(
      switchMap(user =>
        this.loyaltyApiService.getSubscriptions(user?.address).pipe(catchError(() => of([])))
      )
    ),
    { initialValue: [] }
  );

  protected readonly guestCards = computed(() => this.catalog().slice(0, GUEST_CARDS_COUNT));

  protected readonly pageCount = computed(() => Math.ceil(this.catalog().length / PAGE_SIZE));

  protected readonly currentPage = computed(() => {
    const lastPage = Math.max(this.pageCount() - 1, 0);
    return Math.min(this.page(), lastPage);
  });

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.pageCount() }, (_, index) => index)
  );

  protected readonly visibleCards = computed<RewardCard[]>(() => {
    const start = this.currentPage() * PAGE_SIZE;

    return this.catalog()
      .slice(start, start + PAGE_SIZE)
      .map(card => ({
        ...card,
        isDetailsOpened: false
      }));
  });

  protected readonly points = toSignal(
    this.authService.currentUser$.pipe(
      switchMap(user =>
        user?.address
          ? this.loyaltyApiService.getUserPoints(user.address).pipe(catchError(() => of(null)))
          : of(null)
      )
    ),
    { initialValue: null }
  );

  protected readonly showPagination = computed(() => this.catalog().length > PAGE_SIZE);

  constructor() {}

  protected connectWallet(): void {
    this.modalService
      .openWalletModal(this.injector, {
        providers: PROVIDERS_LIST.map(provider => provider.value),
        direction: 'column'
      })
      .subscribe();
  }

  protected selectPage(page: number): void {
    this.page.set(page);
  }

  protected previousPage(): void {
    this.selectPage(Math.max(this.currentPage() - 1, 0));
  }

  protected nextPage(): void {
    this.selectPage(Math.min(this.currentPage() + 1, Math.max(this.pageCount() - 1, 0)));
  }

  protected openHowItWorks(): void {
    this.modalService
      .openClosableDialog(HowRewardsWorkModalComponent, {
        size: 'm',
        dismissible: true,
        label: ''
      })
      .subscribe();
  }

  protected openRedeem(card: RewardCard): void {
    if (!card.canClaim) {
      return;
    }

    this.modalService
      .openClosableDialog(RedeemRewardModalComponent, {
        size: 'm',
        dismissible: true,
        label: '',
        data: { title: card.title, price: card.price }
      })
      .subscribe();
  }
}

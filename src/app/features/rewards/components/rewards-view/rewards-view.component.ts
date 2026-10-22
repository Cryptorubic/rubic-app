import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiButton, TuiScrollbar } from '@taiga-ui/core';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { ModalService } from '@app/core/modals/services/modal.service';
import { AuthService } from '@core/services/auth/auth.service';
import { CHAIN_TYPE } from '@cryptorubic/core';
import { CHAIN_SUPPORTED_WALLETS } from '@core/services/wallets/constants/chaintype-supported-wallets';
import { LoyaltyApiService } from '@core/services/backend/loyalty-api/loyalty-api.service';
import { HowRewardsWorkModalComponent } from '@features/rewards/components/how-rewards-work-modal/how-rewards-work-modal.component';
import { RedeemRewardModalComponent } from '@features/rewards/components/redeem-reward-modal/redeem-reward-modal.component';
import { TuiPagination } from '@taiga-ui/kit';
import {
  SubscriptionItem,
  SubscriptionVariant
} from '@app/core/services/backend/loyalty-api/models/subscription-item';
import { RewardCard } from '../../models/reward-card';
import { PlaceholderCard } from '../../models/placheholder-card';
import { HeaderStore } from '@app/core/header/services/header.store';
import { RewardsCollectionPreviewComponent } from '../rewards-collection-preview/rewards-collection-preview.component';

const GUEST_CARDS_COUNT = 3;
const PAGE_SIZE = 6;

@Component({
  selector: 'app-rewards-view',
  imports: [RewardsCollectionPreviewComponent, TuiButton, TuiPagination, TuiScrollbar],
  templateUrl: './rewards-view.component.html',
  styleUrls: ['../../styles/rewards.scss', './rewards-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RewardsViewComponent {
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly injector = inject(Injector);
  private readonly loyaltyApiService = inject(LoyaltyApiService);
  private readonly collectionPreview = viewChild(RewardsCollectionPreviewComponent);
  private readonly headerStore = inject(HeaderStore);

  private readonly currentUser = toSignal(this.authService.currentUser$);

  private readonly page = signal(0);

  private readonly catalogLoading = signal(true);

  private readonly cardsList = viewChild<ElementRef<HTMLElement>>('cardsList');

  protected readonly activeSlide = signal(0);

  protected readonly isEvmWalletConnected = computed(
    () => this.currentUser()?.chainType === CHAIN_TYPE.EVM
  );

  protected readonly isUnsupportedWallet = computed(
    () => !!this.currentUser()?.address && !this.isEvmWalletConnected()
  );

  private readonly catalog = toSignal<SubscriptionItem[], SubscriptionItem[]>(
    this.authService.currentUser$.pipe(
      map(user => (user?.address && user.chainType === CHAIN_TYPE.EVM ? user.address : undefined)),
      distinctUntilChanged(),
      switchMap(address => {
        this.catalogLoading.set(true);
        return this.loyaltyApiService.getSubscriptions(address).pipe(
          catchError(() => of([])),
          tap(() => this.catalogLoading.set(false))
        );
      })
    ),
    { initialValue: [] }
  );

  protected readonly pageCount = computed(() => Math.ceil(this.catalog().length / PAGE_SIZE));

  protected readonly currentPage = computed(() => {
    const lastPage = Math.max(this.pageCount() - 1, 0);
    return Math.min(this.page(), lastPage);
  });

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.pageCount() }, (_, index) => index)
  );

  protected readonly showPagination = computed(
    () => this.isEvmWalletConnected() && this.catalog().length > PAGE_SIZE && !this.isTablet
  );

  protected readonly visibleCards = computed<(RewardCard | PlaceholderCard)[]>(() => {
    let cardsToShow = 0;
    let catalogToShow: SubscriptionItem[] = [];

    if (this.isEvmWalletConnected()) {
      if (!this.isTablet) {
        const start = this.currentPage() * PAGE_SIZE;
        cardsToShow = PAGE_SIZE;
        catalogToShow = this.catalog().slice(start, start + cardsToShow);
      } else {
        catalogToShow = this.catalog();
      }
    } else {
      cardsToShow = GUEST_CARDS_COUNT;
      catalogToShow = this.catalog().slice(0, cardsToShow);
    }

    const cards: (RewardCard | PlaceholderCard)[] = catalogToShow
      .map(card => {
        const variants = card.variants ?? [];

        return {
          ...card,
          type: 'reward' as const,
          variants,
          isDetailsOpened: false,
          selectedVariantId: variants[0]?.id ?? null
        };
      })
      .filter(card => card.selectedVariantId);

    if (!this.isTablet) {
      if (!this.catalogLoading() && cards.length === 0) {
        cards.push({
          id: 'more-rewards',
          type: 'more-rewards'
        });
      }

      if (cards.length < cardsToShow) {
        cards.push(
          ...Array.from({ length: cardsToShow - cards.length }, (_, index) => ({
            id: `empty-${this.currentPage()}-${index}`,
            type: 'empty' as const
          }))
        );
      }
    }

    if (this.isTablet && !this.isEvmWalletConnected()) {
      for (let i = 0; i < 2; i++) {
        cards.push({
          id: `rubic-cube-${i}`,
          type: 'rubic-cube' as const
        });
      }
    }

    return cards;
  });

  protected readonly slideIndex = computed(() => {
    const last = Math.max(this.visibleCards().length - 1, 0);
    return Math.min(this.activeSlide(), last);
  });

  protected readonly points = toSignal(
    this.authService.currentUser$.pipe(
      switchMap(user =>
        user?.address && this.isEvmWalletConnected()
          ? this.loyaltyApiService.getUserPoints(user.address).pipe(catchError(() => of(null)))
          : of(null)
      )
    ),
    { initialValue: null }
  );

  public get isTablet(): boolean {
    return this.headerStore.isTablet;
  }

  constructor() {}

  protected connectWallet(): void {
    this.modalService
      .openWalletModal(this.injector, {
        providers: CHAIN_SUPPORTED_WALLETS[CHAIN_TYPE.EVM],
        direction: 'column'
      })
      .subscribe();
  }

  protected selectPage(page: number): void {
    this.page.set(page);
  }

  protected onCardsScroll(event: Event): void {
    const list = event.target as HTMLElement;
    const card = list.querySelector<HTMLElement>('.rewards__card:not(.card_dark-bg)');
    if (!card) {
      return;
    }

    const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
    const step = card.offsetWidth + gap;
    if (step <= 0) {
      return;
    }

    const last = Math.max(this.visibleCards().length - 1, 0);
    const index = Math.min(Math.max(Math.round(list.scrollLeft / step), 0), last);
    this.activeSlide.set(index);
  }

  protected scrollToSlide(index: number): void {
    const list = this.cardsList()?.nativeElement;
    const card = list?.querySelector<HTMLElement>('.rewards__card:not(.card_dark-bg)');
    if (!list || !card) {
      return;
    }

    const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
    list.scrollTo({ left: index * (card.offsetWidth + gap), behavior: 'smooth' });
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

  protected selectedVariant(card: RewardCard): SubscriptionVariant | null {
    const variants = card.variants ?? [];

    return variants.find(variant => variant.id === card.selectedVariantId) ?? variants[0] ?? null;
  }

  protected selectVariant(card: RewardCard, variantId: string): void {
    card.selectedVariantId = variantId;
  }

  protected openRedeem(card: RewardCard, variant: SubscriptionVariant): void {
    if (!variant.canClaim) {
      return;
    }

    this.modalService
      .openClosableDialog(RedeemRewardModalComponent, {
        size: 'm',
        dismissible: true,
        label: '',
        data: {
          title: `${card.title} ${variant.title}`,
          price: variant.price,
          description: card.redeemDescription,
          note: card.redeemNote,
          withInput: card.deliveryType === 'user_input',
          inputPlaceholder: card.redeemInputPlaceholder,
          subscriptionId: card.id,
          variantId: variant.id
        }
      })
      .subscribe(claimed => {
        if (claimed && this.isTablet) {
          this.collectionPreview()?.reload();
        }
      });
  }
}

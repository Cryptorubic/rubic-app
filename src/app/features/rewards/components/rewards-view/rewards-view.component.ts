import { ChangeDetectionStrategy, Component, computed, inject, Injector } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiButton } from '@taiga-ui/core';
import { catchError, map, of } from 'rxjs';
import { ModalService } from '@app/core/modals/services/modal.service';
import { AuthService } from '@core/services/auth/auth.service';
import { PROVIDERS_LIST } from '@core/wallets-modal/components/wallets-modal/models/providers';
import { LoyaltyApiService } from '@core/services/backend/loyalty-api/loyalty-api.service';

const CARD_IMAGE = 'assets/images/rewards/more-rewards-on-the-way.svg';
const VISIBLE_CARDS_COUNT = 3;

@Component({
  selector: 'app-rewards-view',
  imports: [TuiButton],
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

  protected readonly isWalletConnected = computed(() => !!this.currentUser()?.address);

  protected readonly cards = toSignal(
    this.loyaltyApiService.getSubscriptions().pipe(
      map(items =>
        items.slice(0, VISIBLE_CARDS_COUNT).map(item => ({
          id: item.id,
          title: item.title,
          image: CARD_IMAGE
        }))
      ),
      catchError(() => of([]))
    ),
    { initialValue: [] }
  );

  protected connectWallet(): void {
    this.modalService
      .openWalletModal(this.injector, {
        providers: PROVIDERS_LIST.map(provider => provider.value),
        direction: 'column'
      })
      .subscribe();
  }
}

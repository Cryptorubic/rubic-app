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
import { ModalService } from '@app/core/modals/services/modal.service';
import { AuthService } from '@core/services/auth/auth.service';
import { PROVIDERS_LIST } from '@core/wallets-modal/components/wallets-modal/models/providers';

const CARD_IMAGE = 'assets/images/rewards/more-rewards-on-the-way.svg';

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

  private readonly currentUser = toSignal(this.authService.currentUser$);

  protected readonly isWalletConnected = computed(() => !!this.currentUser()?.address);

  protected readonly cards = signal(
    Array.from({ length: 3 }, () => ({
      title: 'Placeholder',
      image: CARD_IMAGE
    }))
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

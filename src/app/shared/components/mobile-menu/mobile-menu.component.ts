import { ChangeDetectionStrategy, Component, Injector, Inject } from '@angular/core';
import { ModalName } from '@app/core/modals/models/mobile-native-options';
import { ModalService } from '@app/core/modals/services/modal.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TradesHistory } from '@core/header/components/header/components/mobile-user-profile/models/tradeHistory';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileMenuComponent {
  public readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public readonly currentUser$ = this.authService.currentUser$;

  constructor(
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public openModal(e: Event, modalName: ModalName): void {
    e.stopPropagation();
    if (this.modalService?.openedModal && this.modalService.openedModal.name === modalName) return;

    switch (modalName) {
      case 'navigation':
        this.modalService.openMobileNavigationMenu().subscribe();
        break;
      case 'profile':
        this.modalService.openUserProfile(TradesHistory.CROSS_CHAIN).subscribe();
        break;
      case 'rubic-menu':
        this.modalService.openRubicMenu().subscribe();
        break;
      case 'settings':
        this.modalService.openSettings(this.injector).subscribe();
        break;
      case 'wallet':
        this.modalService.openWalletModal(this.injector).subscribe();
        break;
    }
  }
}

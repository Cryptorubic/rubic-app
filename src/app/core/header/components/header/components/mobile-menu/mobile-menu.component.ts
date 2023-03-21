import { ChangeDetectionStrategy, Component, Injector, Inject } from '@angular/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { SwapTypeService } from '@app/core/services/swaps/swap-type.service';
import { SWAP_PROVIDER_TYPE } from '@app/features/swaps/features/swap-form/models/swap-provider-type';
import { Observable } from 'rxjs';
import { TradesHistory } from '@core/header/components/header/components/mobile-user-profile/mobile-user-profile.component';
import { RubicAny } from '@shared/models/utility-types/rubic-any';

declare var LiveChatWidget: RubicAny;

// enum MenuItems {
//   RUBIC_MENU,
//   LIVE_CHAT,
//   SETTINGS,
//   PROFILE
// }

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileMenuComponent {
  public isMenuOpened = false;

  public readonly swapType$: Observable<SWAP_PROVIDER_TYPE> = this.swapTypeService.swapMode$;

  public readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public readonly currentUser$ = this.authService.currentUser$;
  // public MenuItems = MenuItems;

  // private readonly MenuComponents = {
  //   [MenuItems.RUBIC_MENU]: RubicMenuComponent,
  //   [MenuItems.LIVE_CHAT]: RubicMenuComponent,
  //   [MenuItems.SETTINGS]: SettingsComponent,
  //   [MenuItems.PROFILE]: RubicMenuComponent
  // }

  constructor(
    private readonly authService: AuthService,
    private readonly swapTypeService: SwapTypeService,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public async navigateToSwaps(): Promise<void> {
    await this.swapTypeService.navigateToSwaps();
  }

  public async navigateToLimitOrder(): Promise<void> {
    await this.swapTypeService.navigateToLimitOrder();
  }

  public openNavigationMenu(): void {
    LiveChatWidget.call('minimize');
    this.modalService.openMobileNavigationMenu().subscribe();
  }

  public openRubicMenu(): void {
    LiveChatWidget.call('minimize');
    this.modalService.openRubicMenu().subscribe();
  }

  public openSettings(): void {
    LiveChatWidget.call('minimize');
    this.modalService.openSettings().subscribe();
  }

  public openLiveChat(): void {
    LiveChatWidget.call('maximize');
    // this.modalService.openLiveChat().subscribe();
  }

  public openProfile(): void {
    LiveChatWidget.call('minimize');
    this.modalService.openUserProfile(TradesHistory.CROSS_CHAIN).subscribe();
  }

  public openWallet(): void {
    LiveChatWidget.call('minimize');
    this.modalService.openWalletModal(this.injector).subscribe();
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { SwapTypeService } from '@app/core/services/swaps/swap-type.service';
import { SWAP_PROVIDER_TYPE } from '@app/features/swaps/features/swap-form/models/swap-provider-type';
import { Observable } from 'rxjs';

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

  public readonly swapType$: Observable<SWAP_PROVIDER_TYPE>;

  public SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  // public MenuItems = MenuItems;

  // private readonly MenuComponents = {
  //   [MenuItems.RUBIC_MENU]: RubicMenuComponent,
  //   [MenuItems.LIVE_CHAT]: RubicMenuComponent,
  //   [MenuItems.SETTINGS]: SettingsComponent,
  //   [MenuItems.PROFILE]: RubicMenuComponent
  // }

  constructor(
    private readonly swapTypeService: SwapTypeService,
    private readonly modalService: ModalService
  ) {
    this.swapType$ = this.swapTypeService.swapMode$;
  }

  public toggleMenu(): void {
    this.isMenuOpened = !this.isMenuOpened;
  }

  public async navigateToSwaps(): Promise<void> {
    await this.swapTypeService.navigateToSwaps();
    this.toggleMenu();
  }

  public async navigateToLimitOrder(): Promise<void> {
    await this.swapTypeService.navigateToLimitOrder();
    this.toggleMenu();
  }

  public openRubicMenu(): void {
    this.modalService.openRubicMenu().subscribe();
  }

  public openSettings(): void {
    this.modalService.openSettings().subscribe();
  }

  public openLiveChat(): void {
    this.modalService.openLiveChat().subscribe();
  }

  public openProfile(): void {
    this.modalService.openUserProfile().subscribe();
  }
}

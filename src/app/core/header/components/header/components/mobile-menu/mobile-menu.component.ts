import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapTypeService } from '@app/core/services/swaps/swap-type.service';
import { SWAP_PROVIDER_TYPE } from '@app/features/swaps/features/swap-form/models/swap-provider-type';
import { Observable } from 'rxjs';

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

  constructor(private readonly swapTypeService: SwapTypeService) {
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
}

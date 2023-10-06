import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';

@Component({
  selector: 'app-form-navigation',
  templateUrl: './form-navigation.component.html',
  styleUrls: ['./form-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormNavigationComponent {
  public readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  constructor() {}

  public async navigateToSwaps(): Promise<void> {
    // await this.swapTypeService.navigateToSwaps();
  }

  public async navigateToLimitOrder(): Promise<void> {
    // await this.swapTypeService.navigateToLimitOrder();
  }
}

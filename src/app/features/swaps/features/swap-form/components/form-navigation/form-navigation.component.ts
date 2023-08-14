import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';

@Component({
  selector: 'app-form-navigation',
  templateUrl: './form-navigation.component.html',
  styleUrls: ['./form-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormNavigationComponent {
  public readonly swapType$ = this.swapTypeService.swapMode$;

  public readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  constructor(private readonly swapTypeService: SwapTypeService) {}

  public async navigateToSwaps(): Promise<void> {
    await this.swapTypeService.navigateToSwaps();
  }

  public async navigateToFaucets(): Promise<void> {
    await this.swapTypeService.navigateToFaucets();
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { map } from 'rxjs/operators';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { isMinimalToken } from '@shared/utils/is-token';
import { getBlockchainItem } from '@features/swaps/features/swap-form/utils/get-blockchain-item';

@Component({
  selector: 'app-form-header',
  templateUrl: './form-header.component.html',
  styleUrls: ['./form-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormHeaderComponent {
  public readonly showBlockchains$ = this.swapFormService.inputValue$.pipe(
    map(inputForm => isMinimalToken(inputForm.fromAsset) && inputForm.toToken)
  );

  public readonly fromBlockchainItem$ = this.swapFormService.fromBlockchain$.pipe(
    map(getBlockchainItem)
  );

  public readonly toBlockchainItem$ = this.swapFormService.toBlockchain$.pipe(
    map(getBlockchainItem)
  );

  public readonly swapType$ = this.swapTypeService.swapMode$.pipe(
    map(mode => {
      if (mode) {
        const swapTypeLabel = {
          [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: 'Instant Trade',
          [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: 'Cross-Chain',
          [SWAP_PROVIDER_TYPE.ONRAMPER]: 'Onramper'
        };
        return swapTypeLabel[mode];
      }
    })
  );

  constructor(
    private readonly swapTypeService: SwapTypeService,
    private readonly swapFormService: SwapFormService
  ) {}
}

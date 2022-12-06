import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { map } from 'rxjs/operators';
import { SwapsFormService } from '@features/swaps/core/services/swaps-form-service/swaps-form.service';
import { isMinimalToken } from '@shared/utils/is-token';
import { getBlockchainItem } from '@features/swaps/features/swaps-form/utils/get-blockchain-item';

@Component({
  selector: 'app-swaps-header',
  templateUrl: './swaps-header.component.html',
  styleUrls: ['./swaps-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapsHeaderComponent {
  public readonly showBlockchains$ = this.swapsFormService.inputValue$.pipe(
    map(inputForm => isMinimalToken(inputForm.fromAsset) && inputForm.toToken)
  );

  public readonly fromBlockchainItem$ = this.swapsFormService.fromBlockchain$.pipe(
    map(getBlockchainItem)
  );

  public readonly toBlockchainItem$ = this.swapsFormService.toBlockchain$.pipe(
    map(getBlockchainItem)
  );

  public readonly swapType$ = this.swapsService.swapMode$.pipe(
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
    private readonly swapsService: SwapsService,
    private readonly swapsFormService: SwapsFormService
  ) {}
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { getBlockchainItem } from '@features/swaps/features/swap-form/utils/get-blockchain-item';
import { AssetTypeItem } from '@features/swaps/features/swap-form/models/asset-type-item';
import { of } from 'rxjs';

@Component({
  selector: 'app-form-header',
  templateUrl: './form-header.component.html',
  styleUrls: ['./form-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormHeaderComponent {
  public readonly showBlockchains$ = of(true);
  // public readonly showBlockchains$ = this.swapFormService.inputValue$.pipe(
  //   map(inputForm => {
  //     if (this.swapTypeService.getSwapProviderType() === SWAP_PROVIDER_TYPE.LIMIT_ORDER) {
  //       return isMinimalToken(inputForm.fromAsset) || inputForm.toToken;
  //     }
  //     return isMinimalToken(inputForm.fromAsset) && inputForm.toToken;
  //   })
  // );

  public readonly fromBlockchainItem$ = this.swapFormService.fromBlockchain$.pipe(
    map(getBlockchainItem)
  );

  public readonly toBlockchainItem$ = this.swapFormService.toBlockchain$.pipe(
    map(getBlockchainItem)
  );

  // public readonly swapType$ = this.swapTypeService.swapMode$.pipe(
  //   map(mode => {
  //     if (mode) {
  //       const swapTypeLabel = {
  //         [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: 'Instant Trade',
  //         [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: 'Cross-Chain',
  //         [SWAP_PROVIDER_TYPE.ONRAMPER]: 'Onramper',
  //         [SWAP_PROVIDER_TYPE.LIMIT_ORDER]: 'Limit Order'
  //       };
  //       return swapTypeLabel[mode];
  //     }
  //   })
  // );

  // public readonly isLimitOrder$ = this.swapTypeService.swapMode$.pipe(
  //   map(mode => mode === SWAP_PROVIDER_TYPE.LIMIT_ORDER)
  // );

  constructor(private readonly swapFormService: SwapFormService) {}

  public getFirstBlockchainItem(
    fromBlockchainItem: AssetTypeItem,
    _toBlockchainItem: AssetTypeItem
  ): AssetTypeItem {
    return fromBlockchainItem;
  }
}

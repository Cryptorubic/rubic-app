import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Asset } from '@features/swaps/shared/models/form/asset';
import { isMinimalToken } from '@shared/utils/is-token';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { ModalService } from '@core/modals/services/modal.service';
import { FormType } from '@features/swaps/shared/models/form/form-type';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { SwapsControllerService } from '@features/trade/services/swaps-controller/swaps-controller.service';

@Component({
  selector: 'app-trade-page',
  templateUrl: './trade-page.component.html',
  styleUrls: ['./trade-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradePageComponent {
  public readonly fromAsset$ = this.swapFormService.fromToken$;

  public readonly toAsset$ = this.swapFormService.toToken$;

  public readonly toAmount$ = this.swapFormService.toAmount$;

  constructor(
    private readonly modalService: ModalService,
    private readonly swapFormService: SwapsFormService,
    private readonly swapsControllerService: SwapsControllerService
  ) {}

  public openTokensSelect(formType: FormType): void {
    this.modalService.openAssetsSelector(formType, '').subscribe((asset: Asset) => {
      if (asset) {
        // this.selectedAsset = asset;
        // const inputElement = this.document.getElementById('token-amount-input-element');
        // const isFromAmountEmpty = !this.swapFormService.inputValue.fromAmount?.isFinite();

        // if (inputElement && isFromAmountEmpty) {
        //   setTimeout(() => {
        //     inputElement.focus();
        //   }, 0);
        // }

        if (formType === 'from') {
          this.swapFormService.inputControl.patchValue({
            fromAssetType: isMinimalToken(asset) ? asset.blockchain : 'fiat',
            fromAsset: asset
          });
        } else {
          this.swapFormService.inputControl.patchValue({
            toToken: asset as TokenAmount,
            toBlockchain: (asset as TokenAmount).blockchain
          });
        }
      }
    });
  }
}

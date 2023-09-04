import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Asset } from '@features/swaps/shared/models/form/asset';
import { isMinimalToken } from '@shared/utils/is-token';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { ModalService } from '@core/modals/services/modal.service';
import { FormType } from '@features/swaps/shared/models/form/form-type';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-trade-page',
  templateUrl: './trade-page.component.html',
  styleUrls: ['./trade-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ width: 0, opacity: 0.5 }),
        animate('0.1s ease-out', style({ width: 400, opacity: 1 }))
      ]),
      transition(':leave', [
        style({ width: 400, opacity: 1 }),
        animate('0.1s ease-in', style({ width: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class TradePageComponent {
  public readonly fromAsset$ = this.swapFormService.fromToken$;

  public readonly toAsset$ = this.swapFormService.toToken$;

  public readonly toAmount$ = this.swapFormService.toAmount$;

  public isExpanded = false;

  constructor(
    private readonly modalService: ModalService,
    private readonly swapFormService: SwapsFormService
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

  expand(): void {
    this.isExpanded = !this.isExpanded;
  }
}

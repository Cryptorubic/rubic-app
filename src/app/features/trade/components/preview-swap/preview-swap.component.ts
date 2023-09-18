import { ChangeDetectionStrategy, Component } from '@angular/core';
import BigNumber from 'bignumber.js';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { first, map } from 'rxjs/operators';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { forkJoin, Observable } from 'rxjs';
import { BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { AssetSelector } from '@shared/models/asset-selector';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SelectedTrade } from '@features/trade/models/selected-trade';

@Component({
  selector: 'app-preview-swap',
  templateUrl: './preview-swap.component.html',
  styleUrls: ['./preview-swap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewSwapComponent {
  public gasFee = new BigNumber(3.44159);

  public providerFee = new BigNumber(3.44159);

  public time = '3 min';

  public tradeInfo$ = forkJoin([
    this.swapForm.fromToken$.pipe(first()),
    this.swapForm.fromAmount$.pipe(first()),
    this.swapForm.toToken$.pipe(first()),
    this.swapForm.toAmount$.pipe(first())
  ]).pipe(
    map(([fromToken, fromAmount, toToken, toAmount]) => {
      const fromAsset = this.getTokenAsset(fromToken);
      const fromValue = {
        tokenAmount: fromAmount,
        fiatAmount: fromAmount.multipliedBy(fromToken.price || 0)
      };

      const toAsset = this.getTokenAsset(toToken);
      const toValue = {
        tokenAmount: toAmount,
        fiatAmount: toAmount.multipliedBy(toToken.price || 0)
      };

      return { fromAsset, fromValue, toAsset, toValue };
    })
  );

  public readonly tradeState$: Observable<SelectedTrade> = this.swapsStateService.tradeState$.pipe(
    first()
  );

  constructor(
    private readonly swapsStateService: SwapsStateService,
    private readonly swapForm: SwapsFormService
  ) {}

  private getTokenAsset(token: TokenAmount): AssetSelector {
    const blockchain = BLOCKCHAINS[token.blockchain];
    const color = blockchainColor[token.blockchain];

    return {
      secondImage: blockchain.img,
      secondLabel: blockchain.name,
      mainImage: token.image,
      mainLabel: token.symbol,
      secondColor: color
    };
  }
}

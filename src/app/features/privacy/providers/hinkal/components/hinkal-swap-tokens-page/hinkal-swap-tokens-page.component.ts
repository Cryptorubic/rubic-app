import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateSwapEvent } from '../../../shared-privacy-providers/models/private-event';
import { HinkalQuoteService } from '../../services/hinkal-quote.service';
import { HinkalQuoteAdapter } from '../../services/hinkal-sdk/utils/hinkal-quote-adapter';
import { EvmBlockchainName, Token, TokenAmount } from '@cryptorubic/core';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { firstValueFrom } from 'rxjs';
import { HinkalPrivateAssetsService } from '../../services/hinkal-private-assets.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { HinkalSwapTokensFacadeService } from '../../services/hinkal-swap-tokens-facade.service';

@Component({
  selector: 'app-hinkal-swap-tokens-page',
  templateUrl: './hinkal-swap-tokens-page.component.html',
  styleUrls: ['./hinkal-swap-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: HinkalPrivateAssetsService },
    { provide: TokensFacadeService, useClass: HinkalSwapTokensFacadeService }
  ]
})
export class HinkalSwapTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  constructor(
    private readonly hinkalQuoteService: HinkalQuoteService,
    private readonly hinkalFacadeService: HinkalFacadeService,
    private readonly notificationsService: NotificationsService
  ) {}

  public readonly quoteAdapter = new HinkalQuoteAdapter(
    this.hinkalQuoteService,
    this.notificationsService
  );

  public async handleSwap({
    swapInfo,
    loadingCallback,
    openPreview
  }: PrivateSwapEvent): Promise<void> {
    try {
      const fromToken = new TokenAmount({
        ...swapInfo.fromAsset,
        weiAmount: Token.toWei(swapInfo.fromAmount.actualValue, swapInfo.fromAsset.decimals)
      });

      const toToken = new TokenAmount({
        ...swapInfo.toAsset,
        weiAmount: Token.toWei(swapInfo.toAmount.actualValue, swapInfo.toAsset.decimals)
      });

      const preview$ = openPreview({
        steps: [
          {
            label: 'Swap',
            action: () =>
              this.hinkalFacadeService.swap(
                fromToken as TokenAmount<EvmBlockchainName>,
                toToken as TokenAmount<EvmBlockchainName>
              )
          }
        ]
      });

      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}

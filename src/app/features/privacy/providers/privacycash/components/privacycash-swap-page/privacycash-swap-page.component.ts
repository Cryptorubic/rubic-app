import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { PrivacycashQuoteAdapter } from '../../utils/privacycash-quote-adapter';
import { PrivateSwapEvent } from '../../../shared-privacy-providers/models/private-event';
import { toPrivacyCashTokenAddr } from '../../utils/converter';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivacycashPrivateAssetsService } from '../../services/common/assets-services/privacycash-private-assets.service';
import { Token } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { firstValueFrom } from 'rxjs';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { PrivacycashPrivateTokensFacadeService } from '../../services/common/token-facades/privacycash-private-tokens-facade.service';

@Component({
  selector: 'app-privacycash-swap-page',
  templateUrl: './privacycash-swap-page.component.html',
  styleUrls: ['./privacycash-swap-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: PrivacycashPrivateAssetsService },
    { provide: FromAssetsService, useClass: PrivacycashPrivateAssetsService },
    { provide: TokensFacadeService, useClass: PrivacycashPrivateTokensFacadeService }
  ]
})
export class PrivacycashSwapPageComponent {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  private readonly notificationsService = inject(NotificationsService);

  public readonly quoteAdapter = new PrivacycashQuoteAdapter(
    this.privacycashSwapService,
    this.notificationsService
  );

  public async swap({ swapInfo, loadingCallback, openPreview }: PrivateSwapEvent): Promise<void> {
    try {
      const pcSupportedSrcToken = {
        ...swapInfo.fromAsset,
        address: toPrivacyCashTokenAddr(swapInfo.fromAsset.address)
      };
      const pcSupportedDstToken = {
        ...swapInfo.toAsset,
        address: toPrivacyCashTokenAddr(swapInfo.toAsset.address)
      };
      const srcAmountWei = Token.toWei(
        swapInfo.fromAmount.actualValue,
        swapInfo.fromAsset.decimals
      );

      const preview$ = openPreview({
        steps: [
          {
            label: 'Swap',
            action: () =>
              this.privacycashSwapService.swapPartialPrivateBalance(
                pcSupportedSrcToken,
                pcSupportedDstToken,
                new BigNumber(srcAmountWei)
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

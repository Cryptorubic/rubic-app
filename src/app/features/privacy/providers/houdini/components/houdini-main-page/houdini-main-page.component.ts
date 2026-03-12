import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { HoudiniPrivateAssetsService } from '@app/features/privacy/providers/houdini/services/houdini-private-assets.service';
import { HoudiniSwapService } from '@app/features/privacy/providers/houdini/services/houdini-swap.service';
import { HoudiniTokensFacadeService } from '@app/features/privacy/providers/houdini/services/houdini-tokens-facade.service';
import { HoudiniQuoteAdapter } from '@app/features/privacy/providers/houdini/utils/houdini-quote-adapter';
import { PrivateSwapEvent } from '@app/features/privacy/providers/shared-privacy-providers/models/private-event';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
import { BlockchainName, TokenAmount } from '@cryptorubic/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-houdini-main-page',
  templateUrl: './houdini-main-page.component.html',
  styleUrls: ['./houdini-main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: FromAssetsService, useClass: HoudiniPrivateAssetsService },
    { provide: ToAssetsService, useClass: HoudiniPrivateAssetsService },
    { provide: TokensFacadeService, useClass: HoudiniTokensFacadeService }
  ]
})
export class HoudiniMainPageComponent {
  public readonly quoteAdapter = new HoudiniQuoteAdapter(
    this.houdiniSwapService,
    this.notificationsService,
    this.targetAddressService
  );

  constructor(
    private readonly houdiniSwapService: HoudiniSwapService,
    private readonly notificationsService: NotificationsService,
    private readonly targetAddressService: TargetNetworkAddressService
  ) {}

  public async swap({ swapInfo, loadingCallback, openPreview }: PrivateSwapEvent): Promise<void> {
    try {
      const fromToken = new TokenAmount({
        ...swapInfo.fromAsset,
        tokenAmount: swapInfo.fromAmount.actualValue
      });

      const preview$ = openPreview({
        steps: [
          {
            label: 'Swap',
            action: () =>
              this.houdiniSwapService.transfer(
                swapInfo.tradeId,
                fromToken as TokenAmount<BlockchainName>,
                swapInfo.toAsset,
                this.targetAddressService.address
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

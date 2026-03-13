import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ClearswapErrorService } from '@app/features/privacy/providers/clearswap/services/clearswap-error.service';
import { ClearswapPrivateAssetsService } from '@app/features/privacy/providers/clearswap/services/clearswap-private-assets.service';
import { ClearswapSwapService } from '@app/features/privacy/providers/clearswap/services/clearswap-swap.service';
import { ClearswapTokensFacadeService } from '@app/features/privacy/providers/clearswap/services/clearswap-tokens-facade.service';
import { ClearswapQuoteAdapter } from '@app/features/privacy/providers/clearswap/utils/clearswap-quote-adapter';
import { PrivateSwapEvent } from '@app/features/privacy/providers/shared-privacy-providers/models/private-event';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
import { BlockchainName, TokenAmount } from '@cryptorubic/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-clearswap-swap-page',
  templateUrl: './clearswap-swap-page.component.html',
  styleUrls: ['./clearswap-swap-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: FromAssetsService, useClass: ClearswapPrivateAssetsService },
    { provide: ToAssetsService, useClass: ClearswapPrivateAssetsService },
    { provide: TokensFacadeService, useClass: ClearswapTokensFacadeService }
  ]
})
export class ClearswapSwapPageComponent {
  public readonly quoteAdapter = new ClearswapQuoteAdapter(
    this.clearswapSwapService,
    this.targetAddressService,
    this.clearswapErrorService
  );

  constructor(
    private readonly clearswapSwapService: ClearswapSwapService,
    private readonly targetAddressService: TargetNetworkAddressService,
    private readonly clearswapErrorService: ClearswapErrorService
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
              this.clearswapSwapService.transfer(
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

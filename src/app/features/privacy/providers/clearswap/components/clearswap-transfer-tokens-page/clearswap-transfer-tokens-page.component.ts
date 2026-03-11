import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ClearswapPrivateActionButtonService } from '@app/features/privacy/providers/clearswap/services/clearswap-private-action-button.service';
import { ClearswapPrivateAssetsService } from '@app/features/privacy/providers/clearswap/services/clearswap-private-assets.service';
import { ClearswapSwapService } from '@app/features/privacy/providers/clearswap/services/clearswap-swap.service';
import { ClearswapTokensFacadeService } from '@app/features/privacy/providers/clearswap/services/clearswap-tokens-facade.service';
import { PrivateEvent } from '@app/features/privacy/providers/shared-privacy-providers/models/private-event';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
import { Token } from '@app/shared/models/tokens/token';
import { BlockchainName, TokenAmount } from '@cryptorubic/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-clearswap-transfer-tokens-page',
  templateUrl: './clearswap-transfer-tokens-page.component.html',
  styleUrls: ['./clearswap-transfer-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: ClearswapPrivateAssetsService },
    { provide: TokensFacadeService, useClass: ClearswapTokensFacadeService },
    { provide: PrivateActionButtonService, useClass: ClearswapPrivateActionButtonService }
  ]
})
export class ClearswapTransferTokensPageComponent {
  constructor(
    private readonly clearswapSwapService: ClearswapSwapService,
    private readonly targetAddressService: TargetNetworkAddressService
  ) {}

  public async transfer({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const { tradeId, tokenAmount: dstTokenAmount } = await this.clearswapSwapService.quote(
        token as TokenAmount<BlockchainName>,
        { ...token } as Token,
        this.targetAddressService.address
      );
      const preview$ = openPreview({
        dstTokenAmount,
        steps: [
          {
            label: 'Transfer tokens',
            action: () =>
              this.clearswapSwapService.transfer(
                tradeId,
                token as TokenAmount<BlockchainName>,
                { ...token } as Token,
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

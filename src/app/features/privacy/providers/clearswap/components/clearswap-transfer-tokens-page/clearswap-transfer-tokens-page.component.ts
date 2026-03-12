import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ClearswapPrivateAssetsService } from '@app/features/privacy/providers/clearswap/services/clearswap-private-assets.service';
import { ClearswapSwapService } from '@app/features/privacy/providers/clearswap/services/clearswap-swap.service';
import { ClearswapTokensFacadeService } from '@app/features/privacy/providers/clearswap/services/clearswap-tokens-facade.service';
import { PrivateEvent } from '@app/features/privacy/providers/shared-privacy-providers/models/private-event';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';

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
    { provide: TokensFacadeService, useClass: ClearswapTokensFacadeService }
  ]
})
export class ClearswapTransferTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  constructor(private readonly clearswapSwapService: ClearswapSwapService) {}

  public async transfer({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const { tradeId, tokenAmount: dstTokenAmount } = await this.clearswapSwapService.quote(
        token as TokenAmount<BlockchainName>,
        { ...token } as Token,
        this.receiverCtrl.value
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
                this.receiverCtrl.value
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
